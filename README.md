# Aptelion Core

Aptelion Core is the open-source foundation of Aptelion, a career operating system for focused professional growth.

Aptelion helps people evaluate opportunities, improve career materials, prepare for interviews, understand offers, and keep applications moving with clarity and intent.

The goal is not to build another passive job tracker. Aptelion is designed to help users understand what matters now, where momentum is being lost, and what the next best move should be.

## Product Vision

Aptelion is built around structured career progress:

- understand opportunity fit;
- organize applications and timelines;
- improve CVs, cover letters, and supporting materials;
- prepare for interviews with a clear practice path;
- compare offers and trade-offs;
- follow up on time;
- move from uncertainty to a concrete next action.

Core promise:

> From potential to progress.

## Open-Core Strategy

Aptelion follows an open-core model.

- **Aptelion Core** is the open-source foundation in this repository. It contains the reusable application structure, public contracts, core UI/API foundations, and self-hostable career workspace basics.
- **Aptelion Cloud** is the future hosted proprietary SaaS product, including managed hosting, accounts, synchronization, billing, premium integrations, and production SaaS operations.
- **Aptelion Signal** is the private AI guidance and decision-support layer for fit analysis, recommendations, prioritization, document guidance, interview preparation, and next-best-action logic.
- **Aptelion Studio** is the workspace experience for applications, documents, interviews, offers, and timelines. Aptelion Core may include Studio essentials; advanced Studio workflows may live in Aptelion Cloud.

Aptelion Core should remain useful, credible, and extensible on its own. Proprietary prompts, scoring weights, recommendation models, hosted SaaS infrastructure, billing, and commercial automation are intentionally outside the open-source core.

## Architecture

This repository uses a monorepo structure with separate frontend and backend applications.

### Frontend

The frontend lives in `src/Frontend`.

- Angular standalone components
- Angular signals and reactive UI patterns
- Tailwind CSS
- Spartan UI primitives
- Lucide icons
- Feature-oriented structure for application, document, profile, and workspace surfaces

### Backend

The backend lives under `src/Backend`.

The current API project path is still `src/Backend/JobTracker.API`.

The backend follows a Clean Architecture / Onion Architecture style:

- `JobTracker.Core`: domain entities, enums, and domain/repository contracts.
- `JobTracker.Application`: DTOs, validation, application services, and use-case orchestration.
- `JobTracker.Infrastructure`: Entity Framework Core, PostgreSQL persistence, file/document handling, provider implementations, and migrations.
- `JobTracker.API`: ASP.NET Core entry point, controllers, authentication, authorization, CORS, Swagger, rate limiting, and HTTP pipeline configuration.

Some internal project names and paths may still use the legacy `JobTracker` naming during the transition to Aptelion Core. These technical names will be cleaned up in a later refactor. Do not rename technical project files, namespaces, folders, package names, Docker paths, deployment paths, or `.csproj` files unless that refactor is explicitly requested.

## Technology Stack

Frontend:

- Angular 21
- TypeScript
- Tailwind CSS 4
- Spartan UI
- Lucide Angular
- Vitest

Backend:

- .NET 10 / ASP.NET Core
- Entity Framework Core 10
- PostgreSQL via Npgsql
- ASP.NET Core Identity
- JWT Bearer authentication
- FluentValidation
- Swagger / OpenAPI

Infrastructure:

- Docker Compose for local PostgreSQL
- PostgreSQL 15+ locally
- Environment variables and user secrets for local configuration

## Local Development

### Prerequisites

- .NET 10 SDK
- Node.js 20+ and npm
- Docker Desktop

### 1. Configure Local Environment

Create a local `.env` file for Docker Compose:

```bash
cp .env.example .env
```

Update `.env` with local PostgreSQL values. The backend defaults expect port `5433`; make sure the database name in `.env` matches the connection string you configure for the API.

Example:

