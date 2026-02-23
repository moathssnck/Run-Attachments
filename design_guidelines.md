# Online Lottery System - Design Guidelines

## Design Approach

**Selected Framework:** Fluent Design System + Carbon Design principles
**Rationale:** Enterprise-grade lottery platform requiring data-intensive interfaces, transactional clarity, and role-based workflows. Fluent's productivity focus combined with Carbon's data visualization strengths provide optimal UX for both admin dashboards and end-user lottery purchasing.

---

## Core Design Principles

1. **Clarity Over Decoration** - Financial transactions demand absolute clarity
2. **Progressive Disclosure** - Complex admin features revealed contextually
3. **Trust Through Consistency** - Predictable patterns build user confidence
4. **Accessibility First** - WCAG 2.1 AA compliance mandatory

---

## Typography System

**Primary Font:** Inter (Google Fonts)
**Monospace Font:** JetBrains Mono (for ticket numbers, transaction IDs)

**Hierarchy:**
- Page Titles: `text-3xl font-semibold` (30px)
- Section Headers: `text-xl font-semibold` (20px)
- Card Titles: `text-lg font-medium` (18px)
- Body Text: `text-base` (16px)
- Secondary Text: `text-sm` (14px)
- Captions/Metadata: `text-xs` (12px)

**Special Treatment:**
- Ticket numbers: Monospace, `text-lg font-mono tracking-wider`
- Prize amounts: `text-2xl font-bold tabular-nums`
- Status badges: `text-xs font-semibold uppercase tracking-wide`

---

## Layout System

**Spacing Units:** Use Tailwind's 4, 6, 8, 12, 16, 24 for consistency
- Component padding: `p-6`
- Card spacing: `gap-6`
- Section margins: `my-12`
- Form field gaps: `space-y-4`

**Grid System:**
- Admin dashboards: 12-column grid
- User flows: Centered single column, `max-w-2xl`
- Data tables: Full-width within `max-w-7xl` container

**Layout Patterns:**
- Admin: Persistent sidebar (240px) + main content area
- End User: Top navigation + centered content
- Forms: Left-aligned labels, full-width inputs on mobile, 2-column on desktop

---

## Component Library

### Navigation
**Admin Sidebar:**
- Fixed left sidebar with collapsible sub-menus
- Icon + label (Heroicons)
- Active state with left border accent
- Role-based menu items

**User Header:**
- Horizontal nav with logo, draw countdown timer, wallet balance, profile dropdown
- Sticky on scroll

### Data Display
**Tables:**
- Zebra striping for readability
- Fixed header on scroll
- Row hover states
- Inline action buttons (right-aligned)
- Pagination footer

**Cards:**
- Subtle shadow: `shadow-sm hover:shadow-md`
- Border radius: `rounded-lg`
- Consistent padding: `p-6`

### Forms
**Input Fields:**
- Floating labels or top-aligned labels
- Clear validation states (success, error, warning)
- Helper text below fields: `text-sm`
- Required field indicators: asterisk in label

**Buttons:**
- Primary CTA: Solid, `px-6 py-3 rounded-lg font-medium`
- Secondary: Outlined, same padding
- Tertiary: Ghost/text style
- Disabled state: Reduced opacity with cursor-not-allowed

### Status Indicators
**Badges:**
- Rounded pills: `px-3 py-1 rounded-full text-xs font-semibold`
- Status-specific treatments:
  - Active/Won: Success variant
  - Pending: Warning variant
  - Lost/Voided: Neutral variant
  - Locked: Error variant

### Specialized Components
**Ticket Purchase Interface:**
- Number grid selector (responsive grid)
- Selected numbers highlighted
- Draw details card with countdown
- Payment summary sidebar (desktop) or bottom sheet (mobile)

**Wallet Widget:**
- Large balance display
- Recent transactions list
- Quick actions (withdraw, view history)

**Audit Log Viewer:**
- Filterable table with timestamp, user, action, old/new values
- Expandable row details
- Export functionality

---

## Page Templates

### End User Pages
**Homepage/Buy Ticket:**
- Hero section with active draw countdown (NOT full viewport - approximately 60vh)
- Draw selection cards grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Past winners testimonial section
- Footer with links, support

**My Tickets:**
- Filter bar (status, date range)
- Ticket cards with draw name, numbers, status badge
- Expandable details (purchase date, payment info)

**Wallet:**
- Balance card prominent at top
- Transaction history table
- Withdrawal form (if applicable)

### Admin Pages
**Dashboard:**
- KPI cards grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- Charts: Active draws, revenue, user growth
- Recent activity feed

**User Management:**
- Search/filter toolbar
- User table with inline edit capabilities
- Bulk actions (activate, suspend)

**Draw Management:**
- Draw creation form (modal or side panel)
- Draw listing with status pipeline view
- Result publishing interface with verification step

**Audit Logs:**
- Advanced filter sidebar (date, user, action type)
- Full-width table with expandable details
- Export to CSV functionality

---

## Interaction Patterns

**Loading States:**
- Skeleton screens for data tables
- Spinner for form submissions
- Progress bars for multi-step processes

**Confirmations:**
- Modal dialogs for destructive actions (void ticket, lock user)
- Toast notifications for success/error feedback (top-right position)

**Empty States:**
- Illustration + helpful message + CTA
- Contextual guidance for first-time users

**Animations:** Minimal - subtle transitions only
- Page transitions: Fade
- Dropdown menus: Slide down (150ms)
- Modal entry: Scale + fade (200ms)

---

## Responsive Strategy

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px  
- Desktop: > 1024px

**Mobile Adaptations:**
- Sidebar becomes bottom navigation or hamburger menu
- Tables convert to card views
- Multi-column grids stack to single column
- Ticket number grid adapts to smaller touch targets

---

## Icons

**Library:** Heroicons (outline style primary, solid for active states)
**Usage:**
- Navigation: 20px icons
- Buttons: 16px icons with 8px gap from text
- Status indicators: 16px icons
- Empty states: 48px icons

---

## Images

**Hero Section (End User Homepage):**
- Large hero image showing lottery excitement/winners (approximately 60vh height)
- Overlay gradient to ensure text readability
- CTA buttons with blurred backgrounds: `backdrop-blur-sm bg-white/10`

**Additional Images:**
- Empty state illustrations for "no tickets," "no transactions"
- User avatars in admin user management (or initials fallback)
- Trust badges/payment logos in footer

No decorative images in admin sections - maintain professional, data-focused aesthetic.