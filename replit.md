# Online Lottery System

## Overview

This project is an Arabic-language online lottery platform, "Jordanian Charitable Lottery" (اليانصيب الخيري الأردني), developed as a full-stack TypeScript application. Its primary purpose is to enable online ticket purchasing, wallet management, and provide extensive administrative controls for managing draws, users, payments, and refunds. The system is designed with enterprise-grade principles, incorporating role-based access control and comprehensive audit logging to ensure security and compliance. The project aims to provide a robust and user-friendly platform for charitable lottery operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, using Wouter for routing.
- **State Management**: TanStack React Query.
- **UI/UX**: shadcn/ui built on Radix UI, styled with Tailwind CSS. Design principles draw from Fluent Design and Carbon Design for enterprise interfaces.
- **Forms**: React Hook Form with Zod validation.
- **Internationalization**: Full Arabic language support with Right-to-Left (RTL) layout.

### Backend
- **Runtime**: Node.js with Express.js (TypeScript, ESM modules).
- **API**: RESTful JSON API (`/api` prefix), supporting proxying to an external backend.
- **Build**: esbuild for server, Vite for client.

### Data Layer
- **Database**: PostgreSQL.
- **ORM**: Drizzle ORM with `drizzle-zod` for schema validation and `Drizzle Kit` for migrations.
- **Schema**: Centralized in `shared/schema.ts`.

### Authentication & Security
- **Sessions**: Express sessions with PostgreSQL storage (`connect-pg-simple`).
- **Bot Protection**: Google reCAPTCHA v3.
- **Access Control**: Role-based (end_user, admin, finance_admin, system_admin, auditor).
- **Logging**: Comprehensive audit logging for all significant actions.

### Key Design Patterns
- **Shared Types**: Common schemas and types (`shared/` directory) for client-server consistency.
- **API Responses**: Consistent `{ success, data, error }` structure.
- **Modularity**: Domain-based structuring for routes, storage, and translations.
- **Visual Consistency**: Standardized UI components (AuthLayout, SiteFooter, PageHeader) and design tokens (colors, button styles, form inputs) across the application.

### Core Features
- **User Management**: Comprehensive user profiles with personal and contact information.
- **Draw Management**: Creation, scheduling, prize management, and result publishing.
- **Ticket Management**: Purchase, voiding, and mixed number views for collectors.
- **Payment & Wallet**: Deposit, withdrawal, and refund processing.
- **Card Design Settings**: Admin configurable lottery card appearance, including images, pricing, and manager details with live preview.
- **Profile Photo Upload**: Secure direct image uploads to Replit Object Storage.
- **UserRoles API**: Full IThink-compatible `/api/UserRoles` endpoints (list, assign, delete, by-user, by-role, check, assign-roles-to-user, assign-role-to-users, bulk-assign, suspend-user). When `EXTERNAL_API_URL` is set, requests proxy to the external IThink API; otherwise local in-memory implementation handles them.
- **System Content Management**: Admin page for managing CMS-style content pages (Terms & Conditions, Privacy Policy, FAQ, etc.) with a professional TipTap rich text editor supporting bilingual content (Arabic RTL / English LTR), formatting toolbar (bold, italic, underline, headings, lists, alignment, colors, links), and full CRUD operations.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store.

### Third-Party Services
- **Google reCAPTCHA v3**: Bot detection and prevention.
- **Google Fonts**: Cairo (Arabic) and JetBrains Mono (UI typography).
- **Replit Object Storage**: For user profile photo uploads.

### Key NPM Packages
- **UI**: Radix UI, Tailwind CSS, `class-variance-authority`.
- **Forms**: `react-hook-form`, `@hookform/resolvers`, `zod`.
- **Data**: `@tanstack/react-query`, `drizzle-orm`, `drizzle-zod`.
- **Utilities**: `date-fns`, `nanoid`, `clsx`, `uppy` (for file uploads).
- **Rich Text Editor**: TipTap (`@tiptap/react`, `@tiptap/starter-kit`, extensions for text-align, underline, color, text-style, link, image).