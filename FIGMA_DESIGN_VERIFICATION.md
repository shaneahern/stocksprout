# Figma Design Verification Report
**Date:** January 2025  
**Figma Design:** https://www.figma.com/design/TdlTudDD4YVYj5oBUC4gtO/Stock-Sprout-UI-Design?node-id=151-8  
**Page:** Page 2 - Version 2 Design

## Design Screens Overview

The Figma design contains the following screens:
1. **Portfolio V2** (151:430)
2. **Profile V2** (151:683)
3. **Sign In Screen** (151:779)
4. **Sign Up Screen** (151:847)
5. **Activities V2** (151:1096)
6. **Timeline V2** (151:1417)
7. **Home V2** (151:1569)

---

## Design Tokens from Figma

### Colors
- **White Background:** `#FFFFFF`
- **Primary Green:** `#019538`, `#328956`
- **Primary Blue:** `#265FDC`
- **Text Primary:** `#161823` (Light/Text/TextPrimary)
- **Text Secondary/Gray:** `#828282` (fill_8X8IFE)
- **Light Gray:** `#AAAAAA` (fill_66V5QD)
- **Background Light:** `#F9F9F9` (fill_00HEBS)
- **Border Gray:** `#C0C0C0` (stroke_6JQBVU), `#D7D7D7` (stroke_SJUU8D), `#DEDEDE` (stroke_X8I5A0)
- **Light Green Background:** `#EEFFF5` (fill_LX8CBK)
- **Gold/Yellow:** `#E2B25E` (fill_3QBME3)
- **Error Red:** `#D62025` (fill_DTTM73)
- **Light Blue Background:** `#F0F5FA` (fill_AU5801)
- **Light Gray Background:** `#F5F5F5` (fill_8UB39W), `#F5F6F5` (fill_SPDVGM)
- **Light Green Indicator:** `#F1FFF7` (fill_CMY5GT)

### Typography
- **Font Family:** Inter
- **Font Weights:**
  - Light/Thin: 300
  - Regular: 400
  - Medium: 500
  - Semi-Bold: 600
  - Bold: 900
- **Font Sizes:**
  - 7px (style_AYGGAC - small text)
  - 8px (style_NQULF6, style_SWJB5X - badges)
  - 9px (style_4OAJUJ - buttons)
  - 10px (style_T8LYT1, style_V1JK0B, style_FBYZLB - labels, small text)
  - 11px (style_V3S0SG, style_SLX81G)
  - 12px (style_TSFPP2, style_RDMB9M, style_OF1U7Q, style_EPPMO2 - tabs, labels, descriptions)
  - 13px (style_3S3L2X, style_I94BJ7 - child names)
  - 14px (style_SYKTTG, style_DYGNXV - form labels)
  - 15px (style_QHGI1L, style_0IY4W0 - headings, buttons)
  - 16px (style_3F6YRS)
  - 20px (style_LFYUIY - large values)
  - 40px (style_NM31R8 - large numbers)
- **Line Heights:** Vary by font size (typically 1.21em - 1.4em)
- **Letter Spacing:** 0.97% for many elements

### Border Radius
- **Small:** 2px, 4px, 5px (buttons, badges)
- **Medium:** 8px, 10px (cards, inputs)
- **Large:** 20px (some buttons, modal corners)
- **Full Circle:** 100px, 500px, 1000px (avatars, icons)

### Spacing
- **Gaps:** 8px, 12px, 24px in flex layouts
- **Padding:** 8px, 12px, 16px, 20px, 24px
- **Page Dimensions:** 393px width × 852px height (mobile frame)

---

## Screen-by-Screen Verification

### 1. **Portfolio V2 Screen** (151:430)

#### Design Specs:
- **Holdings List:**
  - Cell padding: 8px 0px
  - Gap between cells: 8px
  - Cell border radius: 8px
  - Logo size: 35px × 35px (or 36px × 36px), borderRadius: 100px
  - Text section width: 169px
  - Percentage badge: 84px × 36px, borderRadius: 10px
  - Badge colors: Green `#019538` for positive, Red `#D62025` for negative
  - Font sizes: Symbol/Value 14px (font-weight: 500), Shares/Gain 12px (font-weight: 400)

- **Top Section:**
  - Total value: 20px font, font-weight: 600, right-aligned
  - Total gain: 16px font, font-weight: 600, centered, color `#AAAAAA`
  - Child selector: 169px × 36px, light blue background `#F0F5FA`, borderRadius: 5px

- **Chart:**
  - Container: 370px × 232px, borderRadius: 8px
  - Y-axis labels: 10px font, color `#828282`
  - X-axis: "All" is bold (font-weight: 900), others are regular

