# WhisperChat

## Overview

WhisperChat is a real-time chat application featuring private messaging ("whispers") with a glassmorphic design aesthetic. The application enables users to send public messages to all connected users or private messages to specific individuals through a whisper command system inspired by gaming platforms like Roblox. The UI draws design inspiration from Discord's messaging patterns and modern glassmorphic trends seen in iOS and Windows 11.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack

**Frontend**: Vanilla HTML, CSS, and JavaScript
- No frameworks - pure HTML5, CSS3, and ES6+ JavaScript
- Socket.io client for real-time WebSocket communication
- Glassmorphic CSS design with backdrop-filter effects
- Responsive design with mobile-first approach

**Backend Framework**: Node.js with Express
- Runtime: TypeScript with ESM modules (compiled to CommonJS for production)
- Real-time Communication: Socket.io for WebSocket-based messaging
- In-memory user storage for active sessions

**Project Structure**:
```
public/           # Vanilla HTML/CSS/JS frontend
  ├── index.html  # Main HTML file with login and chat screens
  ├── style.css   # Glassmorphic styling
  ├── app.js      # Client-side Socket.io logic
  └── favicon.png # App icon
server/           # Express + Socket.io backend
  ├── index.ts    # Server entry point
  ├── routes.ts   # Socket.io event handlers
  └── static.ts   # Production static file serving
```

### Authentication Architecture

**Current Implementation**: Password-based authentication with hardcoded password ("BoysOnly")
- In-memory user storage during runtime
- Username-based identification (case-insensitive)
- No persistent sessions across server restarts
- Socket.io connection tied to login state

**Rationale**: Simplified authentication suitable for private/demo deployment.

### Real-time Messaging Architecture

**Socket.io Event System**:
- Connection tracking: Maps socket IDs to usernames in-memory
- Public messages: Broadcast to all connected clients
- Whisper messages: Direct socket-to-socket private messaging
- User presence: Real-time online user list updates on join/leave
- Event-driven architecture for instant message delivery

**Message Types**:
1. Public chat messages (visible to all users)
2. Whisper messages (private, recipient-only) - use `/w username message`
3. System messages (join/leave notifications)

**Design Decision**: Socket.io chosen over raw WebSockets for built-in reconnection handling, room support, and event abstraction. The whisper command pattern (`/w username message`) provides familiar UX for users from gaming platforms.

### Build and Deployment

**Development Mode**:
- Express server with tsx for TypeScript execution
- Static files served directly from `public/` folder
- Run with `npm run dev`

**Production Build**:
- Run `npm run build` to create production bundle
- ESBuild bundles server code to `dist/index.cjs`
- Public folder copied to `dist/public/`
- Run with `npm start`

## Deployment on Render

### Option 1: Using render.yaml (Blueprint)
1. Push code to a Git repository (GitHub, GitLab, etc.)
2. Create a new "Blueprint" on Render
3. Connect your repository
4. Render will auto-detect `render.yaml` and configure everything

### Option 2: Manual Setup
1. Create a new "Web Service" on Render
2. Connect your Git repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `10000` (or let Render set it automatically)

### Important Notes for Render
- The app uses WebSockets (Socket.io), which Render supports on all plans
- No database required - users are stored in memory
- Sessions reset when the service restarts
- Free tier may sleep after inactivity (15 minutes)

## Key NPM Packages

**Real-time Communication**:
- `socket.io`: WebSocket library for bidirectional communication (server)
- Socket.io client is loaded via CDN in the frontend

**Server Framework**:
- `express`: Web framework for Node.js

**Development Tools**:
- `tsx`: TypeScript execution for Node.js
- `esbuild`: Fast JavaScript bundler
- `vite`: Build tool (used for bundling)

## API Reference

### Socket.io Events

**Client to Server**:
- `login`: `{ username: string, password: string }` - Authenticate user
- `public-message`: `{ message: string }` - Send public message
- `whisper`: `{ to: string, message: string }` - Send private message
- `logout`: No payload - Disconnect user

**Server to Client**:
- `login-success`: `{ username: string }` - Authentication successful
- `login-error`: `{ message: string }` - Authentication failed
- `user-list`: `string[]` - Updated list of online users
- `user-joined`: `{ username: string }` - New user connected
- `user-left`: `{ username: string }` - User disconnected
- `public-message`: `{ username: string, message: string }` - New public message
- `whisper`: `{ from: string, to: string, message: string }` - Received whisper
- `whisper-sent`: `{ to: string, message: string }` - Whisper delivery confirmed
- `whisper-error`: `{ message: string }` - Whisper failed

## Recent Changes

- Built vanilla HTML/CSS/JS frontend with glassmorphic design
- Implemented Socket.io real-time chat with whisper support
- Added Render.com deployment configuration
- Created production build pipeline
