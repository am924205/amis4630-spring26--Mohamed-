# Database ERD (Updated for Milestone 6)

## Overview

The schema deployed to Azure SQL Database in Milestone 6 reflects the Identity, cart, and order tables built across Milestones 4 and 5. Identity tables (`AspNetRoles`, `AspNetRoleClaims`, `AspNetUserClaims`, `AspNetUserLogins`, `AspNetUserTokens`) are created by ASP.NET Core Identity and are omitted from the diagram for clarity; the only ones shown are the user table (`AspNetUsers`, modeled here as `USER`) and the join `USER_ROLE` (`AspNetUserRoles`).

---

## Entity Relationship Diagram

```mermaid
erDiagram

  USER ||--o| CART : owns
  USER ||--o{ ORDER : places
  USER }o--o{ USER_ROLE : has
  ROLE }o--o{ USER_ROLE : assigned_to

  CART ||--o{ CART_ITEM : contains
  PRODUCT ||--o{ CART_ITEM : referenced_by

  ORDER ||--o{ ORDER_ITEM : contains
  PRODUCT ||--o{ ORDER_ITEM : referenced_by

  USER {
    string Id PK
    string UserName
    string Email
    string DisplayName
    string PasswordHash
  }

  ROLE {
    string Id PK
    string Name
  }

  USER_ROLE {
    string UserId FK
    string RoleId FK
  }

  PRODUCT {
    int Id PK
    string Title
    string Description
    decimal Price
    string Category
    string SellerName
    datetime PostedDate
    string ImageUrl
  }

  CART {
    int Id PK
    string UserId FK
    datetime CreatedAt
    datetime UpdatedAt
  }

  CART_ITEM {
    int Id PK
    int CartId FK
    int ProductId FK
    int Quantity
  }

  ORDER {
    int Id PK
    string UserId FK
    string ConfirmationNumber
    datetime OrderDate
    string Status
    decimal Total
    string ShippingAddress
  }

  ORDER_ITEM {
    int Id PK
    int OrderId FK
    int ProductId FK
    int Quantity
    decimal UnitPrice
  }
```

---

## Notes

- `Cart.UserId` is unique per user (each user has at most one open cart) and is set from the JWT subject claim, never from the request body.
- `Order.UserId` is set the same way at order placement; subsequent reads scope by JWT user id (mitigates BOLA).
- `OrderItem.UnitPrice` snapshots the price at order time, so price edits to `Product` do not affect placed orders.
- Cascade delete is configured between `Cart → CartItem` and `Order → OrderItem`. `Product → CartItem` and `Product → OrderItem` are configured restrict so deleting a product cannot orphan paid orders.
