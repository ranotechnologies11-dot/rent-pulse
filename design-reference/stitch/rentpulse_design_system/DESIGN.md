---
name: RentPulse Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#404946'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707976'
  outline-variant: '#bfc8c5'
  surface-tint: '#30675f'
  primary: '#00322c'
  on-primary: '#ffffff'
  primary-container: '#0c4a42'
  on-primary-container: '#81b9ae'
  inverse-primary: '#99d1c6'
  secondary: '#006d38'
  on-secondary: '#ffffff'
  secondary-container: '#74f9a0'
  on-secondary-container: '#00723a'
  tertiary: '#5e0017'
  on-tertiary: '#ffffff'
  tertiary-container: '#880025'
  on-tertiary-container: '#ff8c94'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b5eee2'
  primary-fixed-dim: '#99d1c6'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#144f47'
  secondary-fixed: '#77fca3'
  secondary-fixed-dim: '#59df89'
  on-secondary-fixed: '#00210d'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  currency-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-tablet: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system embodies a modern, mobile-first proptech aesthetic balancing institutional fintech authority with field-ready operational utility. Built for property managers and landlords handling high-velocity transactions, tenant communication, and ledger tracking, the visual identity radiates solvency, discipline, and uncompromising clarity.

The visual style blends **Corporate / Modern** precision with **Tactile Fintech Ergonomics**:
- **Trustworthy & Authoritative:** Anchored by deep forest teals that evoke long-term financial permanence, avoiding the frivolous or fleeting nature of consumer tech.
- **Action-Oriented & Legible:** High-contrast figures, unmistakable status cues (settled, pending, defaulted), and compact density tailored for one-handed mobile use on the move.
- **Regional & Global Resonance:** Integrates prominent mobile-money signals—notably M-Pesa verification patterns and automated reconciliation cues—into clean, international SaaS standards.

## Colors

The palette is engineered around high functional differentiation, financial validation, and rapid status parsing under bright sunlight:

- **Primary (`#0C4A42` - Deep Emerald Slate):** Establishes primary navigation, active headers, key operational buttons, and core architectural frames. It provides a grounded, stable counterweight to financial data.
- **Secondary (`#00A859` - M-Pesa Green):** Reserved for positive financial events: confirmed rent receipts, instant MPESA reconciliation badges, cashflow growth indicators, and primary checkout or payout actions.
- **Tertiary (`#E11D48` - Coral Crimson):** Strictly allocated to overdue rent, vacant unleased intervals, legal alerts, and tenant default warnings.
- **Warning / Pending (`#D97706` / `#F59E0B` - Warm Amber):** Denotes manual verification steps, partial disbursements, utility arrears, and unresolved maintenance requests.
- **Neutral Palette:**
  - Background Canvas: `#F8FAFC` (Slate 50) and `#F1F5F9` (Slate 100) for structural background layering.
  - Surface Tiers: `#FFFFFF` for data cards, modal sheets, and quick inputs.
  - Borders: Crisp hairline `#E2E8F0` and `#CBD5E1` to demarcate transaction boundaries without heavy shadow reliance.
  - Typography: `#0F172A` (Slate 900) for high-contrast primary text, `#475569` (Slate 600) for metadata, and `#94A3B8` (Slate 400) for inactive labels and micro-copy.

## Typography

Plus Jakarta Sans delivers structural warmth paired with geometric legibility. Its tall x-height and open counters maintain razor-sharp recognition on small mobile viewports.

Key formatting rules:
- **Tabular Figures for Finance:** All ledger amounts, rent figures (e.g., `KES 45,000`), collection rates, and percentages must enable OpenType tabular figures (`font-variant-numeric: tabular-nums;`) to guarantee columnar alignment.
- **Hierarchy Enforcement:** Large numerical balances use `currency-stat` or `headline-lg` paired with a light, tracking-spaced currency descriptor (`KES`).
- **Data Densification:** Metadata pairs (tenant unit, date, SMS receipt references) strictly leverage `body-sm` and `label-md` to preserve visual hierarchy inside cards without visual clutter.

## Layout & Spacing

The layout employs a compact, mobile-optimized fluid grid built to minimize dead scrolling space while maintaining distinct target separation:

- **Mobile Rhythm (4-Column Fluid Grid):**
  - Margins: `1rem` (16px) outer edge-padding to maximize viewport density for property units and ledgers.
  - Column Gutters: `0.75rem` (12px) between parallel stat metrics and dual-column grid cells.
- **Tablet Reflow (8-Column Grid):**
  - Expands margins to `1.5rem` (24px) with `1rem` (16px) gutters; converts nested unit lists into split-screen master-detail views (property listing on left, tenant roster on right).
- **Desktop Adaptation (12-Column Grid):**
  - Constrained dashboard container at a max-width of `1200px` centered with `2.5rem` (40px) outer margins, anchoring side navigation and expansive ledger tables.
- **Spacing Token Usages:**
  - `space-xs` (4px): Micro gaps between status badges and icon dots.
  - `space-sm` (8px): Internal paddings for badges, spacing between text labels and numerical values.
  - `space-md` (12px): Inter-card gap inside transaction stacks and form input internal vertical padding.
  - `space-lg` (16px): Structural card interior padding and layout row separation.
  - `space-xl` (24px): Major section boundaries (e.g., switching from KPI cards to real-time reconciliation logs).

