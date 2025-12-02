# WhisperChat Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Discord (messaging patterns, notifications), Roblox (whisper command system), and modern glassmorphic design trends (iOS, Windows 11). This is an experience-focused chat application where visual appeal and smooth interactions drive engagement.

## Core Design Principles
1. **Glassmorphic Aesthetic**: Semi-transparent panels with backdrop blur effects throughout
2. **Playful Professionalism**: Balance chat app familiarity with unique whisper mechanics
3. **Real-time Feedback**: Instant visual responses to all user actions
4. **Spatial Clarity**: Clear visual separation between public chat, whispers, and system messages

## Typography
- **Primary Font**: 'Inter' or 'DM Sans' from Google Fonts for clean readability
- **Hierarchy**:
  - App title "WhisperChat": Large, bold (text-2xl or text-3xl, font-bold)
  - Usernames in chat: Medium weight (text-sm, font-semibold)
  - Message text: Regular weight (text-base)
  - Timestamps/metadata: Small, lighter weight (text-xs, opacity-70)
  - System notifications: Italic, smaller (text-sm, italic)

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 for consistent rhythm (p-4, m-6, gap-8, etc.)

### Login Screen
- Centered card layout with glassmorphic container
- Logo/title at top
- Input fields stacked vertically with gap-4
- Login button below inputs
- Error message space with smooth fade-in animation

### Main Chat Dashboard (Two-Panel Layout)
**Left Sidebar (Online Users)**:
- Width: 280px fixed on desktop, full-width drawer on mobile
- Sticky header with "Online Users" title and count badge
- Scrollable user list with hover states
- Each user entry: clickable card with username and online indicator dot

**Main Chat Area**:
- Flexible width, fills remaining space
- Fixed header with app title and logout button
- Scrollable message container (auto-scroll to bottom)
- Fixed bottom input area with send button

## Component Library

### Glassmorphic Containers
All panels use:
- Semi-transparent backgrounds (bg-white/10 or bg-black/20)
- Backdrop blur effect (backdrop-blur-lg)
- Subtle borders (border border-white/20)
- Soft shadows for depth
- Rounded corners (rounded-xl or rounded-2xl)

### Message Bubbles
**Public Messages**:
- Standard bubble with username label above
- Semi-transparent background
- Padding: p-3
- Border radius: rounded-lg
- Username in bold with colon separator
- Fade-in animation on appearance

**Whisper Messages**:
- Distinct visual treatment (different background opacity or subtle border accent)
- Prefix indicator: "🔒 To [username]:" or "🔒 From [username]:"
- Slightly different bubble styling to distinguish from public chat

**System Notifications** (Join/Leave):
- Centered, italicized text
- Lower opacity (opacity-60)
- Smaller size
- Icon prefix (• or →/←)
- Example: "• UserName joined the chat"

### User List Items
- Compact card design (p-3)
- Username with online status indicator (green dot)
- Hover state: slight scale and brightness increase
- Click interaction: fills input with "/w username "
- Smooth transitions on all states

### Input Area
**Message Input**:
- Full-width text input with glassmorphic styling
- Placeholder: "Type a message or /w username to whisper..."
- Padding: p-3 or p-4
- Rounded corners matching container style

**Send Button**:
- Icon-based (paper plane or arrow icon from Heroicons)
- Glassmorphic treatment matching container
- Padding: p-3
- Position: adjacent to input (flex layout)

### Buttons (Login, Logout, Send)
- Glassmorphic background with backdrop blur
- Padding: px-6 py-3 for standard buttons
- Rounded: rounded-lg
- Hover state: Slight brightness increase, subtle scale (transform: scale(1.02))
- Active/Press state: Slight scale down (transform: scale(0.98))
- Smooth transitions: transition-all duration-200

## Animations
Use sparingly for polish:
- **Message Fade-in**: Opacity 0 to 1, translate-y by 8px, duration: 300ms
- **User Join/Leave**: Fade-in/out for list items, duration: 200ms
- **Button Interactions**: Scale transforms, duration: 150ms
- **Error Messages**: Shake animation on login error, duration: 400ms
- No scroll-triggered or continuous animations

## Accessibility
- Input fields: Clear labels or aria-labels
- Focus states: Visible outline/ring on all interactive elements
- Color contrast: Ensure text readable against semi-transparent backgrounds
- Keyboard navigation: Tab through inputs, users list, and buttons
- Enter key submits messages and login form

## Icon Usage
**Icon Library**: Heroicons via CDN (single library)
- Send message: Paper airplane or arrow-right icon
- Online status: Circle icon (solid fill)
- Logout: Arrow-right-on-rectangle icon
- Whisper indicator: Lock icon or eye-slash icon
- Error state: Exclamation-circle icon

## Sound Effects
Minimal audio feedback:
- Message send: Subtle "pop" or "whoosh" (use Web Audio API or audio elements)
- Message receive: Soft notification tone
- Volume: Low, non-intrusive
- Implementation: Small audio files, triggered via JavaScript

## Responsive Considerations
**Desktop (lg breakpoint)**:
- Two-column layout: sidebar + chat area
- Sidebar width: 280px fixed

**Mobile/Tablet**:
- Stack layout: Collapsible sidebar (hamburger menu) or tab-based navigation
- Full-width chat area
- Input area sticky at bottom
- User list accessible via overlay/drawer

## Images
No hero images for this application. This is a utility-focused chat interface where functionality takes precedence. All visual interest comes from the glassmorphic design treatment and smooth interactions.