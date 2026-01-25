# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Start Commands

### Backend (.NET 10)
```powershell
# Restore dependencies
dotnet restore JobTracker.slnx

# Build entire solution
dotnet build JobTracker.slnx

# Run API (with database migrations)
dotnet run --project src/Backend/JobTracker.API

# Run API with database reset (Development only - DESTRUCTIVE)
dotnet run --project src/Backend/JobTracker.API -- --reset-db

# Run from specific project directory
cd src/Backend/JobTracker.API
dotnet run

# Create new migration
cd src/Backend
dotnet ef migrations add MigrationName --project JobTracker.Infrastructure --startup-project JobTracker.API

# Apply migrations
dotnet ef database update --project JobTracker.Infrastructure --startup-project JobTracker.API

# Publish for production
dotnet publish src/Backend/JobTracker.API -c Release -o publish
```

### Frontend (Angular 21)
```bash
cd src/Frontend

# Install dependencies
npm install

# Start dev server (http://localhost:4200)
npm start

# Build for production
npm run build

# Run tests (Vitest)
npm test

# Watch mode for development
npm run watch
```

### Infrastructure
```bash
# Start SQL Server in Docker
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build
```

## Architecture Overview

### Clean Architecture Layers
The backend follows strict Clean Architecture with clear dependency flow: **API → Application → Core ← Infrastructure**

- **Core** (`JobTracker.Core`): Pure domain layer with zero framework dependencies
  - Entities: `ApplicationUser`, `JobApplication`, `Company`, `Document`, `Skill`
  - Enums: `JobApplicationStatus` (Applied, Interviewing, Rejected, Offer, PhoneScreen, Ghosted, TechnicalTask)
  - Interfaces: Repository contracts (`IJobApplicationRepository`, `ICompanyRepository`, etc.)

- **Application** (`JobTracker.Application`): Business logic layer
  - DTOs for API contracts
  - FluentValidation validators
  - Depends on Core only (not Infrastructure)

- **Infrastructure** (`JobTracker.Infrastructure`): Data access and external services
  - `ApplicationDbContext`: EF Core DbContext inheriting from `IdentityDbContext<ApplicationUser>`
  - Repositories implementing Core interfaces
  - Entity configurations
  - Migrations directory contains EF Core migrations
  - `Data/skills.json`: Seed data for skills (copied to output)

- **API** (`JobTracker.API`): Entry point
  - Controllers: `AuthController`, `JobApplicationsController`, `CompaniesController`, `DocumentsController`, `ProfileController`, `SkillsController`
  - `Program.cs`: Extensive DI configuration including JWT, Identity, rate limiting, CORS, Swagger
  - Middleware for security headers and logging
  - `uploads/` folder for file storage (must be writable)

### Frontend Architecture
Angular 21 using standalone components with signal-based reactivity:

