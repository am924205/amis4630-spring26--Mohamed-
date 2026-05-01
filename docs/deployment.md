# Buckeye Marketplace — Deployment Guide

This is the runbook for deploying the application to Azure and connecting the GitHub Actions pipelines. It mirrors the lab deployment workshop steps and adds the specifics this project needs.

> Live URLs:
> - Frontend: https://agreeable-field-09f60e210.7.azurestaticapps.net
> - Backend API: https://buckeye-api-mohamed560560.azurewebsites.net

---

## 1. Prerequisites

- Active **Azure for Students** subscription (`portal.azure.com`).
- **Azure CLI** installed (`az --version`).
- The repo cloned locally with `dotnet build` and `npm run build` working.
- A GitHub account with write access to `am924205/amis4630-spring26--Mohamed-`.

Resource naming conventions used below:

| Resource             | Name                              |
|----------------------|-----------------------------------|
| Resource group       | `rg-buckeye-marketplace`          |
| SQL server           | `buckeye-sql-mohamed560`             |
| SQL database         | `BuckeyeMarketplaceDb`            |
| App Service plan     | `buckeye-plan` (Linux, F1)        |
| App Service (API)    | `buckeye-api-mohamed560`             |
| Static Web App (FE)  | `buckeye-marketplace-mohamed560`  |

---

## 2. Provision the resource group

```bash
az login
az group create --name rg-buckeye-marketplace --location eastus
```

## 3. Provision Azure SQL Database

Read the SQL admin password into a shell variable so it doesn't end up in shell history.

```bash
read -rs SQL_PW && echo

az sql server create \
  --name buckeye-sql-mohamed560 \
  --resource-group rg-buckeye-marketplace \
  --location eastus \
  --admin-user sqladmin \
  --admin-password "$SQL_PW"

az sql db create \
  --name BuckeyeMarketplaceDb \
  --resource-group rg-buckeye-marketplace \
  --server buckeye-sql-mohamed560 \
  --service-objective Basic

# Allow Azure services through the firewall (App Service connects from Azure).
az sql server firewall-rule create \
  --resource-group rg-buckeye-marketplace \
  --server buckeye-sql-mohamed560 \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

Build the connection string:

```text
Server=tcp:buckeye-sql-mohamed560.database.windows.net,1433;
Initial Catalog=BuckeyeMarketplaceDb;
Persist Security Info=False;
User ID=sqladmin;
Password=<your password>;
MultipleActiveResultSets=False;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

This connection string only ever lives in App Service → Connection strings (Step 5). It is **not** committed to the repo.

## 4. Provision App Service for the API

```bash
az appservice plan create \
  --name buckeye-plan \
  --resource-group rg-buckeye-marketplace \
  --sku F1 \
  --is-linux

az webapp create \
  --name buckeye-api-mohamed560 \
  --resource-group rg-buckeye-marketplace \
  --plan buckeye-plan \
  --runtime "DOTNETCORE:10.0"
```

If `az webapp create` complains about an unknown runtime, run `az webapp list-runtimes --os linux | grep -i dotnet` and use the exact string returned (e.g. `DOTNETCORE:10.0`).

## 5. Configure App Service settings

Read the JWT key interactively:

```bash
read -rs CONN_STR && echo
read -rs JWT_KEY && echo

# Connection string — registered as a SQLAzure connection string so EF Core picks it up.
az webapp config connection-string set \
  --name buckeye-api-mohamed560 \
  --resource-group rg-buckeye-marketplace \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="$CONN_STR"

# Application settings (runtime config + secrets).
az webapp config appsettings set \
  --name buckeye-api-mohamed560 \
  --resource-group rg-buckeye-marketplace \
  --settings \
    Jwt__Key="$JWT_KEY" \
    Jwt__Issuer="https://buckeye-api-mohamed560560.azurewebsites.net" \
    Jwt__Audience="https://buckeye-api-mohamed560560.azurewebsites.net" \
    Jwt__ExpiresMinutes="120" \
    Cors__AllowedOrigins__0="https://agreeable-field-09f60e210.7.azurestaticapps.net" \
    ASPNETCORE_ENVIRONMENT="Production"
```

