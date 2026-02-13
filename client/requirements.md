## Packages
framer-motion | Complex animations for chat bubbles, page transitions, and scanning effects
react-markdown | Rendering markdown in chat messages
lucide-react | Icons for the UI (already in base, but emphasizing usage)
clsx | Utility for conditional classes (already in base)
tailwind-merge | Utility for merging tailwind classes (already in base)

## Notes
- Authentication is token-based via localStorage.
- API requests need `Authorization: Bearer <token>` header.
- ChatterBlast needs polling for new messages.
- DreamWeaver needs polling for job status.
- MindReader uses FormData for file uploads.
- Fonts: 'Orbitron' for headers, 'Rajdhani' for UI text, 'Inter' for body.
