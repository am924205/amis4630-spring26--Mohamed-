# Product Catalog Component Architecture (Atomic Design)

## Overview

This component hierarchy defines the frontend foundation for the Product Catalog feature using Atomic Design principles.

---

# Atoms

Smallest reusable UI elements:

- Button
- Input
- Select
- Text
- Badge
- Icon
- Card

---

# Molecules

Simple combinations of atoms:

- SearchBar (Input + Button)
- FilterChip (Badge + Icon)
- PriceTag (Text + Badge)
- RatingStars (Icons + Text)

---

# Organisms

More complex UI blocks composed of molecules and atoms:

- ListingCard (Card + PriceTag + RatingStars + Button)
- FilterPanel (Select inputs + FilterChips)
- ProductGrid (Collection of ListingCard components)
- PaginationControls (Buttons + Text)

---

# Templates

Page structure layout:

- CatalogLayout (Header + SearchBar + FilterPanel + ProductGrid)

---

# Pages

- ProductCatalogPage (Uses CatalogLayout and connects to API for listing data)

---

## Why This Matters

Atomic Design ensures:

- Reusable components
- Scalable UI structure
- Clean separation of concerns
- Easier future expansion