- **core/**: Singleton services, guards, interceptors
  - `auth/`: Authentication guards and services
  - `models/`: TypeScript interfaces matching backend DTOs
  - `services/`: HTTP services for API communication

- **features/**: Feature modules (one per major entity)
  - `auth/`: Login, register, Google OAuth
  - `job-applications/`: Application tracking and Kanban board
  - `companies/`: Company management
  - `documents/`: Resume/CV upload and management
  - `profile/`: User profile and skills
  - `skills/`: Skill management

- **shared/**: Reusable components, directives, pipes
- **layout/**: Navigation, header, footer components

## Database

### Provider Configuration
The application supports SQL Server (used for both dev and prod for consistency):
- Development: SQL Server in Docker (`localhost:1433`)
- Production: Azure SQL Database
- Provider is selected in `Program.cs` via `DatabaseServiceExtensions.AddDatabaseContext()`

### Connection String
Default dev connection (set in `appsettings.json` or environment):
```
Server=localhost,1433;Database=JobTracker;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
```

### Important Database Relationships
- `JobApplication` belongs to `ApplicationUser` (restrict delete to prevent cascade conflicts)
- `JobApplication` belongs to `Company` (restrict delete)
- `JobApplication` optionally links to `Document` (set null on document delete)
- `Document` belongs to `ApplicationUser` (cascade delete)
- Many-to-many: `Skill ↔ JobApplication` (via `JobApplicationSkills` table)
- Many-to-many: `Skill ↔ ApplicationUser` (via `UserSkills` table)

### Critical: Cascade Delete Configuration
EF Core relationships use `DeleteBehavior.Restrict` for JobApplication → User and JobApplication → Company to avoid SQL Server cascade path conflicts. Only Document → User uses cascade delete.

## Authentication & Security

### JWT Configuration
- Secret key stored in user-secrets (Development) or Azure Key Vault (Production)
- Set via: `dotnet user-secrets set "JwtSettings:SecretKey" "Your_Super_Strong_Secret_Key_Here_123!" --project src/Backend/JobTracker.API`
- Token includes user ID, email, and expiration
- Validated with: issuer, audience, signing key, lifetime (no clock skew)

### ASP.NET Core Identity
- Custom `ApplicationUser` extends `IdentityUser`
- Password requirements: 8+ chars, digit, lowercase, uppercase, non-alphanumeric
- Lockout: 5 failed attempts → 5 minute lockout
- Unique email required

### Rate Limiting
Configured in `Program.cs`:
- Global: 100 requests/minute per IP
- `/auth/login`: 5 attempts/minute
- `/auth/register`: 3 attempts/hour
- `/documents/upload`: 10 uploads/minute

### Security Headers & Middleware
- Custom security middleware adds X-Frame-Options, HSTS, CSP, X-Content-Type-Options
- Security logging middleware for audit trails
- FluentValidation for all DTOs

### Google OAuth (Optional)
- Only enabled if `Authentication:Google:ClientId` and `ClientSecret` are configured
- Handled via `AddGoogle()` authentication scheme

## File Uploads

- Documents stored in `src/Backend/JobTracker.API/uploads/`
- Max file size: 10MB
- Allowed types: PDF only
- Path traversal prevention implemented
- Files named by GUID with document metadata stored in database

## CORS Configuration

Development default: `http://localhost:4200`  
Production: Configured via `AllowedOrigins` array in `appsettings.json`  
Credentials enabled for authentication cookies.

## Development Workflow

### Starting from Scratch
1. Ensure Docker Desktop is running
2. `docker-compose up -d` to start SQL Server
3. Set JWT secret: `dotnet user-secrets set "JwtSettings:SecretKey" "YourSecretKey123!" --project src/Backend/JobTracker.API`
4. Run backend with DB reset: `dotnet run --project src/Backend/JobTracker.API -- --reset-db`
5. In new terminal: `cd src/Frontend && npm install && npm start`
6. Access frontend at `http://localhost:4200`, API at `http://localhost:5053`, Swagger at `http://localhost:5053/swagger`

### Demo User
After running with `--reset-db`, a demo user is seeded:
- Email: `demo@jobtracker.com`
- Password: `Demo123!`

### Making Code Changes

**Backend:**
- Entity changes require new migration: `dotnet ef migrations add MigrationName --project JobTracker.Infrastructure --startup-project JobTracker.API`
- Always apply migrations: `dotnet ef database update --project JobTracker.Infrastructure --startup-project JobTracker.API`
- Run from `src/Backend` directory for EF Core commands
- Repository changes must update interface in Core layer first

**Frontend:**
- Follow Angular standalone component pattern
- Use signals for reactivity
- Services must be provided in component or root
- API models in `core/models/` should match backend DTOs exactly

## Testing

**Backend:** No test project currently exists. If creating tests, use xUnit or NUnit and reference the appropriate layer.

**Frontend:** Tests use Vitest (configured in `package.json`). Run with `npm test`.

## Deployment

### Azure Production Environment
- Backend: Azure App Service (.NET 10)
- Frontend: Azure App Service (static files, shared with backend B1 plan)
- Database: Azure SQL Database (Basic tier)
- Secrets: Azure Key Vault
- Monitoring: Application Insights (enabled in non-Development environments)

### Production Build
```bash
# Backend
dotnet publish src/Backend/JobTracker.API -c Release -o publish

# Frontend
cd src/Frontend && npm run build
```

## Important Notes

### --reset-db Flag Behavior
- **ONLY works in Development environment** - hard-blocked in production via environment check
- **DESTRUCTIVE**: Deletes entire database and recreates from scratch
- Seeds demo user and sample data
- 3-second warning before execution
- Never use on production data

### Rate Limiting in Production
- Current implementation uses `DistributedMemoryCache`
- For multi-instance scaling, replace with Redis: `AddStackExchangeRedisCache()`

### Application Insights
- Only registered in non-Development environments
- Requires Azure configuration for production

### Swagger
- Enabled in all environments (consider restricting in production)
- JWT authentication integrated via "Authorize" button
- Access at `/swagger` endpoint
