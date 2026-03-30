# Nyílászáró Ajánlat-előkészítő

## Project Summary
A Hungarian door and window (nyílászáró) quote preparation MVP web application designed for Hungarian SMEs (KKV). It helps in preparing, organizing, and outputting quotes in a clean, professional, and user-friendly "Craftsman's Dashboard" interface.

## Tech Stack
- **Frontend:** React 19, Vite, TailwindCSS, Radix UI, Framer Motion
- **Language:** TypeScript
- **Styling:** Tailwind CSS with a specific color palette (Dark Teal/Green-Blue #1B4332, Warm White #FAFAF8, Amber #D97706)
- **Form Handling:** React Hook Form with Zod validation
- **Backend/Tooling:** Node.js (Express), esbuild for server bundling
- **Package Manager:** pnpm

## Architecture
- Monorepo-like structure with `client/`, `server/`, and `shared/` directories.
- Frontend built as a Single Page Application (SPA) using Vite.
- Backend is a lightweight Express server for serving or handling API requests.
- UI components are built using Radix UI primitives and styled with Tailwind CSS (shadcn/ui-like approach).

## Current State
- MVP version with a selected design approach ("Modern Magyar KKV Eszköz").
- Core project structure is set up with Vite, React, and Tailwind.
- UI components and dependencies are installed and configured.
- The app uses a card-based layout optimized for both desktop and mobile.

## Key Decisions
- **Design Approach:** Selected "Modern Magyar KKV Eszköz" (Approach #2) over industrial or minimalist designs to appeal to the target audience (non-IT Hungarian SMEs).
- **Color Palette:** Uses dark teal for reliability, warm white to avoid sterility, and amber for important actions.
- **Typography:** Figtree for headings and Inter for body text.
- **Layout:** Sticky header with progress bar, vertical card-based content, and tab-based outputs.

## Next Steps
- Implement the core quote generation logic and forms.
- Connect frontend forms with backend data persistence (if applicable).
- Polish the UI according to the selected design philosophy.
- Test with real-world data and user flows.

## Prompts That Worked
- "Create a Hungarian window and door quote preparation web app with a clean, professional tool interface suitable for SMEs."
- "Implement a card-based layout with a sticky header and progress bar using Tailwind CSS."

## Context for New Session
When starting a new session, remember that this is a tool for Hungarian craftsmen/SMEs. The tone should be professional but approachable. Use the established color palette (Dark Teal, Warm White, Amber) and typography (Figtree, Inter). Focus on the `client/` directory for UI tasks and ensure responsiveness.
