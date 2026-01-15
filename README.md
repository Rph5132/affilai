# AffilAI - Affiliate Campaign Management Desktop App

**A modern, local-first desktop application for managing affiliate marketing campaigns with trending products.**

Built with **Tauri + React + TypeScript** for a lightweight, fast, and privacy-focused experience.

---

## ✨ Features

### Current MVP (v0.1.0)

- 📦 **Product Management** - Pre-loaded with 10 trending products for 2025-2026
- 🔗 **Product CRUD Operations** - Create, read, update, delete products
- 🎨 **Modern UI** - Clean interface with Tailwind CSS and shadcn/ui components
- 🗄️ **Local SQLite Database** - All data stored locally for privacy
- 📊 **Dashboard** - Overview of campaigns, links, and revenue
- 🧭 **Navigation** - Sidebar with 6 main sections
- 🌙 **Dark Mode Ready** - Theme system prepared (not yet toggled)

### Pre-loaded Products

1. **Smart Rings (Oura)** - Wearable Health Technology
2. **Snail Mucin Serums** - K-Beauty Skincare (TikTok Viral)
3. **Massage Guns** - Fitness Recovery
4. **Insulated Water Bottles** - Stanley/Owala
5. **Health Supplements** - Creatine, Magnesium, Collagen
6. **Wireless Earbuds** - AirPods Alternatives
7. **Bakuchiol Serum** - Natural Retinol Alternative
8. **Air Fryers** - Kitchen Gadgets
9. **Activewear** - Leggings & Shorts
10. **Home Projectors** - Home Entertainment

### Pre-configured Affiliate Programs

- Amazon Associates (4-10% commission)
- ShareASale (10% average)
- CJ Affiliate (10% average)
- Rakuten Advertising (8%)
- TikTok Shop Affiliate (20%)
- Naturecan (20%)
- Athletic Greens (30%)
- Onnit (12%)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ - [Download](https://nodejs.org/)
- **Rust** (stable) - [Install](https://rustup.rs/)
- **Visual Studio Build Tools** (Windows C++ workload)
- **WebView2** (pre-installed on Windows 10/11)

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

The app will launch with the database automatically initialized and pre-populated with trending products!

### Build for Production

```bash
# Create optimized executable
npm run build

# Output location:
# src-tauri\target\release\affilai.exe
```

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for blazing-fast builds
- Tailwind CSS for styling
- shadcn/ui component system
- React Router for navigation
- Lucide React for icons

**Backend:**
- Rust with Tauri 2
- SQLite database (rusqlite)
- Local-first data storage
- Zero configuration

**Why Tauri?**
- 600KB runtime (vs Electron's 150MB)
- Native Windows performance
- Strong security model
- Lower memory footprint

### Project Structure

```
c:\afilai\
├── src/                          # React frontend
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   └── layout/               # Layout components
│   ├── pages/                    # Page components
│   ├── services/                 # API service layer
│   ├── types/                    # TypeScript types
│   └── lib/                      # Utilities
├── src-tauri/                    # Rust backend
│   └── src/
│       ├── commands/             # Tauri commands
│       ├── models/               # Data models
│       └── database/             # Database logic
└── migrations/                   # SQL migrations
```

---

## 📊 Database Schema

### Core Tables

- **products** - Product catalog (10 trending products)
- **affiliate_programs** - Affiliate networks and commission rates
- **product_programs** - Product-Program associations
- **affiliate_links** - Generated tracking links (coming soon)
- **campaigns** - Marketing campaigns (coming soon)
- **ad_copies** - Ad copy variations (coming soon)
- **creative_assets** - Images/videos (coming soon)
- **performance_records** - Analytics data (coming soon)
- **click_events** - Click tracking (coming soon)
- **conversion_events** - Conversion tracking (coming soon)

---

## 🎯 Roadmap

### Phase 1: MVP ✅ COMPLETE
- [x] Tauri + React setup
- [x] Database schema
- [x] Product CRUD operations
- [x] App shell with routing
- [x] Products page
- [x] Pre-populate 10 trending products

### Phase 2: Link Management (Next)
- [ ] Affiliate link generator
- [ ] UTM parameter builder
- [ ] Link storage and organization
- [ ] Copy to clipboard
- [ ] Link testing

### Phase 3: Campaign Management
- [ ] Campaign builder
- [ ] Platform selection (TikTok, Instagram, YouTube, etc.)
- [ ] Ad copy management
- [ ] Campaign status tracking

### Phase 4: Analytics & Tracking
- [ ] Manual performance tracking
- [ ] Analytics dashboard with charts
- [ ] Revenue visualization
- [ ] ROI calculations
- [ ] Platform performance breakdown

### Phase 5: Advanced Features
- [ ] Creative asset management
- [ ] Campaign templates
- [ ] Export reports (CSV, PDF)
- [ ] Import performance data
- [ ] Backup/restore database

### Future Enhancements
- [ ] Amazon Associates API integration
- [ ] ShareASale API integration
- [ ] CJ Affiliate API integration
- [ ] Automated performance sync
- [ ] AI-powered ad copy generation (Claude API)
- [ ] Cloud sync (optional)
- [ ] Scheduled reports
- [ ] Performance alerts

---

## 🔧 Available Commands

### Frontend (React)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend (Tauri)

All Tauri commands are accessed via the frontend API layer.

**Product Commands:**
- `get_all_products()` - List all products
- `get_product_by_id(id)` - Get single product
- `create_product(input)` - Add new product
- `update_product(input)` - Update existing product
- `delete_product(id)` - Remove product
- `search_products(query)` - Search by name/category

---

## 📝 Development Notes

### Key Design Principles

1. **Local-First** - All data stored locally in SQLite for privacy and speed
2. **Privacy-Focused** - No cloud sync required, full data ownership
3. **Efficient UI** - Minimize clicks, clear actions, instant feedback
4. **Professional** - Clean, modern design suitable for business use
5. **Maintainable** - TypeScript, clear architecture, documented code
6. **Scalable** - Can add API integrations and cloud features later

### Performance Targets

- App launches in < 3 seconds
- UI is responsive (no lag)
- Database queries are fast (< 100ms)

---

## 📚 Resources

- [Tauri Documentation](https://tauri.app/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Market Research Plan](/.claude/plans/vectorized-napping-dragon.md)

---

**Built with ❤️ using Tauri, React, and TypeScript**

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
