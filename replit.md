# WhisperChat

## Overview

WhisperChat is a real-time chat application featuring private messaging ("whispers") with a glassmorphic design aesthetic. The application enables users to send public messages to all connected users or private messages to specific individuals through a whisper command system inspired by gaming platforms like Roblox. The UI draws design inspiration from Discord's messaging patterns and modern glassmorphic trends seen in iOS and Windows 11.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend Framework**: React with TypeScript
- Build tool: Vite for fast development and optimized production builds
- Routing: Wouter for lightweight client-side routing
- State Management: TanStack React Query for server state management
- UI Components: Radix UI primitives with shadcn/ui component library
- Styling: Tailwind CSS with custom design system (New York style variant)

**Backend Framework**: Node.js with Express
- Runtime: TypeScript with ESM modules
- Real-time Communication: Socket.io for WebSocket-based messaging
- Session Management: In-memory session storage (production-ready for PostgreSQL sessions via connect-pg-simple)

**Database Solution**: 
- ORM: Drizzle ORM configured for PostgreSQL
- Database Provider: Neon serverless PostgreSQL
- Schema Management: Drizzle Kit for migrations
- Current Schema: Simple user table with username/password authentication

### Authentication Architecture

**Current Implementation**: Password-based authentication with hardcoded password ("BoysOnly")
- In-memory user storage during runtime
- Username-based identification (case-insensitive)
- No persistent sessions across server restarts
- Socket.io connection tied to login state

**Rationale**: Simplified authentication suitable for private/demo deployment. The architecture is designed to be easily upgradeable to proper session-based auth with database persistence.

### Real-time Messaging Architecture

**Socket.io Event System**:
- Connection tracking: Maps socket IDs to usernames in-memory
- Public messages: Broadcast to all connected clients
- Whisper messages: Direct socket-to-socket private messaging
- User presence: Real-time online user list updates on join/leave
- Event-driven architecture for instant message delivery

**Message Types**:
1. Public chat messages (visible to all users)
2. Whisper messages (private, recipient-only)
3. System messages (join/leave notifications)

**Design Decision**: Socket.io chosen over raw WebSockets for built-in reconnection handling, room support, and event abstraction. The whisper command pattern (`/w username message`) provides familiar UX for users from gaming platforms.

### Frontend Architecture

**Component Structure**:
- Route-based organization with wouter for SPA navigation
- Shadcn/ui provides pre-built, accessible component primitives
- Custom design system extends Tailwind with glassmorphic styling variables
- Responsive design with mobile-first approach

**Design System**:
- CSS custom properties for theme colors and glassmorphic effects
- Consistent spacing primitives (2, 4, 6, 8 unit scale)
- Typography hierarchy using DM Sans/Inter fonts
- Backdrop blur and transparency effects throughout UI
- Light/dark mode support via CSS variables

**State Management Pattern**: 
- React Query for server data (configured with aggressive caching)
- Local component state for UI interactions
- Socket.io event handlers manage real-time updates
- No global state library needed due to simple state requirements

### Build and Deployment

**Development Mode**:
- Vite dev server with HMR for frontend
- Express server with tsx for TypeScript execution
- Vite middleware integration for seamless full-stack development
- Replit-specific plugins for cartographer and dev banner

**Production Build**:
- ESBuild bundles server code with selective dependency bundling
- Vite builds optimized client assets
- Single-file server output (dist/index.cjs) for fast cold starts
- Static asset serving from dist/public

**Bundling Strategy**: Server dependencies are selectively bundled (allowlist) to reduce syscalls and improve cold start times while keeping framework code external. This balances bundle size with startup performance.

## External Dependencies

### Third-Party Services

**Database**: Neon Serverless PostgreSQL
- Accessed via `@neondatabase/serverless` driver
- Connection URL from `DATABASE_URL` environment variable
- Serverless-optimized for edge deployment

### Key NPM Packages

**UI Framework**:
- `@radix-ui/*`: Headless UI primitives for accessibility
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority` + `clsx`: Component variant management
- `lucide-react`: Icon library

**Data Management**:
- `drizzle-orm`: Type-safe SQL ORM
- `drizzle-zod`: Zod schema generation from database schema
- `@tanstack/react-query`: Async state management

**Real-time Communication**:
- `socket.io`: WebSocket library for bidirectional communication
- `socket.io-client`: Client-side Socket.io (bundled in served files)

**Form Handling**:
- `react-hook-form`: Performant form state management
- `@hookform/resolvers`: Validation resolver integration
- `zod`: Runtime type validation

**Session Management**:
- `express-session`: Session middleware
- `connect-pg-simple`: PostgreSQL session store (configured but not actively used)

**Development Tools**:
- `@replit/vite-plugin-*`: Replit-specific development enhancements
- `tsx`: TypeScript execution for Node.js
- `drizzle-kit`: Database migration tooling

### API Integrations

Currently no external API integrations beyond the database. The application is self-contained with Socket.io handling all real-time communication internally.