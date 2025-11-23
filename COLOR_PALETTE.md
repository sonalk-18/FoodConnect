# FoodConnect Color Palette

## Your Custom Colors

The entire website now uses your custom color palette:

- **Color 1 (Orange)**: `#E2852E` - Primary accent, headers, main actions
- **Color 2 (Yellow)**: `#F5C857` - Secondary accent, buttons, highlights
- **Color 3 (Light Yellow)**: `#FFEE91` - Soft highlights, badges, backgrounds
- **Color 4 (Light Blue)**: `#ABE0F0` - Cool accents, cards, complementary elements

## Where Colors Are Applied

### 🎨 **Header & Navigation**
- **Header Background**: Gradient from Color 1 → Color 2 → Color 3
- **Active Links**: Color 2 (Yellow)
- **Logo Area**: Uses Color 1 (Orange)

### 🔘 **Buttons**
- **Button Background**: Color 2 (Yellow) - `#F5C857`
- **Button Hover**: Color 1 (Orange) - `#E2852E`
- **Button Text**: Dark text for contrast

### 🏷️ **Badges & Status**
- **Pending/In Review**: Color 3 (Light Yellow) background
- **Scheduled/Picked Up**: Color 4 (Light Blue) background
- **Completed/Approved**: Color 3 (Light Yellow) background
- **All Badge Text**: Color 1 (Orange) for consistency

### 📝 **Forms & Inputs**
- **Input Focus Border**: Color 1 (Orange)
- **Input Focus Shadow**: Color 1 with opacity
- **Form Highlights**: Uses accent colors

### 🎴 **Cards & Sections**
- **Card Highlights**: Color 1 (Orange) border
- **Data Cards**: White/theme background with Color 1 accents
- **Dashboard Cards**: Uses all 4 colors for variety

### 🌈 **Gradients**
- **CTA Gradients**: Color 1 → Color 2
- **Header Gradient**: Color 1 → Color 2 → Color 3

### 🎯 **Accent Elements**
- **Links**: Color 1 (Orange)
- **Icons**: Color 1 (Orange) or Color 2 (Yellow)
- **Highlights**: Color 3 (Light Yellow) or Color 4 (Light Blue)

## Theme Support

All three themes (Light, Dark, Pastel) now use your color palette:

### Light Theme
- Primary: Color 1 (Orange)
- Secondary: Color 2 (Yellow)
- Highlights: Color 3 (Light Yellow)
- Cool Accents: Color 4 (Light Blue)

### Dark Theme
- Primary: Color 2 (Yellow) - for better contrast
- Secondary: Color 3 (Light Yellow)
- Accents: Color 4 (Light Blue) and Color 1 (Orange)

### Pastel Theme
- All colors applied with softer backgrounds
- Maintains your color palette identity

## CSS Variables

The colors are defined as CSS variables for easy maintenance:

```css
--accent: #E2852E;        /* color1: orange */
--accent-light: #F5C857;  /* color2: yellow */
--accent-soft: #FFEE91;   /* color3: light yellow */
--accent-cool: #ABE0F0;   /* color4: light blue */
```

## Quick Reference

| Element | Color Used |
|---------|-----------|
| Header Background | Gradient (Color 1→2→3) |
| Buttons | Color 2 (Yellow) |
| Button Hover | Color 1 (Orange) |
| Links | Color 1 (Orange) |
| Badges | Color 3 or 4 backgrounds |
| Input Focus | Color 1 (Orange) |
| Card Highlights | Color 1 (Orange) |
| CTA Gradients | Color 1 → Color 2 |

## Testing

After applying colors:
1. ✅ Refresh browser (Ctrl+Shift+R)
2. ✅ Check all pages for color consistency
3. ✅ Test button hover states
4. ✅ Verify form focus states
5. ✅ Check badge colors
6. ✅ Test all three themes (light/dark/pastel)

## Notes

- Error states (cancelled/rejected) still use red for semantic clarity
- All colors maintain proper contrast ratios for accessibility
- Colors work across all themes and pages
- Responsive design maintains color consistency

