# JobTracker

A comprehensive full-stack application for tracking job applications, managing career-related documents, and visualizing professional trajectory.

## Overview

JobTracker is a production-grade system designed to replace ad-hoc spreadsheet tracking with a robust, structured application. It leverages a clean architecture approach to ensure scalability, maintainability, and testability. The system provides a secure environment for managing the entire job application lifecycle, from initial submission to final offer, including document management and analytics.

## Architecture

The project follows a Monorepo structure with a strict separation between the API and the Client application.

### Backend Overview
The implementation utilizes **ASP.NET Core 10** within a **Clean Architecture** (Onion Architecture) pattern:
- **Core:** Contains the domain model, entities, and repository interfaces. This layer has no dependencies on external frameworks.
- **Application:** Encapsulates business logic, DTOs, and application interfaces (services, use cases).
- **Infrastructure:** Implements interfaces defined in Core and Application, managing database access (EF Core), file systems, and external services.
- **API:** The entry point for the application, providing RESTful endpoints and handling HTTP concerns, including JWT authentication and authorization.

### Frontend Overview
The client is built with **Angular 21**, emphasizing modern reactive patterns:
- **Signals:** Extensive use of Angular Signals for state management and fine-grained reactivity.
- **Styling:** Implementation uses Tailwind CSS v4 for utility-first styling and Spartan UI for accessible, headless components.
- **Modularity:** Feature-based module structure for better code organization and lazy loading.

## Technology Stack

### Frontend
- **Framework:** Angular 21
- **Styling:** Tailwind CSS 4, Spartan UI
- **Icons:** Lucide Angular

### Backend
- **Framework:** ASP.NET Core 10
- **Database:** PostgreSQL 16+ (via Entity Framework Core 10)
- **Authentication:** ASP.NET Core Identity with JWT Bearer Authentication

### Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose
- **Cloud Database:** Neon (Serverless PostgreSQL)
- **Deployment:** Render (API), Vercel (Client)

## Prerequisites

Ensure the following tools are installed in your development environment:
- .NET 10 SDK
- Node.js 20+ and npm
- Docker Desktop

## Local Development Setup

### 1. Infrastructure Initialization
Start the PostgreSQL database and pgAdmin using Docker Compose.

```bash
docker-compose up -d
```
*Note: The database listens on localhost:5433 and pgAdmin on localhost:5050.*

### 2. Backend Configuration
Navigate to the API project directory and configure the user secrets.

```bash
# Initialize JWT Secret
dotnet user-secrets set "JwtSettings:SecretKey" "Your_Secure_Secret_Key_At_Least_32_Characters" --project src/Backend/JobTracker.API
```

**Database Seeding**
Run the application with the reset flag to apply migrations and seed initial data.

```bash
dotnet run --project src/Backend/JobTracker.API -- --reset-db
```
*Default Credentials: demo@jobtracker.com / Demo123!*

**Start the API**
```bash
dotnet run --project src/Backend/JobTracker.API
```
*The API will be available at http://localhost:5053 (Swagger UI at /swagger).*

### 3. Frontend Configuration
Open a new terminal to set up the client application.

```bash
cd src/Frontend
npm install
npm start
```
*The application will be available at http://localhost:4200.*

## Configuration Guide

The following configuration keys are essential for the application's operation. These can be set in `appsettings.json` or via environment variables.

| Key | Description |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | PostgreSQL connection string. |
| `JwtSettings:SecretKey` | A strong secret key for token generation (min 32 chars). |
| `JwtSettings:Issuer` | The token issuer. |
| `JwtSettings:Audience` | The token audience. |
| `Authentication:Google:ClientId` | (Optional) Client ID for Google OAuth. |
| `Authentication:Google:ClientSecret` | (Optional) Client Secret for Google OAuth. |
| `Frontend:BaseUrl` | Base URL for the client application (CORS/Redirects). |
| `AllowedOrigins` | List of allowed origins for CORS policies. |

## Deployment

The system is optimized for cloud deployment.

### Database
Provision a PostgreSQL instance on a provider such as Neon.tech and obtain the connection string.

### Backend (Render)
1. Create a Web Service.
2. Set Build Command: `dotnet publish src/Backend/JobTracker.API -c Release -o out`
3. Set Start Command: `dotnet out/JobTracker.API.dll`
4. Configure Environment Variables (`ASPNETCORE_ENVIRONMENT`, `ConnectionStrings__DefaultConnection`, `JwtSettings__SecretKey`).

### Frontend (Vercel)
1. Import the project root: `src/Frontend`
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist/job-tracker/browser`
4. Deployment handling is configured via `vercel.json` for routing support.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. 

### Why this license?
We believe in open source, but we also want to protect the project's future as a service. Under the AGPL:
- You are free to use, study, and modify the code.
- If you run the software on a server and let others interact with it over a network, **you must make your source code available** under the same license.
- This prevents "closed-source" commercialization of the project without contributing back.

For commercial licensing or alternative arrangements, please contact the maintainer.

See the [LICENSE](LICENSE) file for the full text.
