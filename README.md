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
- **🛠 Clean Architecture:** Strict separation of concerns:
    - **Core:** Domain entities & Interfaces (Pure C#)
    - **Application:** Business logic, DTOs, Use Cases
    - **Infrastructure:** EF Core, Repositories, File Systems
    - **API:** Controllers & Entry points

---

## 🏗 Tech Stack

| Layer        | Technology           | Highlights                                            |
| ------------ | -------------------- | ----------------------------------------------------- |
| **Frontend** | **Angular 21**       | Tailwind-ready, Signal-based reactivity, modular design. |
| **Backend**  | **ASP.NET Core 10**  | Web API, Identity, custom Middleware.                 |
| **Database** | **PostgreSQL**       | **Neon** (Serverless Postgres) for production.        |
| **DevOps**   | **Docker Compose**   | Local development environment.                        |
| **Deploy**   | **Render & Vercel**  | Modern cloud deployment pipeline.                     |

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

**Database Seeding:**
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
| `ConnectionStrings:DefaultConnection` | Database connection string (PostgreSQL format).               |
| `JwtSettings:SecretKey`               | **Required.** Must be 32+ chars and cryptographically strong. |
| `JwtSettings:Issuer`                  | Token issuer identifier.                                      |
| `JwtSettings:Audience`                | Token audience identifier.                                    |
| `Authentication:Google:ClientId`      | (Optional) For Google Sign-In support.                        |
| `Authentication:Google:ClientSecret`  | (Optional) Google OAuth client secret.                        |
| `Frontend:BaseUrl`                    | Used for OAuth callbacks/redirects.                           |
| `AllowedOrigins`                      | Array of allowed CORS origins for production.                 |

---

## ☁️ Cloud Deployment

This project is optimized for a modern, serverless-first deployment stack.

### 1. Database: Neon (PostgreSQL)

1.  Create a project on [Neon.tech](https://neon.tech).
2.  Get your **Postgres Connection String**.
3.  Use this connection string in your Backend environment variables.

### 2. Backend: Render

1.  Create a new **Web Service** on [Render](https://render.com).
2.  Connect your repository.
3.  **Build Command:** `dotnet publish src/Backend/JobTracker.API -c Release -o out`
4.  **Start Command:** `dotnet out/JobTracker.API.dll`
5.  **Environment Variables:**
    - `ASPNETCORE_ENVIRONMENT`: `Production`
    - `ConnectionStrings__DefaultConnection`: `your_neon_connection_string`
    - `JwtSettings__SecretKey`: `your_secret_key`

### 3. Frontend: Vercel

1.  Import your project into [Vercel](https://vercel.com).
2.  **Root Directory:** `src/Frontend`
3.  **Build Command:** `npm run build`
4.  **Output Directory:** `dist/job-tracker/browser`
5.  All routing issues are handled by `vercel.json`.

---

## 🗄️ Database

This project uses **PostgreSQL** for both development and production consistency.

### Connection String Format

```
Host=ep-xyz.aws.neon.tech;Database=neondb;Username=user;Password=pass;sslmode=require
```

### Local Development Setup

```bash
# Start PostgreSQL in Docker
docker-compose up -d

# Run migrations
cd src/Backend
dotnet ef database update --project JobTracker.Infrastructure --startup-project JobTracker.API
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
