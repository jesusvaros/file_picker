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

- **Single Responsibility**: Each component handles one specific task
- **React Query**: Server state caching and background updates
- **localStorage**: Persists connections, KB state, and hidden files
- **Optimistic Updates**: Immediate UI feedback with error rollback

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

- **ResourceList**: Main file display and selection container
- **ResourceAccordion**: Hierarchical folder navigation with lazy loading
- **useNestedResourceSelection**: Complex selection logic with parent-child relationships
- **useCreateKbWithResources**: Knowledge base creation with optimistic updates
- **useGlobalLoadedSearch**: Cached search without additional API calls

## 🚀 Live Demo

🌐 **[View Live Demo](https://file-picker-rho.vercel.app/)**

---

**Built with ❤️ for Stack AI's Frontend Engineer position**
