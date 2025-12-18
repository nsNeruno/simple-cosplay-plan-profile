# UI Design System Documentation

This document describes the Material Design-inspired dark theme UI system implemented in the Image Gallery PWA.

## Table of Contents

- [Design Principles](#design-principles)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Custom CSS Classes](#custom-css-classes)
- [Component Patterns](#component-patterns)
- [Layout System](#layout-system)

## Design Principles

The UI follows these core principles:

1. **Material Design 3** - Modern Material Design guidelines with elevation and depth
2. **Dark Theme First** - Optimized for comfortable viewing in low-light environments
3. **Accessibility** - WCAG 2.1 AA compliant contrast ratios
4. **Responsive** - Mobile-first design that scales gracefully
5. **Consistent** - Reusable classes ensure visual consistency

## Color Palette

### Background Colors

```css
--dark-bg: #1e1e1e        /* Main app background - dark gray, not pure black */
--dark-surface: #2d2d2d   /* Elevated surfaces (cards, modals) */
--dark-hover: #3a3a3a     /* Hover states for interactive elements */
--dark-border: #404040    /* Borders and dividers */
```

**Why not pure black (#000000)?**
- Reduces eye strain in dark environments
- Provides better depth perception with shadows
- Aligns with Material Design dark theme guidelines
- Allows for proper elevation hierarchy

### Text Colors

```css
--text-primary: white     /* Headlines and important text */
--text-secondary: #e5e5e5 /* Body text (gray-200) */
--text-tertiary: #d1d5db  /* Less prominent text (gray-300) */
--text-disabled: #9ca3af  /* Disabled text (gray-400) */
```

### Accent Colors

```css
--blue-primary: #2563eb   /* Primary actions (blue-600) */
--blue-hover: #1d4ed8     /* Hover state (blue-700) */
--blue-active: #1e40af    /* Active/pressed state (blue-800) */
--green: #16a34a          /* Success actions (green-600) */
--red: #dc2626            /* Destructive actions (red-600) */
```

## Typography

Based on Material Design 3 type scale with Roboto font family.

### Display Styles

**Display Large** - `.text-display-large`
- **Usage**: Hero titles, main page headers
- **Size**: 57px / Line Height: 64px
- **Weight**: Light (300)
- **Example**: Main "Image Groups" heading

**Display Medium** - `.text-display-medium`
- **Usage**: Section titles
- **Size**: 45px / Line Height: 52px
- **Weight**: Normal (400)

**Display Small** - `.text-display-small`
- **Usage**: Large headings
- **Size**: 36px / Line Height: 44px
- **Weight**: Normal (400)
- **Example**: "Image Groups", "Images" section titles

### Headline Styles

**Headline Large** - `.text-headline-large`
- **Usage**: Section headers
- **Size**: 32px / Line Height: 40px
- **Weight**: Normal (400)

**Headline Medium** - `.text-headline-medium`
- **Usage**: Card titles
- **Size**: 28px / Line Height: 36px
- **Weight**: Normal (400)

**Headline Small** - `.text-headline-small`
- **Usage**: List item titles, prominent UI text
- **Size**: 24px / Line Height: 32px
- **Weight**: Normal (400)
- **Example**: "No groups yet" empty state heading

### Title Styles

**Title Large** - `.text-title-large`
- **Usage**: Prominent UI elements
- **Size**: 22px / Line Height: 28px
- **Weight**: Medium (500)
- **Example**: Group card names

**Title Medium** - `.text-title-medium`
- **Usage**: Medium emphasis titles
- **Size**: 16px / Line Height: 24px
- **Weight**: Medium (500)
- **Letter Spacing**: 0.15px

### Body Styles

**Body Large** - `.text-body-large`
- **Usage**: Emphasized body text
- **Size**: 16px / Line Height: 24px
- **Weight**: Normal (400)
- **Letter Spacing**: 0.5px

**Body Medium** - `.text-body-medium`
- **Usage**: Regular body text, descriptions
- **Size**: 14px / Line Height: 20px
- **Weight**: Normal (400)
- **Letter Spacing**: 0.25px
- **Example**: Group descriptions, help text

### Label Styles

**Label Large** - `.text-label-large`
- **Usage**: Button text, prominent labels
- **Size**: 14px / Line Height: 20px
- **Weight**: Medium (500)
- **Letter Spacing**: 0.1px

## Custom CSS Classes

All custom classes are defined in [src/index.css](src/index.css) using Tailwind's `@layer components` directive.

### Button Classes

**`.btn-filled`** - Primary action button
```tsx
<button className="btn-filled">
  Create New Group
</button>
```
- Blue background (#2563eb)
- White text
- Elevated shadow
- Hover: Darker blue + larger shadow

**`.btn-outlined`** - Secondary action button
```tsx
<button className="btn-outlined">
  Cancel
</button>
```
- Transparent background
- Blue border and text
- Subtle hover background (blue/10)

**`.btn-text`** - Tertiary action button
```tsx
<button className="btn-text">
  Expand
</button>
```
- Transparent background
- Blue text
- Minimal hover background

**`.btn-danger`** - Destructive action button
```tsx
<button className="btn-danger">
  Delete
</button>
```
- Red background (#dc2626)
- White text
- Used for delete operations

**`.btn-success`** - Positive action button
```tsx
<button className="btn-success">
  Create
</button>
```
- Green background (#16a34a)
- White text
- Used for creation/confirmation actions

### Card Classes

**`.card-surface`** - Basic card surface
```tsx
<div className="card-surface">
  Content
</div>
```
- Dark surface background (#2d2d2d)
- Subtle border
- Rounded corners

**`.card-surface-hover`** - Interactive card
```tsx
<div className="card-surface-hover">
  Clickable content
</div>
```
- Includes all `.card-surface` styles
- Hover: Lighter background
- Cursor: pointer

**`.card-compact`** - Compact card
- Card surface + small padding (12px)

**`.card-standard`** - Standard card
- Card surface + medium padding (16px)

**`.card-spacious`** - Spacious card
- Card surface + large padding (24px)

### Input Classes

**`.input-base`** - Text input field
```tsx
<input
  type="text"
  className="input-base"
  placeholder="Enter name"
/>
```
- Dark surface background
- Light border
- White text
- Blue focus ring

### Layout Classes

**`.container-centered`** - Centered content container
```tsx
<div className="container-centered">
  Main content
</div>
```
- Max width: 1280px (7xl)
- Centered with auto margins
- Responsive horizontal padding

**`.grid-responsive`** - Responsive grid layout
```tsx
<div className="grid-responsive">
  {items.map(item => <Card />)}
</div>
```
- Mobile: 1 column
- Tablet (640px+): 2 columns
- Desktop (1024px+): 3 columns
- Large (1280px+): 4 columns
- Gap: 24px

**`.section-spacing`** - Section vertical spacing
```tsx
<section className="section-spacing">
  Section content
</section>
```
- Padding top/bottom: 32px (mobile)
- Padding top/bottom: 48px (desktop 768px+)

## Component Patterns

### Expandable Section

```tsx
<section className="mb-8">
  {/* Header with expand/collapse */}
  <div className="flex items-center justify-between mb-6">
    <div className="flex-1">
      <h2 className="text-display-small">Section Title</h2>
      <p className="text-body-medium mt-1">Description</p>
    </div>
    <button
      onClick={() => setExpanded(!isExpanded)}
      className="btn-text ml-4"
    >
      <ChevronIcon />
    </button>
  </div>

  {/* Expandable content */}
  {isExpanded && (
    <div className="space-y-6">
      {/* Content */}
    </div>
  )}
</section>
```

### Grid Card Layout

```tsx
<div className="grid-responsive">
  {items.map(item => (
    <div
      key={item.id}
      className={`
        card-standard cursor-pointer relative group/card
        ${isSelected
          ? 'ring-2 ring-blue-500 bg-blue-600/10'
          : 'hover:shadow-lg'
        }
      `}
    >
      {/* Card content */}
    </div>
  ))}
</div>
```

### Empty State

```tsx
<div className="card-spacious text-center">
  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600">
    {/* Icon */}
  </svg>
  <h3 className="text-headline-small mb-2">Empty State Title</h3>
  <p className="text-body-medium">
    Description of what the user can do
  </p>
</div>
```

### Hover-Revealed Actions

```tsx
<div className="card-surface group/item relative">
  {/* Main content */}

  {/* Button revealed on hover */}
  <button
    className="
      btn-danger absolute bottom-3 right-3
      opacity-0 group-hover/item:opacity-100
      transition-opacity
    "
  >
    Delete
  </button>
</div>
```

## Layout System

### Page Structure

```tsx
<div className="min-h-screen bg-dark-bg flex flex-col">
  {/* Header - Fixed at top */}
  <header className="bg-dark-surface border-b border-dark-border">
    <div className="container-centered py-4">
      <h1 className="text-headline-large">App Title</h1>
    </div>
  </header>

  {/* Main Content - Scrollable */}
  <main className="flex-1 overflow-y-auto">
    <div className="container-centered section-spacing">
      {/* Page sections */}
    </div>
  </main>
</div>
```

### Section Hierarchy

1. **Page Container** - Full viewport height with dark background
2. **Header** - Surface elevation with border
3. **Main Content** - Centered container with max-width
4. **Sections** - Vertical spacing with section-spacing
5. **Cards** - Elevated surfaces with card classes
6. **Grid Layouts** - Responsive columns with grid-responsive

### Responsive Breakpoints

Following Tailwind's default breakpoints:

```
sm:  640px  (tablet)
md:  768px  (small desktop)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (extra large)
```

## Best Practices

### 1. Consistent Spacing

Use Tailwind's spacing scale consistently:
- `gap-3` (12px) for compact layouts
- `gap-4` (16px) for standard layouts
- `gap-6` (24px) for spacious layouts
- `space-y-{n}` for vertical stacking

### 2. Typography Hierarchy

Always use custom typography classes instead of raw Tailwind:
- ✅ `className="text-headline-large"`
- ❌ `className="text-3xl font-bold text-white"`

### 3. Color Usage

Use semantic color names from the palette:
- Dark surface colors for backgrounds
- Blue for primary actions
- Green for success/creation
- Red for destructive actions
- Gray shades for text hierarchy

### 4. Interactive States

Always provide hover/focus/active states:
```tsx
className="
  transition-all duration-200
  hover:bg-dark-hover
  focus:ring-2 focus:ring-blue-500
  active:scale-95
"
```

### 5. Accessibility

- Maintain WCAG AA contrast ratios
- Provide aria-labels for icon buttons
- Use semantic HTML elements
- Ensure keyboard navigation works

## Migration Guide

### From Old to New Classes

Old Code:
```tsx
<button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
  Button
</button>
```

New Code:
```tsx
<button className="btn-filled w-full">
  Button
</button>
```

### Benefits

1. **Less Duplication** - Reusable classes reduce code
2. **Consistency** - Same look across all components
3. **Maintainability** - Change once, update everywhere
4. **Documentation** - Self-documenting code with descriptive names

## Resources

- [Material Design 3](https://m3.material.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
