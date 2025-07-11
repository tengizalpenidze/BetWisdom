# Football Analytics Application

## Overview

This is a full-stack football analytics web application that provides match analysis, team statistics, and betting insights. The application uses React for the frontend, Express.js for the backend, and integrates with the API-Football service to fetch real-time football data.

## User Preferences

Preferred communication style: Simple, everyday language.
API Key: Using Sportmonks API with key b7irXCpVJbP1f0aUdqqaTkdZ23ciP1CIyyQr2TxC1J3PSTFfIU9l0dCV5FBS (Free plan - MAJOR LIMITATIONS DISCOVERED)

## API Limitations Discovered (January 11, 2025)

**Critical Issue**: Sportmonks free plan severely restricts available data:
- Historical data from 2005-2016 (outdated)
- Only ~50 basic teams available (mostly Scottish Premiership and Danish Superliga)
- Major European teams (Napoli, PSG, Barcelona, Real Madrid, Manchester United, etc.) NOT available in free tier
- NO current season match data, detailed statistics, goals, cards, or corners
- Search functionality returns same limited team set regardless of search terms
- League filtering ineffective due to data restrictions

**User Request**: Teams from major European leagues (Serie A, La Liga, Premier League, etc.) with comprehensive statistics.

**Current Status**: Cannot provide major league teams or comprehensive statistics with free Sportmonks plan. Available teams limited to Celtic, Rangers, Hibernian, FC København, and similar lower-tier teams.

**Demonstrated Issue**: User correctly identified that Napoli (Serie A) and PSG (Ligue 1) are not findable in the current system due to API plan limitations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **External API**: API-Football for real-time football data

## Key Components

### Database Schema
The application uses PostgreSQL with the following main tables:
- **teams**: Stores team information (id, apiId, name, logo, country, founded, venue)
- **matches**: Stores match data (id, apiId, homeTeamId, awayTeamId, leagueName, matchDate, status, venue)
- **teamStats**: Stores team statistics per season (id, teamId, season, leagueId, stats as JSON)
- **matchStats**: Stores detailed match statistics (id, matchId, homeTeamStats, awayTeamStats, h2hStats as JSON)

### Frontend Pages
- **Home Page**: Search and browse upcoming matches
- **Match Analysis Page**: Detailed team comparison and match analytics
- **404 Page**: Not found error handling

### Backend Services
- **Storage Layer**: Memory storage implementation with interface for future database integration
- **API Routes**: RESTful endpoints for search, match analysis, and data retrieval
- **External API Integration**: API-Football service integration for live data

## Data Flow

1. **User Search**: Users search for matches, teams, or leagues through the frontend
2. **API Request**: Frontend sends requests to backend Express server
3. **External API Call**: Backend fetches data from API-Football service
4. **Data Processing**: Backend processes and potentially stores data in PostgreSQL
5. **Response**: Processed data is returned to frontend
6. **UI Update**: React components update with new data using TanStack Query

## External Dependencies

### Third-Party Services
- **Sportmonks API**: Primary data source for football statistics and match information
  - Using Free plan (3000 requests/day)
  - Basic team data and head-to-head fixtures available
  - URL: https://api.sportmonks.com/v3/football/
  - Query parameter: api_token
  - Scottish teams (Celtic, Rangers) and fixtures available
- **Neon Database**: Serverless PostgreSQL hosting

### Key Libraries
- **Frontend**: React, Wouter, TanStack Query, Tailwind CSS, shadcn/ui, Radix UI primitives
- **Backend**: Express, Drizzle ORM, Zod for validation
- **Development**: Vite, TypeScript, ESLint configuration

### Authentication & Sessions
- Session management using connect-pg-simple for PostgreSQL-backed sessions
- Currently appears to be in development without full authentication implementation

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: tsx for TypeScript execution in development
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Node.js application serving both API and static files

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- API-Football integration via `API_FOOTBALL_KEY` or `RAPID_API_KEY`
- Replit-specific configurations for development environment

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions in `./shared/schema.ts`
- Push-based deployment with `db:push` command for schema updates

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and scalable database design for handling football analytics data.

## Deployment Configuration

### Render Deployment Ready
The application is configured for deployment on Render.com with:
- **render.yaml**: Blueprint configuration for automated deployment
- **Dockerfile**: Docker containerization support 
- **Production build**: Optimized build process with Vite + esbuild
- **Environment variables**: Configured for SPORTMONKS_API_KEY and NODE_ENV
- **Static file serving**: Express serves both API and frontend from single service

### Build Process
- Frontend: `vite build` → `dist/public/` (static assets)
- Backend: `esbuild` → `dist/index.js` (bundled server)
- Start: `npm start` → runs production server on port 5000

### Deployment Instructions
Complete deployment guide available in `RENDER_DEPLOYMENT.md` including:
- Step-by-step Render setup
- Environment variable configuration
- Troubleshooting common issues
- Post-deployment testing procedures