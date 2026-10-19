# Design System: DSA Forge

## Visual Direction

### Design Principles
1. **Clarity Over Decoration**: Technical content should be primary focus
2. **Functional Beauty**: Every visual element serves a purpose
3. **Confident & Professional**: Inspire trust in AI-generated answers
4. **Developer-Friendly**: Optimized for reading code and technical content
5. **Distraction-Free**: Clean interface that doesn't compete with content

### Design Philosophy
DSA Forge follows a **dark, modern technical aesthetic** inspired by developer tools (VS Code, GitHub Dark) with purple accent colors representing AI/intelligence. The interface should feel like a premium coding environment, not a generic chatbot.

## Color Palette

### Primary Colors
```
--purple-primary: #8b5cf6    // Primary actions, links, highlights
--purple-light:   #a78bfa    // Hover states, secondary elements
--purple-pale:    #c4b5fd    // Subtle highlights, borders
--purple-dark:    #6d28d9    // Pressed states, dark accents
```

### Neutral Colors
```
--background-primary:    #0f0f1e    // Main background
--background-secondary:  #1a1a2e    // Elevated surfaces (cards, sidebar)
--background-tertiary:   #16162a    // Input fields, hover states

--surface-elevated:      #1e1e3a    // Modal, dropdown backgrounds
--surface-border:        #2d2d44    // Borders, dividers

--text-primary:          #f3f4f6    // Main text, headings
--text-secondary:        #cbd5e1    // Secondary text, descriptions
--text-tertiary:         #94a3b8    // Muted text, placeholders
```

### Semantic Colors
```
--success: #10b981    // Success states, confirmations
--error:   #ef4444    // Errors, destructive actions
--warning: #f59e0b    // Warnings, cautions
--info:    #3b82f6    // Info, tips

// Status indicators
--status-online:  #22c55e
--status-busy:    #f59e0b
--status-offline: #64748b
```

### Semantic Usage
- **Purple**: AI responses, LLM indicators, primary CTAs, links
- **Green**: Success toasts, "RAG grounded" badge
- **Red**: Errors, failed states, delete actions
- **Blue**: Information, secondary actions
- **Gray**: UI chrome, borders, disabled states

## Typography