## Elevation & Depth

This design system uses an **ambient, crisp-layering model** combining hairline borders with subtle, low-opacity directional shadows. Surfaces communicate hierarchy through elevation without muddying financial readability.

- **Level 0 (Flat Canvas):** `#F8FAFC` base background.
- **Level 1 (Card & Module Surface):** `#FFFFFF` fill with a `1px solid #E2E8F0` border and an ambient downward drop: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05);`.
- **Level 2 (Interactive Floating & Active Cards):** Used for elevated summary headers and focused rent cards: `box-shadow: 0 4px 6px -1px rgba(12, 74, 66, 0.08), 0 2px 4px -2px rgba(12, 74, 66, 0.04);` with a slightly deepened `#CBD5E1` border.
- **Level 3 (Bottom Sheets & Drawers):** For quick action drawers, payment allocation sheets, and unit filters: `box-shadow: 0 -4px 24px 0 rgba(15, 23, 42, 0.12);` accompanied by a backdrop overlay of `rgba(15, 23, 42, 0.4)` with 4px backdrop blur.
- **Level 4 (Floating Action Buttons & Notifications):** High-prominence overlays: `box-shadow: 0 10px 15px -3px rgba(12, 74, 66, 0.2), 0 4px 6px -4px rgba(12, 74, 66, 0.1);`.

## Shapes

The shape system adopts **Level 2 (Rounded)** curvature. This delivers soft tactile touchpoints without feeling childlike or losing tabular structure:

- **Base Corner Radius (`0.5rem` / 8px):** Applied to form fields, transaction list rows, dropdown menus, and standard utility buttons.
- **Medium/Large Radius (`rounded-lg` - `1rem` / 16px):** Applied to root KPI cards, M-Pesa transaction containers, property preview thumbnails, and modal sheets.
- **Sheet Radius (`rounded-xl` - `1.5rem` / 24px):** Reserved for top corners of mobile slide-up bottom sheets and full-width property overview modules.
- **Full Pill (`rounded-full`):** Reserved strictly for compact status badges (e.g., "Paid", "Overdue", "Partial"), numerical counter pills, and floating action button geometries.

## Components

### Buttons
- **Primary Action:** Solid `#0C4A42` fill with `#FFFFFF` text, `0.5rem` border radius, min-height 48px for finger tap-targets. Hover/pressed state shifts to `#08322B`.
- **Secondary / M-Pesa Quick Action:** Solid `#00A859` fill with `#FFFFFF` text, used specifically for "Reconcile Payment", "Request Rent via STK Push", or "Record Payout".
- **Ghost / Outlined:** Transparent fill, `1.5px solid #CBD5E1` border, `#0F172A` text.
- **Danger / Eviction Alert Action:** Light tinted `#FFF1F2` background with `#E11D48` text and border for sensitive landlord decisions.

### Status Badges & Chips
- Designed as pills (`rounded-full`) with uppercase tracking (`label-sm`):
  - **Paid / Confirmed:** Background `#ECFDF5`, text `#065F46`, border `#A7F3D0`. Includes a 6px green indicator dot.
  - **Overdue:** Background `#FFF1F2`, text `#9F1239`, border `#FECDD3`.
  - **Pending / In Review:** Background `#FFFBEB`, text `#92400E`, border `#FDE68A`.
  - **Vacant:** Background `#F1F5F9`, text `#475569`, border `#CBD5E1`.

### Transaction Cards & M-Pesa Feed
- Contained in a white surface card with `1rem` radius.
- Left-hand accent bar: A 4px vertical indicator border colored matching the status (Green `#00A859` for received, Red `#E11D48` for arrears).
- Displays tenant name, unit identifier (`Unit 4B - Kilimani Court`), bold amount with tabular figures, and an SMS reference snippet box (e.g., `Ref: QKC4871...`) in a shaded monospaced tag.

### KPI Stat Cards
- Layout with metric value (`currency-stat`), labeled with secondary text above it.
- Top-right corner holds a pill badge displaying growth/delta metric (e.g., `+12.4% vs last mo`).
- Bottom section contains a micro progress bar indicating collected vs. expected rent for the active cycle.

### Form Inputs & Selectors
- Background `#FFFFFF`, border `1.5px solid #CBD5E1`, text `#0F172A`, height 48px.
- Focus state: `1.5px solid #0C4A42` with a `0 0 0 3px rgba(12, 74, 66, 0.15)` focus ring.
- Mobile numeric inputs for currency default directly to financial decimal keypads with hardcoded `KES` prefix adorner.

### Quick Action Bottom Sheet
- Draggable modal surface docked to screen bottom with a centered pill drag handle (`#CBD5E1`, 36px x 4px).
- Houses one-tap landlord shortcuts: "Send SMS Rent Reminders", "Trigger STK Push", "Log Maintenance Expense", "Add New Lease".

### Mobile-First Navigation Bar
- Fixed bottom persistent navigation docked at viewport bottom with 64px height + safe area inset.
- High-contrast icons with 4-item maximum distribution: Properties, Tenants, Collections/Ledger, and Profile. Active state uses `#0C4A42` with an ambient indicator pip.