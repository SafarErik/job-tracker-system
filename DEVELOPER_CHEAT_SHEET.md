# 🛠️ Developer Cheat Sheet

Important commands and architecture details for the JobTracker project.

## 💻 Console Commands

### Backend (.NET 10)

| Action | Command |
|--------|---------|
| **Restore** | `dotnet restore JobTracker.slnx` |
| **Build** | `dotnet build JobTracker.slnx` |
| **Run API** | `dotnet run --project src/Backend/JobTracker.API` |
| **Reset DB** (Dev) | `dotnet run --project src/Backend/JobTracker.API -- --reset-db` |
| **Add Migration** | `dotnet ef migrations add Name --project JobTracker.Infrastructure --startup-project JobTracker.API` |
| **Update DB** | `dotnet ef database update --project JobTracker.Infrastructure --startup-project JobTracker.API` |
| **Test** | *(No test project yet)* |

### Frontend (Angular 21)

*Run from `src/Frontend` directory*

| Action | Command |
|--------|---------|
| **Install** | `npm install` |
| **Start** | `npm start` (Runs on `http://localhost:4200`) |
| **Build (Prod)** | `npm run build` |
| **Test** | `npm test` |

### Infrastructure (Docker)

| Action | Command |
|--------|---------|
| **Start SQL** | `docker-compose up -d` |
| **Stop** | `docker-compose down` |
| **Logs** | `docker-compose logs -f` |

---

## 🏗️ Architecture Overview

### Backend (Clean Architecture)

Flow: **API** &#8594; **Application** &#8594; **Core** &#8592; **Infrastructure**

*   **API**: Controllers, Middleware, DI setup. Entry point.
*   **Application**: Business logic, DTOs, Validators. Depends ONLY on Core.
*   **Core**: Domain Entities (`JobApplication`, `Company`), Interfaces. No dependencies.
*   **Infrastructure**: EF Core `DbContext`, Repositories, External Services.

### Frontend (Angular)

*   **Signals**: Used for all state management.
*   **Standalone Components**: No NgModules.
*   **Lazy Loading**: Feature-based routing (`features/`).

---

## 🔑 Key Configuration

*   **JWT Secret**: Set via User Secrets in dev (`dotnet user-secrets set "JwtSettings:SecretKey" "..."`). Azure Key Vault in prod.
*   **Database**:
    *   **Dev**: Docker SQL Server (`localhost:1433`)
    *   **Prod**: Azure SQL Database
*   **API URL**:
    *   **Dev**: `http://localhost:5053`
    *   **Prod**: `https://jobtracker-api.azurewebsites.net` (Mapped via `angular.json` file replacements)
