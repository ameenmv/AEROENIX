# Project Structure

The project follows a modular, feature-based architecture. Here's the key directory breakdown:

```
src/
├── assets/              # Static assets (images, fonts, CSS overrides)
├── components/
│   ├── admin/           # Admin-specific components (ModularView, guards)
│   ├── common/          # Shared reusable components (PermGuard, modals)
│   ├── layout/          # Layout wrappers & chrome (AdminLayout, AuthLayout,
│   │                    #   BlankLayout, AppSidebar, Navbar, Logo)
│   ├── ui/              # Higher-level UI components (DataTable, FormContainer,
│   │                    #   InfoCard, StatsHeader, ScrollableList, etc.)
│   └── uic/             # shadcn/ui primitives (Button, Card, Input, Dialog…)
├── composables/         # Vue composables (useTable, useForm, useDetails,
│                        #   useDarkMode, useCan, useModal, usePusher…)
├── config/              # Application configuration
│   ├── endpoints.ts     # API endpoint constants
│   └── navigation.ts    # Sidebar navigation config
├── directives/          # Custom Vue directives (v-can)
├── i18n/                # Internationalization config & locale files (en/, ar/)
├── modules/             # Module definitions (columns, fields, schema, routes)
│   └── _shared/         # Shared schemas & utilities (phoneSchema, UserSchema)
├── router/
│   ├── index.ts         # Main router with guards (auth, permission, locale)
│   ├── modules.ts       # Module registry & route collector (registerModule)
│   └── routeActions.ts  # Route action helpers (modal vs page navigation)
├── services/
│   ├── api.ts           # Axios instance with interceptors
│   └── *Service.ts      # Resource-specific API services
├── stores/              # Pinia stores (auth, filter, permissions, sonar, pdf)
├── stories/             # Histoire component stories
├── types/               # TypeScript type definitions
│   ├── api.ts           # API response types
│   ├── config.ts        # ResourceConfig, FormField, TableColumn
│   ├── components/      # Component & view prop types
│   ├── composables/     # Composable option & return types
│   ├── entities/        # Entity interfaces (User, Product, Post)
│   ├── services/        # Service-specific types
│   └── stores/          # Store-specific types
├── utils/               # Utility functions
│   ├── cn.ts            # Tailwind class-merge helper (clsx + twMerge)
│   └── mapbox-draw-rectangle-mode.ts
├── views/
│   ├── admin/           # Admin pages (dashboard, auth, resource views)
│   │   └── auth/        # Authentication pages (Login, Register, OTP…)
│   └── NotFoundView.vue
├── App.vue              # Root component (layout switcher)
├── main.ts              # App entry point
└── style.css            # Global styles & CSS variables (dark/light themes)
```

::: tip
Each module has files spread across several directories. The `bun run make:module` command scaffolds all of them at once. See [Scaffold Command](/guide/core/scaffold-command).
:::

## Key Principles

- **Schemas live with their module** — each module's `schema.ts` contains both form and API validation schemas. Shared schemas (e.g. `phoneSchema`) live in `modules/_shared/schemas.ts`.
- **Components are auto-imported** — everything in `src/components/` is auto-imported via `unplugin-vue-components`.
- **Types mirror the source** — `types/components/` for component props, `types/composables/` for composable options, etc.
