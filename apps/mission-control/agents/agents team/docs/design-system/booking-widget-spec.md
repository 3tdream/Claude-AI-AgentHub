# Beauty CRM Booking Widget — Design Specification

## 1. DESIGN TOKENS

### Color Palette — Beauty/Spa Theme

Warm, clean, professional palette. Rose-terracotta accents, neutral cream background.

```css
:root {
  /* PRIMARY — Rose Terracotta (CTA buttons, selected states) */
  --primary: 350 65% 55%;              /* #C94B6E */
  --primary-foreground: 0 0% 100%;     /* #FFFFFF */

  /* SECONDARY — Blush Pink (cards, badges) */
  --secondary: 340 40% 94%;            /* #F5E8EC */
  --secondary-foreground: 350 45% 30%; /* #7A2A3D */

  /* BACKGROUND — Warm Cream */
  --background: 36 33% 97%;            /* #FAF8F5 */
  --foreground: 20 15% 15%;            /* #282320 */

  /* MUTED — Soft Linen */
  --muted: 30 20% 93%;                 /* #EDE9E3 */
  --muted-foreground: 20 10% 50%;      /* #8A7F76 */

  /* BORDER */
  --border: 30 15% 88%;                /* #E0D9D0 */

  /* RING — focus */
  --ring: 350 65% 55%;                 /* #C94B6E */

  /* SUCCESS — confirmation */
  --success: 152 45% 42%;              /* #3D9467 */
  --success-foreground: 0 0% 100%;

  /* DESTRUCTIVE — cancel/error */
  --destructive: 0 72% 51%;            /* #D42020 */
  --destructive-foreground: 0 0% 100%;

  /* ACCENT — highlights, stars, price */
  --accent: 35 85% 55%;                /* #E8931A */
  --accent-foreground: 0 0% 100%;

  /* CARD */
  --card: 0 0% 100%;                   /* #FFFFFF */
  --card-foreground: 20 15% 15%;       /* #282320 */
}
```

### Typography

**Fonts (Google Fonts):**
- Headings: "Cormorant Garamond" — 400, 500, 600 (elegant serif for beauty/spa)
- Body: "Inter" — 400, 500, 600 (clean UI readability)

| Context | Tailwind | px | Font | Weight |
|---------|----------|-----|------|--------|
| Step title | `text-2xl` | 24px | Cormorant Garamond | 600 |
| Card title | `text-base` | 16px | Inter | 600 |
| Body | `text-sm` | 14px | Inter | 400 |
| Caption | `text-xs` | 12px | Inter | 400 |
| Price | `text-lg` | 18px | Inter | 600 |
| Badge | `text-xs` | 11px | Inter | 500 |

### Spacing & Radius

**Spacing:**
- card-padding: `p-4` (16px)
- card-gap: `gap-3` (12px)
- section-spacing: `space-y-6` (24px)
- button-padding: `px-6 py-3`
- input-padding: `px-4 py-3`

**Border Radius:**
- cards: `rounded-2xl` (16px)
- buttons: `rounded-full` (pill)
- avatars: `rounded-full`
- inputs: `rounded-xl` (12px)
- time-slots: `rounded-lg` (8px)

---

## 2. COMPONENT SPECS

### 2.1 StepIndicator
Horizontal stepper — 4 steps (Service → Master → Time → Contacts)
- Dot size: `w-8 h-8` (32px)
- Active: `bg-primary`, white text, `shadow-md`
- Completed: `bg-success`, Check icon
- Upcoming: white bg, `border-2 border-muted`

### 2.2 ServiceCard
- Min height: 80px, `p-4 rounded-2xl`
- Icon: `w-10 h-10 rounded-full bg-secondary`
- Duration badge: `bg-muted rounded-full px-2 py-0.5`
- Selected: `border-2 border-primary bg-[#FDF0F3]` + CheckCircle2

### 2.3 MasterCard
- Avatar: `w-14 h-14 rounded-full`
- Rating: Star icons `fill-accent color-accent`
- Availability badges: green/yellow/red pill

### 2.4 TimeSlotGrid
- Date chips: `w-14 h-16` horizontal scroll
- Time slots: 3-col grid, `h-11 rounded-lg`
- Selected: `bg-primary text-white shadow-md`
- Unavailable: `bg-muted text-muted-foreground line-through`

### 2.5 BookingForm
- Summary card: `bg-secondary rounded-2xl p-4`
- Inputs: `h-12 rounded-xl`
- Submit: `h-14 rounded-full bg-primary` + Sparkles icon
- Phone prefix: "+7" separate div

### 2.6 ConfirmationScreen
- Success circle: `w-24 h-24` outer, `w-16 h-16 bg-success` inner
- Details card: icon rows with separators
- "Add to calendar" link button

---

## 3. UX DECISIONS

- Unavailable slots: visible but grayed + strikethrough
- Loading: skeleton cards (3x), spinner only on submit
- Step transitions: slide-in 200ms
- Slot conflict (409): inline alert, preserve form data, return to step 3
- Back navigation: preserve all selections, reset only forward choices
- Success screen: show service, master, date, time, address. No price.

---

## 4. MOBILE WIREFRAMES (375px)

4-step booking flow documented with ASCII wireframes:
1. Service selection (full-width cards)
2. Master selection (avatar + rating + availability)
3. Date/time picker (horizontal date scroll + 3-col time grid)
4. Contact form (summary card + inputs + submit)
5. Confirmation screen (success animation + details)

All touch targets ≥ 44px. WCAG AA contrast verified.

---

## Component Summary for Frontend-Agent

| Component | shadcn/ui base | Icons | Min height |
|-----------|---------------|-------|-----------|
| StepIndicator | custom | Check | 64px |
| ServiceCard | Card | CheckCircle2 | 80px |
| MasterCard | Card | Star, User | 88px |
| TimeSlotGrid dates | Button | — | 64px |
| TimeSlotGrid slots | Button | — | 44px |
| BookingForm inputs | Input | User, Phone | 48px |
| BookingForm submit | Button | Sparkles, Loader2 | 56px |
| ConfirmationScreen | Card | Check, Calendar, MapPin, Clock, Scissors, Bell | — |