- **Buttons:**
  - "Send Gift": 343px × 29px, green `#328956`, borderRadius: 5px, white text
  - "Sprout Request": 343px × 29px, blue `#265FDC`, borderRadius: 5px, light text `#FDFDFD`

#### Current Implementation Status:
✅ **Matches:**
- Holdings list structure with logos, text, and percentage badges
- Color scheme (green for positive, red for negative)
- Button colors and sizes
- Chart container

⚠️ **Potential Discrepancies:**
1. **Font sizes** - Need to verify exact pixel sizes match (14px/12px)
2. **Badge dimensions** - Current may not be exactly 84px × 36px
3. **Spacing** - Cell gaps and padding may differ slightly
4. **Chart styling** - Y-axis and X-axis label styling may differ

---

### 2. **Home V2 Screen** (151:1569)

#### Design Specs:
- **Header:**
  - Logo: 91px × 91px (at x: 12, y: 24)
  - Tagline: "Start before they know what money is, end with more then they imagined."
  - Font: 10px, font-weight: 400, color `#000000`

- **Notification Badge:**
  - Position: Top right
  - Red circle with number
  - Green background `#009538` for bell icon

- **Child Cards:**
  - Border radius: 10px
  - Profile image: 76px × 76px, borderRadius: 1000px
  - Child name: 13px, font-weight: 600, letter-spacing: 0.97%
  - Portfolio value: 20px, font-weight: 600
  - Growth %: 13px, font-weight: 600, color varies (green `#019539` or green `#328956`)

- **Buttons:**
  - "Send Gift": Green `#019538` or `#328956`, borderRadius: 5px
  - "Sprout Request": Blue `#265FDC`, text color `#FDFDFD`
  - Button height: 29px
  - Button text: 15px, font-weight: 600

- **Section Headers:**
  - "Your Sprouts": 15px, font-weight: 600
  - "Sprouts You've Helped": 15px, font-weight: 600
  - "+ Add Child": Text color `#265FDC` (blue)

#### Current Implementation Status:
✅ **Matches:**
- Logo placement and size range
- Tagline text (with minor typo difference: "then" vs "than")
- Child card structure
- Button colors and labels
- Section headers

⚠️ **Discrepancies:**
1. **Tagline typo:** Design says "then" but should probably be "than"
2. **Font sizes** - Need exact match on 13px for names, 10px for tagline
3. **Button heights** - Current may not be exactly 29px
4. **Logo size** - Need to verify exact dimensions

---

### 3. **Timeline V2 Screen** (151:1417)

#### Design Specs:
- **Timeline Line:**
  - Vertical line: 5px width, color `#295235` (dark green)
  - Position: x: 24.31 (left side)

- **Leaf Icons:**
  - Size: 33.43px × 33.43px (or 36.16px × 36.16px)
  - Position: Along timeline line

- **Cumulative Amount Tags:**
  - Background: `#EEFFF5` (light green)
  - Border: 1px, color `#019538` (green)
  - Border radius: 10px
  - Text: 8px, font-weight: 400, color `#019538`
  - Dimensions: ~37px × 33px

- **Gift Cards:**
  - Border radius: 10px
  - Border: 1px, color `#C0C0C0`
  - Padding: Internal spacing in design

- **Video Button:**
  - Background: `#265FDC` (blue)
  - Border radius: 20px
  - Text: 11px, font-weight: 600, white text

- **Badges:**
  - Background: `#EEFFF5`, border `#019538`, 1px
  - Border radius: 20px
  - Text: 8px, font-weight: 300

- **Say Thanks Button:**
  - Background: `#F5F5F5` (light gray)
  - Border: 1px, color `#C0C0C0`
  - Border radius: 5px
  - Text: 9px, font-weight: 400

#### Current Implementation Status:
✅ **Matches:**
- Timeline vertical line structure
- Leaf icon positioning
- Cumulative amount tags (green background and border)
- Video button styling
- Badge styling
- Gift card layout

⚠️ **Discrepancies:**
1. **Timeline line width** - Design shows 5px, current may be different
2. **Timeline line color** - Design `#295235`, current `#328956`
3. **Leaf icon size** - May not match exact dimensions
4. **Font sizes** - 8px for badges, 11px for video button text
5. **Badge border radius** - Design shows 20px (pill shape)

---

### 4. **Profile V2 Screen** (151:683)

#### Design Specs:
- **Profile Photo:**
  - Size: 105px × 105px
  - Border radius: 1000px (circular)
  - Camera button: 26px × 26px, positioned at bottom-right

