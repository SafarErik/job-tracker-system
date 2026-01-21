# 🚀 JobTracker

**Stop using spreadsheets.** --> A full-stack solution to track applications, manage documents, and visualize your career trajectory.

JobTracker is a robust, "future-proof" architecture combining the raw performance of **ASP.NET Core 10** with the reactivity of **Angular 21**. It features a pristine **Clean Architecture** implementation, complete with JWT authentication, file management, and insightful analytics.

---

## ✨ Features at a Glance

* **🔐 Secure Identity:** Full JWT authentication flow with ASP.NET Core Identity. Includes optional **Google OAuth** integration.
* **📂 Smart Pipeline:** Manage applications with a Kanban-style logical flow (Applied → Interview → Offer).
* **📄 Document Hub:** Upload resumes and cover letters (PDF, up to 10MB) linked directly to specific applications.
* **📊 Career Analytics:** Visual stats on your success rate, interview frequency, and offer ratios.
* **🏢 Company Intel:** specific history tracking per company.
* **🛠 Clean Architecture:** Strict separation of concerns:
* **Core:** Domain entities & Interfaces (Pure C#)
* **Application:** Business logic, DTOs, Use Cases
* **Infrastructure:** EF Core, Repositories, File Systems
* **API:** Controllers & Entry points



---

## 🏗 Tech Stack

| Layer | Technology | Highlights |
| --- | --- | --- |
| **Frontend** | **Angular 21** | Tailwind-ready, Signal-based reactivity, modular design. |
| **Backend** | **ASP.NET Core 10** | Web API, Identity, custom Middleware. |
| **Database** | **PostgreSQL** | Managed via Entity Framework Core. |
| **DevOps** | **Docker Compose** | Orchestrates DB and pgAdmin for zero-friction dev. |

---

## 🚀 Quick Start (Local Dev)

### 1. Prerequisites

Ensure you have the bleeding edge installed:

* .NET 10 SDK
* Node.js 20+ & npm
* Docker Desktop

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

*API is now live at: `http://localhost:5053` (Swagger at `/swagger`)*

### 4. Frontend Setup

In a new terminal:

```bash
cd src/Frontend
npm install
npm start

```

*Frontend is now live at: `http://localhost:4200*`

---

## ⚙️ Configuration Cheat Sheet

Environment variables and `appsettings.json` keys you need to know:

| Key | Description |
| --- | --- |
| `ConnectionStrings:DefaultConnection` | Postgres connection string. |
| `JwtSettings:SecretKey` | **Required.** Must be distinct and strong. |
| `Authentication:Google:ClientId` | (Optional) For Google Sign-In support. |
| `Frontend:BaseUrl` | Used for OAuth callbacks/redirects. |
| `FileSystem:UploadPath` | Location for storing user PDFs. |

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

* **Swagger Power:** Use the "Authorize" button in Swagger UI (`/swagger`) with the token received from `/api/auth/login` to test protected endpoints manually.
* **Resetting Data:** The `--reset-db` flag is destructive! It creates a fresh DB instance. Use only during early development.
* **File Permissions:** Ensure the `src/Backend/JobTracker.API/uploads` folder is writable by the process running the API.