> Why both forms of the connection string config exist: the `Default`/`DefaultConnection` lookup in `Program.cs` accepts either name, and Azure prefixes the value at runtime with `SQLAZURECONNSTR_`. Setting it as a SQL Azure connection string (not an app setting) is what makes the prefix happen.

## 6. Deploy the API the first time (manual smoke test)

```bash
cd api
dotnet publish -c Release -o ./publish
(cd publish && zip -r ../deploy.zip .)

az webapp deploy \
  --name buckeye-api-mohamed560 \
  --resource-group rg-buckeye-marketplace \
  --src-path deploy.zip \
  --type zip
```

Verify: `https://buckeye-api-mohamed560560.azurewebsites.net/api/products` should return JSON. If it 500s, open the App Service → Log Stream — the most common cause is a typo in the connection string.

## 7. Provision the Static Web App

The simplest path is to use the Azure Portal:

1. Create a Resource → search **Static Web App** → Create.
2. Resource group: `rg-buckeye-marketplace`. Name: `buckeye-marketplace-mohamed560`. Plan: Free. Region: closest to East US.
3. Deployment source: **GitHub**. Authorize Azure to read your repo.
4. Repo: `am924205/amis4630-spring26--Mohamed-`. Branch: `main`. Build presets: **Custom**.
5. App location: `frontend`. Output location: `build`. App build command: `npm run build`. (Fields available depending on the preset.)
6. Save. Azure auto-creates a workflow file in `.github/workflows/azure-static-web-apps-...yml` and pushes it to your repo. **Pull that commit down before continuing.**
7. In the SWA → Configuration → Application settings, add `REACT_APP_API_URL=https://buckeye-api-mohamed560560.azurewebsites.net` so the build picks it up.

If you'd rather use my custom workflow instead of the auto-generated one, delete the auto-generated file and copy the API token Azure created (Settings → Manage deployment token) into a GitHub repo secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`. The committed workflow at `.github/workflows/deploy-frontend.yml` will pick it up.

## 8. Wire up the GitHub Actions workflows

```bash
# Pull the API publish profile.
az webapp deployment list-publishing-profiles \
  --name buckeye-api-mohamed560 \
  --resource-group rg-buckeye-marketplace \
  --xml
```

Treat the publish profile XML like a password.

In GitHub → Settings → Secrets and variables → Actions, add:

| Name                                | Value                                                          |
|-------------------------------------|----------------------------------------------------------------|
| `AZURE_API_PUBLISH_PROFILE`         | The full XML returned by the command above                     |
| `AZURE_STATIC_WEB_APPS_API_TOKEN`   | The deployment token from the Static Web App resource          |

Optional repository variable (Settings → Actions → Variables):

| Name                | Value                                                       |
|---------------------|-------------------------------------------------------------|
| `REACT_APP_API_URL` | `https://buckeye-api-mohamed560560.azurewebsites.net`             |

Push to `main`. Watch the Actions tab. Both workflows should go green:

- `Deploy API to Azure` → builds, runs `dotnet test`, publishes, deploys to App Service.
- `Deploy Frontend to Azure Static Web Apps` → builds, runs `npm test`, builds the bundle, uploads.
- `CI` → runs build + test for both projects on every PR.

---

## 9. Verify the deployment

```bash
# API
curl -s https://buckeye-api-mohamed560560.azurewebsites.net/api/products | head

# Frontend
open https://agreeable-field-09f60e210.7.azurestaticapps.net
```

Sign in with `admin@buckeyemarketplace.com` / `Admin123!` and run through the test plan in [docs/test-plan.md](test-plan.md).

---

## 10. Cleanup (after grading)

After Milestone 6 is graded, free up the Azure for Students credit:

```bash
az group delete --name rg-buckeye-marketplace --yes --no-wait
```

This removes the SQL server, database, App Service plan, App Service, and the Static Web App. Do not run this until grading is complete.