### Font Families
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', monospace;
```

### Type Scale
```
--text-xs:   0.75rem    // 12px - Labels, badges, meta
--text-sm:   0.875rem   // 14px - Secondary text, captions
--text-base: 1rem       // 16px - Body text, paragraphs
--text-lg:   1.125rem   // 18px - Large body, emphasis
--text-xl:   1.25rem    // 20px - Section headings
--text-2xl:  1.5rem     // 24px - Page headings
--text-3xl:  1.875rem   // 30px - Hero headings
--text-4xl:  2.25rem    // 36px - Large display text
```

### Font Weights
```
--font-normal:   400
--font-medium:   500
--font-semibold: 600
--font-bold:     700
```

### Line Heights
```
--leading-tight:  1.25   // Headings
--leading-snug:   1.375  // Subheadings
--leading-normal: 1.5    // Body text
--leading-relaxed: 1.625 // Long-form content
--leading-loose:  1.75   // Code blocks
```

### Typography Usage
- **Headings**: font-sans, font-bold, tight leading
- **Body Text**: font-sans, font-normal, normal leading
- **Code**: font-mono, font-medium, loose leading
- **Labels**: font-sans, font-medium, uppercase, letter-spacing

## Spacing System

### Spacing Scale (4px base)
```
--space-1:  0.25rem   // 4px
--space-2:  0.5rem    // 8px
--space-3:  0.75rem   // 12px
--space-4:  1rem      // 16px
--space-5:  1.25rem   // 20px
--space-6:  1.5rem    // 24px
--space-8:  2rem      // 32px
--space-10: 2.5rem    // 40px
--space-12: 3rem      // 48px
--space-16: 4rem      // 64px
--space-20: 5rem      // 80px
```

### Spacing Application
- **Micro**: 4-8px (icon padding, badge spacing)
- **Small**: 12-16px (button padding, form spacing)
- **Medium**: 20-24px (card padding, section gaps)
- **Large**: 32-48px (page sections, major divisions)
- **XLarge**: 64-80px (page margins, hero sections)

## Layout System

### Grid & Container
```
--container-max:  1280px
--sidebar-width:  280px
--compact-width:  640px
```

### Breakpoints
```
--mobile:   640px
--tablet:   768px
--desktop:  1024px
--wide:     1280px
```

### Layout Patterns
1. **App Shell**: Sidebar + Main Panel (fixed split)
2. **Chat Layout**: Conversation list + Messages + Input
3. **Center Column**: Max-width content for forms, settings
4. **Full Bleed**: Edge-to-edge for backgrounds, media

## Reusable Components

### Buttons

#### Primary Button
```
Background: --purple-primary
Text: white
Padding: 12px 24px
Border-radius: 8px
Font: medium, 14px
Hover: --purple-light
Active: --purple-dark
Disabled: opacity 0.5
```

#### Secondary Button
```
Background: transparent
Text: --text-secondary
Border: 1px solid --surface-border
Padding: 12px 24px
Hover: --background-tertiary
```

#### Icon Button
```
Size: 36px × 36px
Padding: 8px
Border-radius: 6px
Hover: --background-tertiary
```

### Form Elements

#### Text Input
```
Background: --background-tertiary
Border: 1px solid --surface-border
Padding: 12px 16px
Border-radius: 8px
Font: 14px
Focus: border --purple-primary, outline 2px
Placeholder: --text-tertiary
```

#### Textarea
```
Same as text input
Min-height: 120px
Resize: vertical
```

### Cards & Surfaces

#### Card
```
Background: --background-secondary
Border: 1px solid --surface-border
Border-radius: 12px
Padding: 24px
Shadow: none (flat design)
```

#### Elevated Surface
```
Background: --surface-elevated
Border: none
Border-radius: 16px
Padding: 32px
Shadow: 0 4px 20px rgba(0,0,0,0.3)
```

### Navigation

#### Sidebar Item
```
Height: 40px
Padding: 8px 12px
Border-radius: 8px
Gap: 12px (icon to text)
Hover: --background-tertiary
Active: --purple-primary (background), white (text)
```

#### Breadcrumb
```
Text: --text-secondary, 14px
Separator: "/" with --text-tertiary
Current: --text-primary, font-medium
```

### Messages

#### User Message
```
Background: --purple-primary
Text: white
Padding: 12px 16px
Border-radius: 16px (asymmetric)
Max-width: 70%
Align: right
```

#### Assistant Message
```
Background: transparent
Text: --text-primary
Avatar: 40px circle, --purple-primary background
Markdown content with full width
```

#### Message Timestamp
```
Text: --text-tertiary, 12px
Margin: 4px
```

### Badges & Labels

#### Badge
```
Background: rgba(139, 92, 246, 0.15)
Text: --purple-light
Padding: 4px 8px
Border-radius: 4px
Font: 11px, semibold, uppercase
```

#### Status Dot
```
Size: 8px
Border-radius: circle
Colors: --status-online/busy/offline
```

### Toast Notifications
```
Background: --surface-elevated
Border: 1px solid --surface-border
Padding: 16px 20px
Border-radius: 12px
Shadow: 0 8px 24px rgba(0,0,0,0.4)
Duration: 2.2s
Position: bottom-right
Icon + message layout
```

## Navigation Patterns

### Primary Navigation (Sidebar)
- Fixed position, left side
- Collapsible on smaller screens
- Sections: Brand, New Conversation, Workspace Nav, Recent Conversations, User Profile
- Active state: purple background
- Hover state: subtle gray background

### Secondary Navigation (Top Bar)
- Breadcrumbs for context
- Model selector
- Help icon
- User avatar

### Mobile Navigation
- Hamburger menu icon
- Slide-in sidebar with scrim overlay
- Close button in sidebar

## Form Patterns

### Input States
1. **Default**: Gray border, placeholder text
2. **Focus**: Purple border, no placeholder
3. **Filled**: White text, removable
4. **Error**: Red border, error message below
5. **Disabled**: Reduced opacity, no interaction
6. **Success**: Green border (rare)

### Validation
- Inline validation on blur
- Error messages: red text, 14px, below field
- Required field indicator: red asterisk
- Password strength: progress bar below input

### Form Layout
- Labels above inputs
- 16px gap between fields
- Submit button: full-width on mobile, auto-width on desktop
- Helper text: gray, 13px, below input

## Loading States

### Skeleton Screens
- Used for: conversation list, message history
- Style: animated gradient shimmer
- Colors: --background-secondary to --background-tertiary
- Duration: 1.5s ease-in-out infinite

### Spinners
- Primary: rotating circle with purple gradient
- Size: 24px (inline), 48px (page-level)
- Used for: button loading, page transitions

### Progress Indicators
- Typing indicator: 3 bouncing dots
- Animation: staggered bounce
- Color: --purple-primary

## Empty States

### No Conversations
- Icon: chat bubble (48px)
- Heading: "No conversations yet"
- Description: "Start a new conversation to begin learning"
- CTA: "New Conversation" button

### No Messages
- Large centered content
- Hero orb animation
- Tagline and description
- Starter prompt cards (4 cards in grid)

### No Search Results
- Icon: magnifying glass
- Message: "No conversations found"
- Action: Clear search or create new

## Error States

### Inline Errors
- Icon: alert circle (16px, red)
- Text: red, 14px, below element
- Border: red, 2px on input

### Page-Level Errors
- Centered layout
- Error icon (64px)
- Heading: Clear error title
- Description: What happened
- Action: "Try Again" or "Go Back" button
- Support link: "Contact Support" (secondary)

### Network Errors
- Toast notification
- Icon: wifi-off
- Message: "Connection lost. Retrying..."
- Auto-dismiss on reconnect

## Interactions & Animations

### Timing Functions
```
--ease-out:     cubic-bezier(0, 0, 0.2, 1)
--ease-in:      cubic-bezier(0.4, 0, 1, 1)
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)
```

### Animation Durations
```
--duration-fast:   150ms   // Hover, focus
--duration-base:   250ms   // Transitions, dropdowns
--duration-slow:   350ms   // Modals, page transitions
--duration-slower: 500ms   // Complex animations
```

### Hover Effects
- Buttons: background color transition (150ms)
- Links: underline slide-in (200ms)
- Cards: subtle lift + shadow (250ms)
- Icons: scale(1.1) + rotation (200ms)

### Click/Tap Effects
- Scale down: scale(0.95) for 100ms
- Ripple effect: optional for primary buttons
- Haptic feedback: on mobile (if supported)

### Page Transitions
- Fade in: opacity 0 → 1 (300ms)
- Slide up: translateY(20px) → 0 (350ms)
- Cross-fade: between messages (200ms)

### Micro-interactions
- Checkbox: checkmark slide-in
- Toggle: knob slide + color change
- Copy button: check icon replace (1s)
- Send button: icon rotation on click

## Responsive Behavior

### Mobile (< 640px)
- Single column layout
- Full-width sidebar (overlay)
- Stacked navigation
- Larger touch targets (44px min)
- Bottom-fixed input composer
- Hide secondary UI elements
- Simplified header

### Tablet (640px - 1024px)
- Collapsible sidebar
- Two-column layout
- Preserved navigation
- Optimized touch + mouse
- Adaptive padding (reduced)

### Desktop (> 1024px)
- Fixed sidebar (280px)
- Multi-column layout
- Full feature set
- Hover states enabled
- Keyboard shortcuts
- Generous spacing

### Responsive Patterns
1. **Sidebar**: Fixed (desktop) → Overlay (mobile)
2. **Messages**: Wide (desktop) → Full-width (mobile)
3. **Starter Cards**: Grid 2×2 (desktop) → Stack (mobile)
4. **Source Chips**: Wrap (all sizes)
5. **Input**: Fixed height (desktop) → Auto-expand (mobile)

## Accessibility Requirements

### Color Contrast
- Text on background: min 7:1 (AAA)
- UI elements: min 4.5:1 (AA)
- Disabled elements: 3:1 acceptable

### Keyboard Navigation
- Tab order: logical flow (top to bottom, left to right)
- Focus indicators: 2px purple outline, 2px offset
- Skip links: "Skip to main content"
- Escape key: close modals, cancel actions
- Enter/Space: activate buttons
- Arrow keys: navigate lists

### Screen Readers
- Semantic HTML: `<nav>`, `<main>`, `<article>`
- ARIA labels: all icons, image-based buttons
- ARIA live regions: toast notifications, status updates
- Alt text: decorative images use alt=""
- Link purpose: clear link text or aria-label

### Focus Management
- Modal open: trap focus, remember previous
- Modal close: return focus to trigger
- Form submission: focus first error
- Notification: don't steal focus unless critical

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Page Layouts

### Chat Interface Layout
```
┌─────────────────────────────────────────────────┐
│  Sidebar (280px)  │     Main Panel              │
│  ┌──────────────┐ │  ┌─────────────────────┐   │
│  │ Brand        │ │  │  Top Bar            │   │
│  │ New Chat     │ │  └─────────────────────┘   │
│  │ Search       │ │  ┌─────────────────────┐   │
│  │              │ │  │                     │   │
│  │ Workspace    │ │  │  Messages           │   │
│  │              │ │  │  (Scrollable)       │   │
│  │ Recent       │ │  │                     │   │
│  │ - Thread 1   │ │  │                     │   │
│  │ - Thread 2   │ │  └─────────────────────┘   │
│  │ ...          │ │  ┌─────────────────────┐   │
│  │              │ │  │  Input Composer     │   │
│  │ Profile      │ │  └─────────────────────┘   │
│  └──────────────┘ │                             │
└─────────────────────────────────────────────────┘
```

### Auth Pages Layout
```
┌─────────────────────────────────────────────────┐
│                                                 │
│           ┌───────────────────┐                 │
│           │                   │                 │
│           │   Brand + Logo    │                 │
│           │                   │                 │
│           │   Form Card       │                 │
│           │   - Email         │                 │
│           │   - Password      │                 │
│           │   - Button        │                 │
│           │                   │                 │
│           │   Footer Links    │                 │
│           │                   │                 │
│           └───────────────────┘                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Component Specifications

