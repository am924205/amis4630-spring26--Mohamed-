# ADR 0001: Technology Stack Selection

## Status
Accepted

## Decision

Frontend: React (TypeScript)  
Backend: .NET Web API  
Database: PostgreSQL  

## Context

Milestone 1 identified major pain points:
- Scattered listings
- Poor communication
- Lack of trust and verification
- No transaction tracking

The system must support structured browsing, messaging, authentication, moderation, and transactions.

## Rationale

React allows modular UI components and fast iteration.

.NET Web API supports REST endpoints and clean backend structure aligned with course architecture.

PostgreSQL supports relational marketplace data (users, listings, messages, reviews, reports).

## AI Usage Log

Tool Used: ChatGPT  
Purpose: Compared frontend and backend stack options and summarized tradeoffs.  
Final decision was made by the developer based on course requirements and simplicity.
