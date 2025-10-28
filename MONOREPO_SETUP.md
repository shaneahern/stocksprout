# Monorepo Setup (Phase 1.1)

This document describes the monorepo structure for StockSprout.

## Structure

```
stocksprout/
├── packages/
│   ├── shared/          # Shared code: schema, types, API client
│   ├── hooks/           # React Query hooks
│   └── components/      # Cross-platform UI components (to be migrated)
├── apps/
│   ├── web/            # Web application (React + Vite)
│   ├── mobile/         # Mobile app (React Native - future)
│   └── desktop/        # Desktop app (Electron - future)
├── server/             # Express backend (stays as-is)
└── turbo.json          # Turborepo configuration
```

## Package Descriptions

### @stocksprout/shared
- Database schema (Drizzle ORM + Zod)
- TypeScript types
- API client utilities
- Business logic

### @stocksprout/hooks
- React Query hooks and query client
- Custom React hooks

### @stocksprout/components
- Cross-platform UI components
- Will replace shadcn/ui in Phase 1.2

## Commands

```bash
# Install dependencies
npm install

# Run dev server (web + backend)
npm run dev

# Build all packages
npm run build

# Type check all packages
npm run check

# Run database migrations
npm run db:push
```

## Migration Status

✅ Phase 1.1 Complete:
- Monorepo structure created
- Turborepo configured
- Workspaces set up
- Shared package with schema migrated
- Hooks package structure created

⏳ Next Steps (Phase 1.2):
- Migrate components to @stocksprout/components
- Set up React Native Web
- Migrate web app to apps/web

## Notes

- The `client/` directory still exists for backward compatibility
- `server/` directory remains unchanged
- `shared/` directory is mirrored in `packages/shared/src/` for now
