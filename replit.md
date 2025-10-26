# StockSprout Investment Platform

## Overview

StockSprout is a custodial investment platform that allows parents to manage investment portfolios for their children, while family and friends can contribute through gift links and recurring contributions. The application features a mobile-first design with a growing sprout visualization, gift-giving workflow, portfolio tracking, educational activities, and interactive timeline functionality.

## Recent Changes (October 26, 2025)

- **Photo Selection UX Ultra-Simplified**: Removed dropdown menus in favor of direct file picker:
  - Click camera icon → native file picker opens immediately
  - Mobile devices show built-in menu: "Take Photo", "Photo Library", "Browse", etc.
  - Single-click flow for maximum simplicity
  - Applied to: Profile page, Add Child page, Child cards, and Gift Giver page
  - Maintains all photo editor functionality (drag-to-reposition and zoom)
- **Child Card UX Improved**: Separated clickable areas to prevent conflicts:
  - Camera button (left side) - opens file picker with larger 48px tap target
  - Portfolio stats (right side) - click to view portfolio details
  - No overlapping click handlers for reliable mobile interaction
- **Send Gift Page Fixed**: Resolved blank screen issue by computing child full name from firstName/lastName fields
- **Selected Stock Display**: Added visual display of selected stock beneath search bar on Send Gift page with company logo, price, YTD return, and blue "Selected" indicator matching preset tiles
- **Gallery Photo Selection**: Added gallery photo selection option across all profile photo features:
  - Add Child page - Take photo OR choose from gallery
  - Child profile cards on main page - Take photo OR choose from gallery  
  - Profile page - Take photo OR choose from gallery
  - Send Gift page (contributor profile) - Take photo OR choose from gallery
  - Mobile-optimized: iOS shows "Photo Library/Take Photo/Browse", Android opens native gallery picker
- **Photo Editor**: Added interactive photo editor with center and zoom capabilities for all profile photos:
  - Drag to reposition image within circular frame
  - Slider to zoom in/out (0.5x to 3x)
  - Live preview with circular overlay showing final crop area
  - Canvas-based rendering ensures exact match between preview and saved result
  - Touch-enabled for mobile devices
  - Outputs 300x300px circular profile photos
  - Works with both camera and gallery photos

## Previous Changes (October 6, 2025)

- **Unified Authentication System**: All users now use a single unified authentication system with roles determined by relationships to children
- **Database Schema Updated**: Successfully migrated to unified users table with optional username, phone field, and createdAt timestamp
- **Login Flow Simplified**: Single login endpoint using email instead of username
- **Profile Picture Support**: Base64 data URLs now supported for profile images
- **Schema Migration**: Database schema successfully pushed and synchronized

## Previous Changes (October 4-5, 2025)

- **GitHub Import Setup**: Successfully imported and configured for Replit environment
- **Mobile Navigation**: Added custodian and contributor routing with auto-redirect to first child
- **Bidirectional Amount/Shares Editing**: Both fields editable with real-time calculation
- **Camera UX Improvements**: Auto-start camera for profile pictures with better button placement
- **Auto-Approve Parent Purchases**: Parent purchases automatically approved without custodian review
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