```env
POSTGRES_USER=postgres_user
POSTGRES_PASSWORD=change_this_locally
POSTGRES_DB=JobTracker
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

Docker Compose starts PostgreSQL on `localhost:5433`.

### 3. Configure Backend Secrets

Set the local API connection string and JWT secret with .NET user secrets:

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5433;Database=JobTracker;Username=postgres_user;Password=change_this_locally" --project src/Backend/JobTracker.API
dotnet user-secrets set "JwtSettings:SecretKey" "replace-with-a-local-secret-at-least-32-characters" --project src/Backend/JobTracker.API
```

Use values that match your `.env` file.

### 4. Run The API

```bash
dotnet run --project src/Backend/JobTracker.API
```

The API runs at `http://localhost:5053` by default. Swagger is available at `http://localhost:5053/swagger` in local development.

To reset the local development database and seed demo data:

```bash
dotnet run --project src/Backend/JobTracker.API -- --reset-db
```

The reset flag is destructive and is blocked outside the Development environment.

### 5. Run The Frontend

```bash
cd src/Frontend
npm install
npm start
```

The frontend runs at `http://localhost:4200`.

## Configuration

Backend configuration is read from `src/Backend/JobTracker.API/appsettings*.json`, environment variables, and user secrets.

Important keys:

| Key | Purpose |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string. |
| `JwtSettings:SecretKey` | Local or deployed JWT signing secret. |
| `JwtSettings:Issuer` | Token issuer. Currently may still use transitional technical naming. |
| `JwtSettings:Audience` | Token audience. Currently may still use transitional technical naming. |
| `Frontend:BaseUrl` | Frontend URL used for CORS and redirects. |
| `AllowedOrigins` | Allowed CORS origins for deployed environments. |
| `Authentication:Google:ClientId` | Optional Google OAuth client ID. |
| `Authentication:Google:ClientSecret` | Optional Google OAuth client secret. |
| `LogoDev:ApiKey` | Optional company logo lookup integration key. |
| `ScraperService:BaseUrl` | Optional external scraper service URL. |

Never commit real secrets. Use user secrets locally and environment variables or managed secret storage in deployed environments.

## Development Guidelines

Follow the repository agent and brand guidance:

- `AGENTS.md`
- `src/Frontend/AGENTS.md`
- `src/Backend/AGENTS.md`
- `BRAND.md`

General expectations:

- preserve existing behavior unless a change is explicitly requested;
- keep backend controllers thin and domain/application logic out of HTTP endpoints;
- keep Aptelion Signal-specific proprietary logic behind replaceable interfaces;
- keep Aptelion Core useful without private SaaS features;
- use typed DTOs and models instead of unstructured objects;
- keep frontend components focused, accessible, and consistent with Spartan UI and Tailwind conventions;
- avoid leaking secrets, user data, proprietary prompts, or private scoring logic into the open core.

## License

Aptelion Core source code is licensed under the Apache License, Version 2.0.

See [LICENSE](LICENSE) for the full license text.

Apache-2.0 applies to the open-source software portions of Aptelion Core unless a file clearly states otherwise. It does not grant rights to Aptelion trademarks, product names, logos, visual identity, or brand assets.

## Trademark And Brand

Aptelion, Aptelion Core, Aptelion Cloud, Aptelion Signal, Aptelion Studio, logos, visual identity, and brand assets are not licensed under Apache-2.0.

Brand assets, including files under `docs/brand`, are provided as project reference material. They may not be used to operate a competing service, imply endorsement, suggest affiliation, or present another product or service as Aptelion without explicit permission.

Forks and derivative works may use the Apache-2.0 licensed code according to the license terms, but they must not use the Aptelion brand identity in a way that confuses users about the source, sponsorship, or official status of the service.

## Roadmap And Future Direction

Planned direction includes:

- refine Aptelion Core as a self-hostable career workspace foundation;
- strengthen application, document, interview, offer, and timeline primitives;
- define clear extension points for private Aptelion Signal implementations;
- improve Aptelion Studio essentials in the open core;
- separate hosted Aptelion Cloud concerns from reusable open-source foundations;
- clean up remaining legacy `JobTracker` technical names in a later dedicated refactor.
