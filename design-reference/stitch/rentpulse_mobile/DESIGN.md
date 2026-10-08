---
name: RentPulse Mobile
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393f'
  surface-container-lowest: '#0c0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e2025'
  surface-container-high: '#282a2f'
  surface-container-highest: '#33353a'
  on-surface: '#e2e2e9'
  on-surface-variant: '#bbc9cf'
  inverse-surface: '#e2e2e9'
  inverse-on-surface: '#2e3036'
  outline: '#859399'
  outline-variant: '#3c494e'
  surface-tint: '#47d6ff'
  primary: '#a5e7ff'
  on-primary: '#003543'
  primary-container: '#00d2ff'
  on-primary-container: '#00566a'
  inverse-primary: '#00677f'
  secondary: '#b4c5ff'
  on-secondary: '#002a78'
  secondary-container: '#0053db'
  on-secondary-container: '#cdd7ff'
  tertiary: '#69f6b9'
  on-tertiary: '#003824'
  tertiary-container: '#48d99e'
  on-tertiary-container: '#005b3d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b6ebff'
  primary-fixed-dim: '#47d6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#111318'
  on-background: '#e2e2e9'
  surface-variant: '#33353a'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: '0'
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.02em
  label-data-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-precision, dual-theme property management and fintech aesthetic designed for automated rent collection, real-time tenant tracking, and instant mobile money reconciliation. 

### Brand Personality & Emotional Response
- **Unwavering Trust & Precision:** Balances institutional banking security with agile mobile operations. Interfaces feel surgical, immediate, and mathematically organized.
- **Electric Utility:** High-contrast accents guide the eye to financial velocity (pending payments, reconciled ledgers, active leases) without causing visual fatigue.
- **African Fintech Fluency:** Engineered to highlight real-time transaction processing, M-Pesa receipts, and automated landlord payouts with deliberate clarity.

### Visual Style
A hybrid of **Tonal Minimalism** and **Technical Surface Architecture**:
- In **Dark Mode**, deep multi-tiered charcoals provide immense contrast without the harshness of pure black, illuminated by electric cyan and cobalt indicators.
- In **Light Mode**, crisp stark white paper-plane card surfaces sit on cool slate backgrounds, anchored by deep slate-900 typography and saturated emerald/cobalt status points.
- Surfaces use ultra-subtle 1px micro-borders to maintain edge definition across OLED panels and varying display calibratons.

## Colors

The system uses a calibrated dual-theme color architecture optimized for financial readouts, status verification, and dark-to-light balance.

### Theme Palette Architectures

#### Dark Theme (Default)
- **Background Base:** `#111318` (Deep Charcoal Black)
- **Surface Level 1 (Cards, Lists):** `#181B22` (Graphite Sheet)
- **Surface Level 2 (Modals, Inputs, Elevated Pills):** `#1F242D` (Tonal Elevation)
- **Border / Hairlines:** `#28303F` (15% opacity state) and `#334155` (30% structural outline)
- **Primary Text:** `#F8FAFC` (Slate 50)
- **Secondary / Subdued Text:** `#94A3B8` (Slate 400)
- **Muted Text / Placeholders:** `#64748B` (Slate 500)
- **Primary Accent:** `#00D2FF` (Electric Cyan – active states, focused tabs, live toggles)
- **Secondary Accent:** `#2563EB` (Cobalt Royal – primary CTAs, master action buttons)
- **Fintech Accent:** `#10B981` (M-Pesa Emerald – positive cashflow, reconciled payments, confirmed receipts)
- **Warning / Alert:** `#F59E0B` (Amber – late rent grace periods)
- **Critical / Debt:** `#EF4444` (Crimson – overdue invoices, bounced payments)

#### Light Theme
- **Background Base:** `#F8FAFC` (Cool Slate 50)
- **Surface Level 1 (Cards, Lists):** `#FFFFFF` (Pure White)
- **Surface Level 2 (Inputs, Segmented Controls):** `#F1F5F9` (Slate 100)
- **Border / Hairlines:** `#E2E8F0` (Slate 200)
- **Primary Text:** `#0F172A` (Slate 900)
- **Secondary Text:** `#475569` (Slate 600)
- **Muted Text / Placeholders:** `#94A3B8` (Slate 400)
- **Primary Accent:** `#0284C7` (Sky 600 – calibrated cyan for white backdrops)
- **Secondary Accent:** `#1D4ED8` (Rich Cobalt)
- **Fintech Accent:** `#059669` (Emerald 600)
- **Warning:** `#D97706` (Amber 600)
- **Critical:** `#DC2626` (Red 600)

