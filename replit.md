# FutureVest Investment Platform

## Overview

FutureVest (formerly StockSprout) is a custodial investment platform that allows parents to manage investment portfolios for their children, while family and friends can contribute through gift links and recurring contributions. The application features a mobile-first design with a growing sprout visualization, gift-giving workflow, portfolio tracking, educational activities, and interactive timeline functionality.

## Recent Changes (October 4, 2025)

- **GitHub Import Setup**: Successfully imported and configured for Replit environment
- **Database**: PostgreSQL database provisioned and schema migrated
- **Deployment**: Configured for autoscale deployment with production build
- **Environment**: Development server running on port 5000 with Vite HMR
- **Dependencies**: All npm packages installed and working correctly

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack React Query for server state management
- **Routing**: wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive layout optimized for mobile devices with dedicated mobile layout components

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL database
- **Development**: Hot reload via Vite middleware in development mode
- **Build**: esbuild for production server bundling

### Database Design
- **Primary Database**: PostgreSQL via Neon Database serverless connection
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Core Entities**:
  - Users (parents/account holders)
  - Children (investment portfolio owners)
  - Investments (stocks, ETFs, crypto, indexes)
  - Portfolio Holdings (child's investment positions)
  - Gifts (investment contributions from gift givers)
  - Thank You Messages (communication between children and gift givers)

### Key Features
- **Gift Link System**: Unique codes allowing external gift givers to contribute to children's portfolios
- **Investment Portfolio Tracking**: Real-time portfolio values and performance metrics
- **Growing Sprout Timeline**: Interactive timeline visualization showing investment growth as a sprouting plant with cumulative gift tracking and leaf nodes
- **Sprout Growth Visualization**: Vertical stem that grows with each gift, featuring alternating leaf positions and cumulative amount displays
- **Video Messaging**: Recording and playback of video thank you messages
- **Mock Payment Processing**: Stripe-like payment interface for development/demo purposes

### API Architecture
- **RESTful API**: Express routes handling CRUD operations
- **Route Organization**: Separated route handlers with centralized error handling
- **Data Validation**: Zod schemas for request/response validation
- **Query Optimization**: Efficient database queries with proper joins for enriched data

### Authentication & Security
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Data Access**: Abstracted storage layer with interface-based design
- **Input Validation**: Schema validation at API boundaries

## External Dependencies

### Core Technologies
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database ORM and query builder
- **TanStack React Query**: Server state management and caching
- **shadcn/ui**: Modern React component library with Radix UI primitives

### Development Tools
- **Vite**: Fast development server and build tool
- **Replit Integration**: Custom plugins for development environment
- **TypeScript**: Static typing throughout the application
- **Tailwind CSS**: Utility-first CSS framework

### Payment Processing
- **Stripe Integration**: React Stripe.js for payment forms (currently mocked for development)
- **Mock Payment System**: Development-friendly payment simulation

### Media & Communication
- **Video Recording**: Browser-based video recording capabilities
- **SMS Integration**: Gift link sharing via SMS messages
- **Date Formatting**: date-fns for consistent date handling

### UI Components
- **Radix UI**: Accessible component primitives
- **Recharts**: Chart visualization for portfolio data
- **Lucide React**: Consistent icon library
- **Class Variance Authority**: Component variant management