- **Account Overview Card:**
  - Border radius: 10px
  - Border: 1px, color `#C0C0C0`
  - Stat numbers: 40px, font-weight: 600, color `#265FDC`
  - Stat labels: 12px, font-weight: 300

- **Settings Items:**
  - Icon size: 24px × 24px
  - Text: 14px, font-weight: 500
  - Height: ~21px for text

- **Sign Out Button:**
  - Background: `#F5F5F5`
  - Border: 1px, color `#C0C0C0`
  - Border radius: 5px
  - Height: 30.19px
  - Text: 9px, font-weight: 400

#### Current Implementation Status:
✅ **Matches:**
- Profile photo size and shape
- Account overview structure
- Settings menu items
- Sign out button styling

⚠️ **Discrepancies:**
1. **Profile photo size** - Design shows 105px, current may be 128px (32px equivalent mentioned)
2. **Stat number size** - Design 40px, current may differ
3. **Button heights** - Exact measurements may differ
4. **Font sizes** - Labels may not match 12px/300 weight

---

### 5. **Activities V2 Screen** (151:1096)

#### Design Specs:
- **Progress Card:**
  - Border radius: 10px
  - Border: 1px, color `#C0C0C0`
  - Progress bar: 
    - Blue section: `#2563EB` (implied, or similar blue)
    - Yellow section: `#E2B25E`
    - Height: 8px
    - Border radius: 20px
  - Level text: 12px, font-weight: 600
  - Points text: 12px, font-weight: 400

- **Stats:**
  - Numbers: 40px, font-weight: 600
  - Colors: Blue `#265FDC`, Green (for achievements), Gold `#E2B25E` (for badges)
  - Labels: 10px, font-weight: 300

- **Leaderboard:**
  - Background: Light gray `#F5F5F5`
  - Medal icon: Gold `#E2B25E`, 24px × 22px
  - Rank number: 7px, font-weight: 400, in gold circle
  - Entry text: 12px, font-weight: 400

- **Journey Graphic:**
  - S-shaped path with colored stage icons
  - Stage labels: 10px, font-weight: 600, letter-spacing: 0.97%

#### Current Implementation Status:
✅ **Matches:**
- Progress bar colors (blue and yellow)
- Stats display structure
- Leaderboard layout
- Journey graphic concept

⚠️ **Discrepancies:**
1. **Progress bar height** - Design shows 8px, current may be 12px (h-3)
2. **Font sizes** - Need exact match on 12px, 10px, 40px sizes
3. **Journey graphic positioning** - Stage positions may differ
4. **Medal icon styling** - Exact size and color may differ

---

### 6. **Sign In Screen** (151:779)

#### Design Specs:
- **Logo:**
  - Size: 158px × 158px
  - Position: Centered near top

- **Title:**
  - "Welcome In": 15px, font-weight: 600

- **Tagline:**
  - "Grow the future our kids deserve": 10px, font-weight: 400

- **Form Fields:**
  - Background: `#F5F5F5`
  - Border: 1px, color `#C0C0C0`
  - Border radius: 5px
  - Height: 30.19px
  - Placeholder text: 10px, font-weight: 300, color `#000000`

- **Labels:**
  - Font: 12px, font-weight: 500
  - Color: `#000000`

- **Sign In Button:**
  - Background: `#265FDC` (blue)
  - Border: 1px, color `#265FDC`
  - Border radius: 5px
  - Height: 30.19px
  - Text: 10px, font-weight: 600, white

- **Checkboxes:**
  - Size: 17px × 17px
  - Border: 1px, color `#000000`
  - Border radius: 2px
  - "Remember me": 10px, font-weight: 300
  - "Face ID": 10px, font-weight: 300, color `#265FDC`

- **Links:**
  - "Don't have an account? Sign up": 14px, font-weight: 500, color `#265FDC`
  - "Forgot username or password?": 14px, font-weight: 500, color `#265FDC`

- **Footer:**
  - Text: 10px, font-weight: 500, centered
  - Company info and privacy policy link

#### Current Implementation Status:
✅ **Matches:**
- Logo and tagline
- Form structure
- Button styling
- Link styling
- Footer content

⚠️ **Discrepancies:**
1. **Title** - Design shows "Welcome In", current may say "Login" or "Welcome"
2. **Form field heights** - Design 30.19px, current may differ
3. **Font sizes** - Placeholder 10px, labels 12px, button 10px
4. **Face ID option** - May not be present in current implementation

---

### 7. **Sign Up Screen** (151:847)

