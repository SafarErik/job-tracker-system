# 🚀 JobTracker

**Stop using spreadsheets.** → A full-stack solution to track applications, manage documents, and visualize your career trajectory.

JobTracker is a robust, production-ready architecture combining the raw performance of **ASP.NET Core 10** with the reactivity of **Angular 21**. It features a pristine **Clean Architecture** implementation, complete with JWT authentication, file management, and insightful analytics.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features at a Glance

- **🔐 Secure Identity:** Full JWT authentication flow with ASP.NET Core Identity. Includes optional **Google OAuth** integration.
- **📂 Smart Pipeline:** Manage applications with a Kanban-style logical flow (Applied → Interview → Offer).
- **📄 Document Hub:** Upload resumes and cover letters (PDF, up to 10MB) linked directly to specific applications.
- **📊 Career Analytics:** Visual stats on your success rate, interview frequency, and offer ratios.
- **🏢 Company Intel:** specific history tracking per company.
- **🛠 Clean Architecture:** Strict separation of concerns:
- **Core:** Domain entities & Interfaces (Pure C#)
- **Application:** Business logic, DTOs, Use Cases
- **Infrastructure:** EF Core, Repositories, File Systems
- **API:** Controllers & Entry points

---

## 🏗 Tech Stack

| Layer        | Technology                  | Highlights                                                 |
| ------------ | --------------------------- | ---------------------------------------------------------- |
| **Frontend** | **Angular 21**              | Tailwind-ready, Signal-based reactivity, modular design.   |
| **Backend**  | **ASP.NET Core 10**         | Web API, Identity, custom Middleware.                      |
| **Database** | **PostgreSQL / SQL Server** | PostgreSQL for dev, SQL Server for Azure (cost-optimized). |
| **DevOps**   | **Docker Compose**          | Orchestrates DB and pgAdmin for zero-friction dev.         |

---

## 🚀 Quick Start (Local Dev)

### 1. Prerequisites

Ensure you have the bleeding edge installed:

- .NET 10 SDK
- Node.js 20+ & npm
- Docker Desktop

### 2. Spin up Infrastructure

Launch Postgres and pgAdmin in the background:

```bash
docker-compose up -d

```

> **Note:** The database will be available at `localhost:5433` and pgAdmin at `localhost:5050`.

### 3. Backend Setup

Navigate to the API folder and configure your secrets.

```bash
# Set your JWT Secret (Critical!)
dotnet user-secrets set "JwtSettings:SecretKey" "Your_Super_Strong_Secret_Key_Here_123!" --project src/Backend/JobTracker.API

```

**Database Seeding (The easy way):**
Run the app with the reset flag to apply migrations and seed the demo user.

```bash
dotnet run --project src/Backend/JobTracker.API -- --reset-db

```

> **Demo Credentials:** `demo@jobtracker.com` / `Demo123!`

**Start the API:**

```bash
dotnet run --project src/Backend/JobTracker.API

```

_API is now live at: `http://localhost:5053` (Swagger at `/swagger`)_

### 4. Frontend Setup

In a new terminal:

```bash
cd src/Frontend
npm install
npm start

```

_Frontend is now live at: `http://localhost:4200`_

---

## ⚙️ Configuration Cheat Sheet

Environment variables and `appsettings.json` keys you need to know:

| Key                                   | Description                                                   |
| ------------------------------------- | ------------------------------------------------------------- |
| `DatabaseProvider`                    | `PostgreSQL` (dev) or `SqlServer` (production/Azure).         |
| `ConnectionStrings:DefaultConnection` | Database connection string (format depends on provider).      |
| `JwtSettings:SecretKey`               | **Required.** Must be 32+ chars and cryptographically strong. |
| `JwtSettings:Issuer`                  | Token issuer identifier.                                      |
| `JwtSettings:Audience`                | Token audience identifier.                                    |
| `Authentication:Google:ClientId`      | (Optional) For Google Sign-In support.                        |
| `Authentication:Google:ClientSecret`  | (Optional) Google OAuth client secret.                        |
| `Frontend:BaseUrl`                    | Used for OAuth callbacks/redirects.                           |
| `AllowedOrigins`                      | Array of allowed CORS origins for production.                 |

---

## 📂 Project Anatomy

```text
src/
├── 📂 Backend
│   ├── 🧱 JobTracker.API            # Entry point, Controllers, Swagger, DI
│   ├── 🏗️ JobTracker.Infrastructure # EF Core, Migrations, Repositories
│   ├── 🧠 JobTracker.Application    # DTOs, Validators, Interfaces
│   └── 💎 JobTracker.Core           # Domain Entities, Enums (Pure)
├── 📂 Frontend                      # Angular 21 Application
└── 🐳 docker-compose.yml            # Local dev environment

```

---

## 📦 Production Build

**Backend:**

```bash
dotnet publish src/Backend/JobTracker.API -c Release -o publish

```

**Frontend:**

```bash
cd src/Frontend && npm run build

```

> **Security Tip:** In production, ensure `JwtSettings:SecretKey` is injected via environment variables and strictly limit CORS origins in `Program.cs`.

---

## 💡 Developer Tips

- **Swagger Power:** Use the "Authorize" button in Swagger UI (`/swagger`) with the token received from `/api/auth/login` to test protected endpoints manually.
- **Resetting Data:** The `--reset-db` flag is destructive! It creates a fresh DB instance. Use only during early development.
- **File Permissions:** Ensure the `src/Backend/JobTracker.API/uploads` folder is writable by the process running the API.

---

## 🔐 Security Features

This application implements enterprise-grade security practices:

| Feature                   | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| **JWT Authentication**    | Stateless token-based auth with configurable expiration        |
| **ASP.NET Core Identity** | Password hashing, lockout protection (5 attempts → 5 min lock) |
| **Rate Limiting**         | IP-based throttling (100 req/min global, 5 login/min)          |
| **Security Headers**      | X-Frame-Options, HSTS, CSP, X-Content-Type-Options             |
| **Input Validation**      | FluentValidation for all DTOs                                  |
| **File Upload Security**  | Type checking, size limits (10MB), path traversal prevention   |
| **CORS Policy**           | Configurable allowed origins                                   |
| **Security Logging**      | Middleware for audit trails and threat detection               |

---

## 🗄️ Database Strategy

This project uses a **dual-database strategy** for cost optimization:

| Environment     | Database   | Why?                                           |
| --------------- | ---------- | ---------------------------------------------- |
| **Development** | PostgreSQL | Free, Docker-friendly, feature-rich            |
| **Production**  | SQL Server | 50% cheaper on Azure, better Azure integration |

### How It Works

The database provider is selected via the `DatabaseProvider` setting in `appsettings.json`:

```json
{
  "DatabaseProvider": "PostgreSQL"
}
```

> **Note:** Set `DatabaseProvider` to `"PostgreSQL"` for local development (Docker), or `"SqlServer"` for Azure production deployment.

**Entity Framework Core** handles the abstraction, so your code works identically with both databases. Migrations are provider-agnostic.

### Connection String Examples

**PostgreSQL (Development):**

```
Host=localhost;Port=5433;Database=jobtracker;Username=postgres;Password=yourpassword
```

**SQL Server (Azure Production):**

```
Server=tcp:yourserver.database.windows.net,1433;Initial Catalog=jobtracker;User ID=admin;Password=YourPassword;Encrypt=True;
```

---

## ☁️ Cloud Deployment

This project is designed for deployment on **Microsoft Azure**:

- **Frontend:** Azure App Service (shared B1 plan with backend - no extra cost!)
- **Backend:** Azure App Service (.NET 10)
- **Database:** Azure SQL Server (Basic tier - cost-optimized for students)
- **Secrets:** Azure Key Vault

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
