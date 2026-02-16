# ADR 0003: Cloud Deployment Strategy

## Status
Accepted

## Decision

Frontend: Static hosting (Netlify or Azure Static Web Apps)  
Backend: Azure App Service (or equivalent)  
Database: Managed PostgreSQL cloud service  

## Context

Milestone 2 requires cloud deployment planning.

The system must support public web access and scalable backend hosting.

## Rationale

Separating frontend and backend:

- Improves scalability
- Simplifies deployment
- Aligns with industry best practices

Managed PostgreSQL reduces operational complexity.

## AI Usage Log

Tool Used: ChatGPT  
Purpose: Generated deployment option comparisons for student-scale projects.  
Final selection documented by the developer.