#### Design Specs:
- Similar to Sign In but with:
  - Title: "Create Account"
  - Tagline: "Growing the future our kids deserve" (present tense)
  - Additional fields: First Name, Last Name, Confirm Password
  - Button: "Create Account" instead of "Sign In"
  - Link: "Already have an account? Sign in"

#### Current Implementation Status:
✅ **Matches:**
- Form structure
- Field layout
- Button styling

⚠️ **Discrepancies:**
1. **Tagline verb** - "Growing" vs "Grow" (both are in design)
2. **Field ordering** - May differ
3. **Font sizes** - Same as Sign In discrepancies

---

## Bottom Navigation Bar

### Design Specs:
- **Container:**
  - Background: `#F9F9F9`
  - Border: 1px, color `#DEDEDE` or `#D7D7D7`
  - Height: 92px (includes home indicator)
  - Home indicator: 131px × 5px, black (`#000000`), borderRadius: 10px

- **Tabs:**
  - Icon size: 32px × 32px
  - Text: 12px, font-weight: 400
  - Active color: `#000000`
  - Inactive color: `#000000` (same color)
  - Spacing between tabs: Even distribution

- **Tab Names:**
  - Home
  - Portfolio
  - Timeline
  - Activities (with green background indicator when active: `#F1FFF7` or `#F5F6F5`)
  - Profile

#### Current Implementation Status:
✅ **Matches:**
- Tab structure
- Icon sizes
- Home indicator bar

⚠️ **Discrepancies:**
1. **Active state styling** - Design may show different active indicators
2. **Activities tab highlight** - Design shows light green background when active
3. **Text colors** - May be using primary color instead of black

---

## Critical Discrepancies Summary

### 🚨 High Priority Fixes Needed:

1. **Typography:**
   - ❌ Verify and match exact font sizes (especially 8px, 10px, 12px, 13px, 14px, 15px, 20px, 40px)
   - ❌ Font weights may not match exactly (300, 500, 600)
   - ❌ Letter spacing may be missing (0.97% on certain elements)

2. **Colors:**
   - ⚠️ Timeline line color: Design `#295235` vs Current `#328956`
   - ⚠️ Text primary color: Design `#161823` vs Current may be `#000000`
   - ⚠️ Verify exact hex values for all colors

3. **Spacing & Sizing:**
   - ❌ Button heights: Design 29px vs Current may differ
   - ❌ Form field heights: Design 30.19px vs Current may differ
   - ❌ Badge dimensions: Design 84px × 36px vs Current may differ
   - ❌ Cell gaps: Design 8px vs Current may differ

4. **Border Radius:**
   - ❌ Badges: Design 20px (pill) vs Current may be different
   - ❌ Buttons: Design 5px vs Current may be different
   - ❌ Cards: Design 10px vs Current may be different

5. **Component-Specific:**
   - ❌ Activities tab: Light green background when active (`#F1FFF7` or `#F5F6F5`)
   - ❌ Profile photo: Design 105px vs Current 128px equivalent
   - ❌ Progress bar height: Design 8px vs Current 12px (h-3)
   - ❌ Timeline line width: Design 5px vs Current 1.5px

### ⚠️ Medium Priority:

1. Face ID option on sign in screen
2. Exact logo dimensions
3. Chart axis styling
4. Shadow effects (design shows 0px 4px 4px 0px rgba(0,0,0,0.25))

### ✅ Good Matches:

- Overall layout structure
- Color scheme (approximate)
- Component hierarchy
- Navigation structure
- Button colors
- Card layouts

---

## Recommendations

### Immediate Actions:
1. **Create design token file** with exact Figma values
2. **Update Typography** to match Figma specs exactly
3. **Fix Timeline line** width (5px) and color (`#295235`)
4. **Standardize button heights** to 29px
5. **Update badge styling** to 20px border radius (pill shape)
6. **Fix Activities tab** active state background color
7. **Adjust font sizes** to match design exactly

### Files to Update:
- `client/src/index.css` - Add design tokens
- `tailwind.config.ts` - Extend theme with exact values
- `client/src/components/mobile-layout.tsx` - Fix tab styling
- `client/src/pages/timeline.tsx` - Fix timeline line
- `client/src/pages/activities.tsx` - Fix progress bar and styling
- `client/src/pages/portfolio.tsx` - Match exact sizing
- `client/src/components/child-card.tsx` - Match exact typography
- All button components - Standardize heights and styles

---

## Next Steps

1. Review and approve this report
2. Prioritize fixes based on visual impact
3. Create design tokens configuration file
4. Implement fixes systematically
5. Visual QA review after each major fix
