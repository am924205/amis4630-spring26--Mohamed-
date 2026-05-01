#!/usr/bin/env bash
# Buckeye Marketplace — one-shot Azure deployment script.
# Provisions resource group, Azure SQL, App Service (API), Static Web App (frontend),
# configures all settings, deploys both apps, and prints the live URLs.
#
# Run from the project root:
#   bash scripts/deploy-azure.sh

set -euo pipefail

# ---------- Configuration ----------
# We try several regions in order; some Azure for Students subscriptions only
# allow a "best available" subset. The first region that accepts the SQL server
# is used for ALL subsequent resources.
REGION_CANDIDATES=("eastus" "centralus" "westus2" "westus3" "southcentralus" "westeurope" "northeurope")
LOCATION=""   # populated by region-probe below or read from existing SQL server
RG="rg-buckeye-marketplace"
SUFFIX="${SUFFIX:-mohamed560}"
SQL_SERVER="${SQL_SERVER:-buckeye-sql-${SUFFIX}}"
SQL_DB="BuckeyeMarketplaceDb"
SQL_ADMIN="sqladmin"
PLAN="buckeye-plan-${SUFFIX}"
WEBAPP="buckeye-api-${SUFFIX}"
SWA="buckeye-marketplace-${SUFFIX}"

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# ---------- Helpers ----------
say() { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
ok()  { printf "\033[1;32m✓\033[0m %s\n" "$*"; }

# ---------- Pre-flight ----------
say "Checking prerequisites..."
command -v az >/dev/null || { echo "Azure CLI not installed."; exit 1; }
command -v dotnet >/dev/null || { echo ".NET SDK not installed."; exit 1; }
command -v npm >/dev/null || { echo "npm not installed."; exit 1; }
command -v zip >/dev/null || { echo "zip not installed."; exit 1; }
ok "All required tools found."

az account show --query name -o tsv >/dev/null || { echo "Run 'az login' first."; exit 1; }
ACCT=$(az account show --query name -o tsv)
ok "Signed in to: $ACCT"

# ---------- Inputs ----------
say "We'll need a SQL admin password (8+ chars, mix of upper/lower/digit/symbol)."
read -rsp "Enter SQL admin password: " SQL_PW
echo
read -rsp "Confirm SQL admin password: " SQL_PW_CONFIRM
echo
[[ "$SQL_PW" == "$SQL_PW_CONFIRM" ]] || { echo "Passwords don't match."; exit 1; }

# Auto-generate a JWT signing key (no user input needed).
JWT_KEY=$(openssl rand -base64 48 | tr -d '\n=' | tr '+/' '-_')

# ---------- Resource group ----------
if az group show --name "$RG" -o none 2>/dev/null; then
  EXISTING_LOC=$(az group show --name "$RG" --query location -o tsv)
  say "Resource group $RG already exists in $EXISTING_LOC; reusing."
else
  say "Creating resource group $RG in $LOCATION..."
  az group create --name "$RG" --location "$LOCATION" -o none
fi
ok "Resource group ready."

# ---------- SQL ----------
# If the SQL server already exists (created via portal), reuse it.
EXISTING_SQL_LOC=$(az sql server show --name "$SQL_SERVER" --resource-group "$RG" --query location -o tsv 2>/dev/null || true)
if [[ -n "$EXISTING_SQL_LOC" ]]; then
  LOCATION="$EXISTING_SQL_LOC"
  say "SQL server $SQL_SERVER already exists in $LOCATION; reusing."
else
  say "Probing regions for SQL server availability (subscription may restrict regions)..."
  for region in "${REGION_CANDIDATES[@]}"; do
    printf "  Trying %s... " "$region"
    if az sql server create \
         --name "$SQL_SERVER" \
         --resource-group "$RG" \
         --location "$region" \
         --admin-user "$SQL_ADMIN" \
         --admin-password "$SQL_PW" -o none 2>/dev/null; then
      LOCATION="$region"
      echo "accepted."
      break
    else
      echo "rejected."
    fi
  done
  if [[ -z "$LOCATION" ]]; then
    echo "ERROR: No candidate region accepted the SQL server. Create it via the Azure Portal,"
    echo "       then re-run this script with SQL_SERVER=<server-name> bash scripts/deploy-azure.sh"
    exit 1
  fi
fi
ok "SQL server ready in $LOCATION."

if az sql db show --name "$SQL_DB" --server "$SQL_SERVER" --resource-group "$RG" -o none 2>/dev/null; then
  say "SQL database $SQL_DB already exists; reusing."
else
  say "Creating SQL database $SQL_DB (Basic tier)..."
  az sql db create \
    --name "$SQL_DB" \
    --resource-group "$RG" \
    --server "$SQL_SERVER" \
    --service-objective Basic -o none
fi
ok "SQL database ready."

say "Ensuring Azure services can reach the SQL server (firewall rule)..."
az sql server firewall-rule create \
  --resource-group "$RG" \
  --server "$SQL_SERVER" \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0 -o none 2>/dev/null || true
ok "SQL firewall configured."

# ---------- App Service ----------
if az appservice plan show --name "$PLAN" --resource-group "$RG" -o none 2>/dev/null; then
  say "App Service plan $PLAN already exists; reusing."
else
  say "Creating App Service plan $PLAN (F1 Linux)..."
  az appservice plan create \
    --name "$PLAN" \
    --resource-group "$RG" \
    --sku F1 \
    --is-linux -o none
fi
ok "App Service plan ready."

if az webapp show --name "$WEBAPP" --resource-group "$RG" -o none 2>/dev/null; then
  say "Web App $WEBAPP already exists; reusing."
else
  say "Creating Web App $WEBAPP..."
  az webapp create \
    --name "$WEBAPP" \
    --resource-group "$RG" \
    --plan "$PLAN" \
    --runtime "DOTNETCORE:10.0" -o none
fi
ok "Web App ready: https://${WEBAPP}.azurewebsites.net"

# ---------- App Service config ----------
SQL_CONN="Server=tcp:${SQL_SERVER}.database.windows.net,1433;Initial Catalog=${SQL_DB};Persist Security Info=False;User ID=${SQL_ADMIN};Password=${SQL_PW};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

say "Setting connection string..."
az webapp config connection-string set \
  --name "$WEBAPP" \
  --resource-group "$RG" \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="$SQL_CONN" -o none
ok "Connection string set."

# ---------- Static Web App (created early so we know its URL for CORS) ----------
# SWA Free tier is only available in a small set of regions.
SWA_REGION="centralus"
case "$LOCATION" in
  westus2|westus3) SWA_REGION="westus2" ;;
  eastus|eastus2) SWA_REGION="eastus2" ;;
  westeurope|northeurope) SWA_REGION="westeurope" ;;
  *) SWA_REGION="centralus" ;;
