# 📁 File Picker - Stack AI Take-Home Task

A modern, intuitive file picker interface for Google Drive connections with knowledge base indexing capabilities. Built with Next.js, TypeScript, and Tailwind CSS.

## 🖼️ Demo

![File Picker Demo](./public/file-picker-demo.png)

*File Picker interface showing hierarchical folder structure, search functionality, and indexing capabilities*

## ✨ Features

- **📁 File Management**: Hierarchical navigation, soft delete, real-time updates
- **🔍 Search & Sort**: Global search with name/date sorting options
- **🧠 Knowledge Base**: Selective indexing with visual indicators
- **🎨 Mac-style UI**: Authentic window design with smooth animations

## 🛠️ Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: React hooks with optimized re-renders
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

## 🏗️ Architecture

- **Layered Domains**: Business types live in `src/domain`, HTTP clients in `src/services`, and sharable utilities in `src/lib`
- **Feature Slices**: Explorer, knowledge-base, and selection logic sit under `src/features/*` for clear ownership
- **URL State Management**: `useRouteState` replaces `localStorage`, keeping connection, KB, and visibility state in the URL
- **React Query + Suspense**: Data hooks opt into optimistic cache updates and are wrapped with error/suspense boundaries
- **Prefetch & Optimism**: Hover prefetch warms child folders while mutations stay optimistic with graceful rollback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd file_picker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your Stack AI credentials:
   ```env
   # Test credentials
   STACK_AI_EMAIL=your_email
   STACK_AI_PASSWORD=your_password
   
   # Backend configuration
   STACK_AI_BACKEND_URL=https://api.stack-ai.com
   
   # Authentication configuration
   STACK_AI_AUTH_URL=your_auth_url
   STACK_AI_ANON_KEY=your_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Key Components

- **ExplorerView**: Top-level explorer experience used on `/explorer`
- **ExplorerToolbar & ExplorerTree**: Reusable UI for both explorer and `/kb/[kbId]`
- **useExplorer / useKnowledgeBase**: Data hooks that compose queries, selection, and URL state
- **useResourceSelection**: Feature-scoped selection engine with dedupe + backend payload helpers
- **useKbMutations**: Handles knowledge base creation and sync with staging cache updates

## 🧭 Routes

- `/` – landing page
- `/explorer` – connection explorer powered by `ExplorerView`

## 🗂️ Structure Overview

```
src
├─ app/
│  └─ explorer/page.tsx
├─ domain/
├─ features/
│  ├─ explorer/
│  ├─ kb/
│  └─ selection/
├─ hooks/
└─ services/
   └─ stack/
```

## 🚀 Live Demo

🌐 **[View Live Demo](https://file-picker-rho.vercel.app/)**

---

**Built with ❤️ for Stack AI's Frontend Engineer position**