### Financial Semantic Rules
- Never use `#10B981` or `#059669` purely for decorative UI; reserve emerald for verified income, completed reconciliations, and instant mobile deposits.
- Cyan/Sky tokens indicate active system status, sync connectivity, and interactive filters.
- Primary buttons in both modes utilize the Cobalt `#2563EB` / `#1D4ED8` spectrum to deliver institutional weight.

## Typography

The typographic hierarchy fuses three specialized typefaces to balance fintech authority, high-density legibility, and technical accuracy:

1. **Headlines (`Space Grotesk`):** Modern geometric grotesk with subtle technical cuts. Delivers a punchy, contemporary property-tech presence for hero summaries, ledger headlines, and property balances.
2. **Body (`Manrope`):** Ultra-clear geometric sans optimized for interface copy, status descriptions, tenant records, and forms. Neutral enough to ensure effortless reading across high-density lists.
3. **Data & Identifiers (`JetBrains Mono`):** Dedicated to numerical values, M-Pesa transaction codes (e.g., `QA45TY891`), currency amounts, unit numbers, and timestamps. Monospacing ensures columns and sums align vertically without horizontal drift.

### Type Rules
- All currency readouts and metric cards pair `Space Grotesk` or `JetBrains Mono` with tabular lining figures.
- `label-caps` is always rendered uppercase to categorize ledger sections (e.g., `TOTAL RECEIVABLES`, `ESCALATION STATUS`, `ACTIVE UNITS`).

## Layout & Spacing

The layout is built around a rigorous 4px baseline grid tailored for compact mobile views, expandable to tablet and administrative web views.

### Screen Grids & Breakpoints
- **Mobile (Base, 360px - 480px):** 4-column layout, 16px (`1rem`) outer margins, 16px (`1rem`) gutters. Content cards generally span full width (4 columns) to maximize readable area for transactional rows.
- **Tablet (481px - 834px):** 8-column layout, 24px outer margins, 16px gutters. Dashboard widgets split into 2-column or 4-column cards.
- **Desktop (835px+):** 12-column max-width 1200px container, 32px margins, 24px gutters.

### Component Spacing Rules
- **Inner Card Padding:** Standard cards use `1rem` (`space-md`). Dense operational items (tenant sub-rows, mini payment receipts) drop to `0.75rem`.
- **Vertical Rhythm:** Stack related input groups with `0.5rem` (`space-sm`) gaps, stack discrete sections with `1.5rem` (`space-lg`), and isolate bottom sheet primary actions with `2rem` (`space-xl`).

## Elevation & Depth

Visual hierarchy uses a calibrated stack of tonal surfaces, low-contrast micro-borders, and diffused ambient light.

### Dark Mode Elevation Philosophy
Dark mode relies on luminance steps rather than harsh drop shadows:
- **Canvas (`#111318`):** Deepest background.
- **Level 1 Surface (`#181B22`):** Primary tenant cards, metric summaries, side drawers. Border: 1px solid `rgba(255, 255, 255, 0.05)`.
- **Level 2 Surface (`#1F242D`):** Active selections, modals, dropdown items, swipe-action revelations. Border: 1px solid `rgba(255, 255, 255, 0.08)`.
- **Level 3 (Floating Action & Overlays):** `#252B37` with an ambient glow shadow: `0px 12px 32px -4px rgba(0, 210, 255, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.5)`.

### Light Mode Elevation Philosophy
Light mode relies on pristine white structural surfaces over cool gray canvas:
- **Canvas (`#F8FAFC`):** Slate foundation.
- **Level 1 Surface (`#FFFFFF`):** Cards and tables framed with a crisp border: 1px solid `#E2E8F0` and shadow: `0px 1px 3px rgba(15, 23, 42, 0.04), 0px 4px 10px rgba(15, 23, 42, 0.02)`.
- **Level 2 Surface / Popovers:** `#FFFFFF` with shadow: `0px 10px 25px -5px rgba(15, 23, 42, 0.08), 0px 4px 10px -2px rgba(15, 23, 42, 0.04)`.

