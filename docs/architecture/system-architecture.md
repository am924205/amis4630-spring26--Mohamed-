# System Architecture (High-Level)

## Overview

Buckeye Marketplace is a full-stack web application built with:

- React (Frontend)
- .NET Web API (Backend)
- PostgreSQL (Database)
- Cloud Hosting (Frontend + API + DB)

---

## Architecture Diagram

```mermaid
flowchart LR
  U[Student User] --> FE[React Frontend]
  FE -->|HTTPS REST API| API[.NET Web API]
  API --> DB[(PostgreSQL Database)]
  API --> STORAGE[(Image Storage)]
  API --> AUTH[OSU Email Authentication]
  API --> ADMIN[Admin Moderation Tools]