esac

if az staticwebapp show --name "$SWA" --resource-group "$RG" -o none 2>/dev/null; then
  say "Static Web App $SWA already exists; reusing."
else
  say "Creating Azure Static Web App $SWA in $SWA_REGION..."
  az staticwebapp create \
    --name "$SWA" \
    --resource-group "$RG" \
    --location "$SWA_REGION" \
    --sku Free -o none
fi
SWA_URL=$(az staticwebapp show --name "$SWA" --resource-group "$RG" --query defaultHostname -o tsv)
ok "Static Web App ready: https://${SWA_URL}"

say "Setting JWT settings, CORS, and ASPNETCORE_ENVIRONMENT on the API..."
az webapp config appsettings set \
  --name "$WEBAPP" \
  --resource-group "$RG" \
  --settings \
    "Jwt__Key=$JWT_KEY" \
    "Jwt__Issuer=https://${WEBAPP}.azurewebsites.net" \
    "Jwt__Audience=https://${WEBAPP}.azurewebsites.net" \
    "Jwt__ExpiresMinutes=120" \
    "Cors__AllowedOrigins__0=https://${SWA_URL}" \
    "ASPNETCORE_ENVIRONMENT=Production" -o none
ok "Application settings configured."

# ---------- Deploy API ----------
say "Building and publishing the .NET API..."
rm -rf api/publish api/deploy.zip
dotnet publish api/BuckeyeMarketplaceApi.csproj -c Release -o api/publish >/dev/null
( cd api/publish && zip -qr ../deploy.zip . )
ok "API published to api/deploy.zip ($(du -sh api/deploy.zip | cut -f1))"

say "Deploying API to App Service (this takes ~2 min)..."
az webapp deploy \
  --name "$WEBAPP" \
  --resource-group "$RG" \
  --src-path api/deploy.zip \
  --type zip -o none
ok "API deployed."

# ---------- Build & deploy frontend ----------
say "Building React frontend with production API URL..."
( cd frontend && npm ci --silent && REACT_APP_API_URL="https://${WEBAPP}.azurewebsites.net" CI=false npm run build --silent >/dev/null )
ok "Frontend built into frontend/build."

say "Fetching SWA deployment token..."
SWA_TOKEN=$(az staticwebapp secrets list --name "$SWA" --resource-group "$RG" --query "properties.apiKey" -o tsv)
ok "SWA deployment token retrieved."

say "Deploying frontend to Static Web Apps..."
if ! command -v swa >/dev/null; then
  npm install -g @azure/static-web-apps-cli >/dev/null 2>&1
fi
( cd frontend && swa deploy ./build --deployment-token "$SWA_TOKEN" --env production )
ok "Frontend deployed."

# ---------- Output ----------
say "Saving Azure secrets and URLs to scripts/.azure-output (gitignored)..."
mkdir -p scripts
cat > scripts/.azure-output <<EOF
# Buckeye Marketplace — Azure deployment outputs
# Generated $(date)
# DO NOT COMMIT THIS FILE.

API URL:        https://${WEBAPP}.azurewebsites.net
Frontend URL:   https://${SWA_URL}
Swagger:        https://${WEBAPP}.azurewebsites.net/swagger
Resource group: ${RG}
SQL server:     ${SQL_SERVER}.database.windows.net
SQL database:   ${SQL_DB}
SQL admin:      ${SQL_ADMIN}
Webapp name:    ${WEBAPP}
SWA name:       ${SWA}
SWA deploy token (keep secret): ${SWA_TOKEN}
JWT key (already set on App Service): ${JWT_KEY}
EOF
ok "Wrote scripts/.azure-output"

# Add the output file to .gitignore if not already present
if ! grep -q "^scripts/.azure-output$" .gitignore 2>/dev/null; then
  echo "scripts/.azure-output" >> .gitignore
fi

cat <<EOF

============================================================
Deployment complete!

Frontend: https://${SWA_URL}
API:      https://${WEBAPP}.azurewebsites.net
Swagger:  https://${WEBAPP}.azurewebsites.net/swagger

Test login (seeded by the API on first request):
  Admin:   admin@buckeyemarketplace.com / Admin123!
  User:    user@buckeyemarketplace.com / User1234!

Open the frontend in your browser to confirm everything works.

A summary was written to scripts/.azure-output (gitignored).
============================================================
EOF
