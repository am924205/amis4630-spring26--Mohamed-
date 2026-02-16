# Database ERD (High-Level)

## Overview

This diagram shows the core entities for Buckeye Marketplace and how they relate.

---

## Entity Relationship Diagram

```mermaid
erDiagram

  USER ||--o{ LISTING : creates
  USER ||--o{ MESSAGE : sends
  USER ||--o{ REVIEW : writes
  USER ||--o{ REPORT : submits
  USER ||--o{ TRANSACTION : buyer
  USER ||--o{ TRANSACTION : seller

  LISTING ||--o{ MESSAGE : related_to
  LISTING ||--o{ REVIEW : receives
  LISTING ||--o{ REPORT : reported_in
  LISTING ||--o{ TRANSACTION : results_in

  USER {
    string userId
  }

  LISTING {
    string listingId
  }

  MESSAGE {
    string messageId
  }

  REVIEW {
    string reviewId
  }

  REPORT {
    string reportId
  }

  TRANSACTION {
    string transactionId
  }