### Conversation Thread Item
- Height: 48px
- Padding: 8px 12px
- Layout: dot icon (8px) + title text + more icon
- Truncate: title with ellipsis
- Active: purple background, white text
- Hover: gray background

### Source Chip
- Height: 28px
- Padding: 6px 12px
- Icon: file icon (12px) + text
- Badge: "MATCHED" tag (green)
- Border: 1px solid --surface-border
- Border-radius: 6px

### Message Actions Bar
- Layout: horizontal row, 8px gap
- Buttons: icon-only, 28px × 28px
- Icons: copy, thumbs up, thumbs down
- Separator: 1px divider
- Badge: "RAG grounded" with shield icon

### Markdown Code Block
- Background: --background-primary
- Border: 1px solid --surface-border
- Border-radius: 8px
- Header: language tag (uppercase, 11px)
- Padding: 16px
- Font: mono, 14px
- Line height: 1.6
- Scrollbar: styled (thin, purple)

## Design Tokens Export

All design tokens should be exported as:
1. **CSS Variables** (for runtime customization)
2. **JavaScript Constants** (for dynamic rendering)
3. **Figma Styles** (if design mockups exist)

Example CSS:
```css
:root {
  /* Colors */
  --color-purple-primary: #8b5cf6;
  
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --text-base: 1rem;
  
  /* Spacing */
  --space-4: 1rem;
  
  /* Animation */
  --duration-base: 250ms;
}
```

## Design Checklist

Before implementation, ensure:
- [ ] All colors have sufficient contrast
- [ ] Focus states are visible
- [ ] Touch targets are 44px minimum
- [ ] Text is readable at all sizes
- [ ] Animations respect reduced motion
- [ ] Error states are clear
- [ ] Loading states are informative
- [ ] Empty states are actionable
- [ ] Mobile breakpoints tested
- [ ] Keyboard navigation works
- [ ] Screen reader tested (basic)
