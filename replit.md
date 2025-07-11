# Football Analytics Application

## Overview

This is a full-stack football analytics web application that provides match analysis, team statistics, and betting insights. The application uses React for the frontend, Express.js for the backend, and integrates with the API-Football service to fetch real-time football data.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **API-Football**: Primary data source for football statistics and match information
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