# AffilAI - Affiliate Campaign Management Desktop App

A modern, local-first desktop application for managing affiliate marketing campaigns with AI-powered ad generation.

Built with **Tauri 2 + React 19 + TypeScript + Tailwind CSS + shadcn/ui**

---

## Current Status (v0.1.0)

| Feature | Status |
|---------|--------|
| Product Management | Complete |
| Affiliate Link Generation | Complete |
| Credentials/Settings | Complete |
| Ad Generation Modal | Complete |
| Dark Mode | Complete |
| Responsive Sidebar | Complete |
| Campaigns | UI Only |
| Analytics | UI Only |

---

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for development/builds
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router 7** for navigation
- **Lucide React** for icons
- **Recharts** for analytics charts (planned)

### Backend
- **Rust** with Tauri 2
- **SQLite** via rusqlite
- Local-first data storage

### Why Tauri?
- ~600KB runtime (vs Electron's 150MB+)
- Native performance
- Strong security model
- Lower memory footprint

---

## Project Structure

```
affilai/
├── src/                              # React frontend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx            # Main layout with sidebar state
│   │   │   └── Sidebar.tsx           # Navigation sidebar
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── AdGenerationModal.tsx     # AI ad copy generator
│   │   └── ProductForm.tsx           # Product create/edit form
│   ├── contexts/
│   │   └── LayoutContext.tsx         # Centralized UI state (sidebar)
│   ├── hooks/
│   │   └── useAdGeneration.ts        # Ad generation hook
│   ├── pages/
│   │   ├── Dashboard.tsx             # Overview stats
│   │   ├── Products.tsx              # Product CRUD
│   │   ├── Links.tsx                 # Affiliate link management
│   │   ├── Campaigns.tsx             # Campaign management (placeholder)
│   │   ├── Analytics.tsx             # Performance tracking (placeholder)
│   │   └── Settings.tsx              # Credential configuration
│   ├── services/
│   │   ├── api.ts                    # Tauri command wrappers
│   │   └── adApi.ts                  # Ad generation API
│   ├── types/
│   │   ├── index.ts                  # Core types
│   │   └── ad.ts                     # Ad generation types
│   └── lib/
│       └── utils.ts                  # Utilities (cn helper)
├── src-tauri/                        # Rust backend
│   └── src/
│       ├── commands/
│       │   ├── products.rs           # Product CRUD commands
│       │   ├── affiliate_links.rs    # Link generation commands
│       │   ├── credentials.rs        # Credential management
│       │   └── ad_generation.rs      # AI ad generation
│       ├── models/
│       │   ├── product.rs
│       │   ├── affiliate_link.rs
│       │   └── affiliate_credentials.rs
│       ├── services/
│       │   ├── ai_affiliate.rs       # AI service integration
│       │   └── analytics_service.rs  # Analytics queries
│       ├── database/
│       │   ├── mod.rs                # DB initialization
│       │   └── schema.rs             # Schema management
│       ├── lib.rs                    # Tauri setup
│       └── main.rs                   # Entry point
└── migrations/                       # SQLite migrations
    ├── 001_initial_schema.sql
    ├── 002_seed_products.sql
    ├── 003_affiliate_links_extension.sql
    ├── 004_add_platform_to_links.sql
    ├── 005_affiliate_credentials.sql
    └── 006_ad_copies_product_fk.sql
```

---

## Architecture Patterns

### UI State Management

Layout state (sidebar open/closed) is managed via React Context to avoid prop drilling and ensure consistent behavior across components.

```tsx
// src/contexts/LayoutContext.tsx
const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useLayout();
```

**Important**: For layout-affecting styles in Tauri webviews, use inline styles rather than Tailwind classes. Tailwind class merging can be unreliable in webview contexts.

```tsx
// Use this pattern for dynamic layout shifts
<main style={{ marginLeft: isSidebarOpen ? 256 : 0 }}>
```

### API Layer

Frontend communicates with Rust backend via Tauri's `invoke` function. All API calls are wrapped in service modules:

```tsx
// src/services/api.ts
import { invoke } from "@tauri-apps/api/core";

export const productApi = {
  getAll: () => invoke("get_all_products"),
  create: (input) => invoke("create_product", { input }),
  // ...
};
```

### Database

SQLite database is created automatically on first launch. Migrations run sequentially. Data is stored locally in the Tauri app data directory.

---

## Available Commands

### Development

```bash
# Install dependencies
npm install

# Start development (frontend only)
npm run dev

# Start Tauri development (full app)
npm run tauri:dev
```

### Production

```bash
# Build frontend
npm run build

# Build Tauri app
npm run tauri:build

# Output: src-tauri/target/release/
```

---

## Tauri Commands (Backend API)

### Products
| Command | Description |
|---------|-------------|
| `get_all_products` | List all products |
| `get_product_by_id` | Get single product |
| `create_product` | Add new product |
| `update_product` | Update existing product |
| `delete_product` | Remove product |
| `search_products` | Search by name/category |

### Affiliate Links
| Command | Description |
|---------|-------------|
| `get_all_affiliate_links` | List all links |
| `get_links_by_product` | Links for specific product |
| `discover_affiliate_programs` | Find programs for product |
| `generate_affiliate_link` | Create tracking link |
| `generate_link_for_platform` | Create link for specific platform |
| `refresh_affiliate_link` | Update link status |
| `delete_affiliate_link` | Remove link |

### Credentials
| Command | Description |
|---------|-------------|
| `get_all_credentials` | List saved credentials |
| `get_credential_by_platform` | Get specific platform credential |
| `save_credential` | Save/update credential |
| `delete_credential` | Remove credential |

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `products` | Product catalog with platform-specific IDs |
| `affiliate_programs` | Affiliate networks and commission rates |
| `product_programs` | Product-Program associations |
| `affiliate_links` | Generated tracking links |
| `affiliate_credentials` | Platform credentials (affiliate IDs) |
| `campaigns` | Marketing campaigns |
| `ad_copies` | Ad copy variations |
| `performance_records` | Analytics data |
| `click_events` | Click tracking |
| `conversion_events` | Conversion tracking |

### Product Fields

Products support platform-specific identifiers:
- `amazon_asin` - Amazon product ASIN
- `tiktok_product_id` - TikTok Shop product ID
- `instagram_product_id` - Instagram product ID
- `youtube_video_id` - YouTube video ID
- `pinterest_pin_id` - Pinterest pin ID
- `product_url` - General product URL

---

## Pre-loaded Data

### 10 Trending Products (2025-2026)
1. Smart Rings (Oura) - Wearable Health
2. Snail Mucin Serums - K-Beauty (TikTok Viral)
3. Massage Guns - Fitness Recovery
4. Insulated Water Bottles - Stanley/Owala
5. Health Supplements - Creatine, Magnesium
6. Wireless Earbuds - AirPods Alternatives
7. Bakuchiol Serum - Natural Retinol
8. Air Fryers - Kitchen Gadgets
9. Activewear - Leggings & Shorts
10. Home Projectors - Entertainment

### Pre-configured Affiliate Programs
- Amazon Associates (4-10%)
- ShareASale (10%)
- CJ Affiliate (10%)
- Rakuten Advertising (8%)
- TikTok Shop Affiliate (20%)
- Naturecan (20%)
- Athletic Greens (30%)
- Onnit (12%)

---

## Roadmap

### Phase 1: MVP - COMPLETE
- [x] Tauri + React setup
- [x] Database schema with migrations
- [x] Product CRUD operations
- [x] App shell with routing
- [x] Pre-populated trending products
- [x] Dark mode toggle
- [x] Responsive sidebar (push layout)

### Phase 2: Link Management - COMPLETE
- [x] Affiliate link generator
- [x] Platform-specific link creation
- [x] Link storage and display
- [x] Copy to clipboard
- [x] Credential configuration (Settings)

### Phase 3: Ad Generation - IN PROGRESS
- [x] Ad generation modal UI
- [x] Product-specific ad copy
- [ ] AI integration (Claude API)
- [ ] Multiple ad format support
- [ ] Save generated ads

### Phase 4: Campaign Management - PLANNED
- [ ] Campaign builder
- [ ] Platform selection
- [ ] Ad copy management
- [ ] Campaign status tracking

### Phase 5: Analytics - PLANNED
- [ ] Performance tracking
- [ ] Analytics dashboard with charts
- [ ] Revenue visualization
- [ ] ROI calculations

### Future Enhancements
- [ ] API integrations (Amazon, ShareASale, CJ)
- [ ] Automated performance sync
- [ ] Export reports (CSV, PDF)
- [ ] Backup/restore database
- [ ] Cloud sync (optional)

---

## Development Notes

### Key Principles
1. **Local-First** - All data in SQLite, no cloud required
2. **Privacy-Focused** - Full data ownership
3. **Type-Safe** - TypeScript frontend, Rust backend
4. **Maintainable** - Clear architecture, documented patterns

### Known Issues
- Tailwind class merging unreliable for layout shifts in Tauri webview (use inline styles)
- Window starts at 800x600 (configurable in `tauri.conf.json`)

### Contributing
When adding UI state that affects layout:
1. Add state to `LayoutContext.tsx`
2. Consume via `useLayout()` hook
3. Use inline styles for layout-critical changes

---

## Resources

- [Tauri 2 Documentation](https://v2.tauri.app/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Built with Tauri, React, and TypeScript**