## Shapes

The design system implements a controlled **Rounded (Level 2)** geometry:
- **Base Components (Inputs, Buttons, Badges):** `0.5rem` (8px) radius. Provides a modern, approachable feel while retaining the structural precision expected of financial ledgers.
- **Cards & Surface Containers:** `1rem` (16px) radius (`rounded-lg`). Creates cohesive visual grouping for complex tenancy and property dossiers.
- **Modals & Bottom Drawers:** `1.5rem` (24px) radius on top edges (`rounded-xl`), creating comfortable, tactile touchpoints during mobile gesture dismissals.
- **Pill Badges (Status, Codes):** 9999px fully circular capsules reserved solely for tags, transaction verification chips, and active filters.

## Components

### 1. Buttons
- **Primary Action (Payment Initiation, Add Unit):**
  - Dark Mode: Cobalt background `#2563EB`, text `#FFFFFF`, hover `#1D4ED8`. Active tap states trigger subtle inner cyan highlight.
  - Light Mode: `#1D4ED8` background, text `#FFFFFF`, active `#1E40AF`.
  - Height: 48px on mobile for thumb reach; font `Manrope` 16px bold; radius `0.5rem`.
- **Secondary Action (Export Statement, Filter):**
  - Dark: Surface `#1F242D`, text `#F8FAFC`, border `1px solid #334155`.
  - Light: Surface `#F1F5F9`, text `#0F172A`, border `1px solid #CBD5E1`.
- **Ghost / Destructive:**
  - Background transparent; text `#EF4444` (`#DC2626` in light mode); hover filled with 10% red tint.

### 2. Transaction & Status Chips
- **M-Pesa Verified:**
  - Dark: Background `rgba(16, 185, 129, 0.12)`, border `1px solid rgba(16, 185, 129, 0.3)`, text `#10B981`. Includes a pulse indicator dot.
  - Light: Background `#ECFDF5`, border `1px solid #A7F3D0`, text `#065F46`.
- **Late / Overdue Tag:**
  - Dark: Background `rgba(239, 68, 68, 0.12)`, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.25)`.
  - Light: Background `#FEF2F2`, text `#991B1B`, border `1px solid #FECACA`.
- Shape: 9999px pill; padding: `0.25rem 0.75rem`; font: `JetBrains Mono` 11px uppercase bold.

### 3. Lists & Transaction Rows
- Standard row height: 68px.
- Left side: Avatar or category icon with 40x40px rounded box (tinted according to category).
- Center: Tenant name / Unit Number in `Space Grotesk` 15px semi-bold with status subtitle in `Manrope` 13px muted.
- Right side: Monetary balance in `JetBrains Mono` 15px bold aligned right; green for credits, white/slate for standard rent charges. Bottom line divider: 1px hairline matching the surface border tier.

### 4. Input Fields
- Container: Height 48px, background `#181B22` (Dark) / `#F1F5F9` (Light).
- Border: `1px solid #28303F` (Dark) / `1px solid #CBD5E1` (Light).
- Focus State: Border transitions to `#00D2FF` (Dark) / `#0284C7` (Light) with a 2px outer ambient glow ring.
- Label: Floating or persistent top `Manrope` 12px bold. Numeric inputs automatically toggle numeric pin pad with monospaced numerical formatting.

### 5. Cards & Property Dashboards
- Multi-layer structured cards:
  - Top header: Property name + occupancy rate pill.
  - Middle: High-impact numerical revenue total in `Space Grotesk` 28px, followed by inline trend indicators (+4.2% MoM).
  - Bottom footer: Quick actions (Send Reminder, Reconcile M-Pesa).
- Padding: `1rem` on mobile, `1.25rem` on tablet.

### 6. Specialized Domain Component: M-Pesa Live Reconciliation Feed
- A streaming mini-card showing real-time mobile money payloads:
  - Header: Displays telco badge, unique reference ID (`L8X791...`) in `JetBrains Mono`.
  - Body: Matched tenant portrait, apartment unit tag, and real-time confirmation progress ring.
  - Action: Single-tap ledger auto-match button with subtle electric cyan highlight.