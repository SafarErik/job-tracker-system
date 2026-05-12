# Backend Agent Instructions

## Scope

These instructions apply to backend code under `src/Backend`.

Follow the root `AGENTS.md` and `BRAND.md` first. This file adds backend-specific rules for ASP.NET Core, Clean Architecture, Entity Framework Core, authentication, authorization, security, and Aptelion open-core boundaries.

Read `BRAND.md` before making API naming, copy, user-facing response, product architecture, or product boundary changes.

## Backend Architecture

The backend follows a Clean Architecture / Onion Architecture style.

Expected layers:

- `Core`: domain entities, value objects, enums, domain rules, domain interfaces.
- `Application`: use cases, DTOs, commands/queries, application services, validation, orchestration.
- `Infrastructure`: EF Core, persistence, external services, file storage, provider implementations.
- `API`: controllers/endpoints, request/response handling, authentication, authorization, HTTP concerns.

Respect dependency direction:

- `Core` must not depend on `Application`, `Infrastructure`, or `API`.
- `Application` may depend on `Core`.
- `Infrastructure` may depend on `Application` and `Core`.
- `API` may depend on `Application` and composition/configuration concerns.
- Do not put business logic in controllers.
- Do not put infrastructure implementation details in the domain layer.

Some backend projects may still use legacy `JobTracker` names. Do not rename projects, namespaces, or folders unless explicitly requested.

## General Backend Rules

Act like a senior backend engineer.

Before editing:

- inspect existing patterns;
- search for similar services, DTOs, validators, repositories, controllers, and mappings;
- understand the current feature boundary before adding new files;
- keep changes cohesive and reviewable.

When implementing:

- preserve existing behavior unless the task explicitly asks for behavior changes;
- prefer explicit, typed models over dynamic structures;
- avoid speculative abstractions;
- avoid large rewrites unless explicitly requested;
- keep use cases small and focused;
- keep domain rules close to the domain model when appropriate;
- keep orchestration in the application layer;
- keep HTTP-specific logic in the API layer.

## Controllers And API Endpoints

Controllers/endpoints should be thin.

They may:

- accept HTTP requests;
- validate route/body binding at the boundary;
- call application services/use cases;
- return appropriate HTTP responses;
- apply authorization attributes or policies.

They must not:

- contain business rules;
- directly query EF Core unless the existing project pattern explicitly does this;
- construct complex domain workflows inline;
- expose persistence entities directly as API contracts;
- swallow exceptions and return fake success responses.

Use request and response DTOs for API contracts.

## Application Layer Rules

The application layer should contain use-case orchestration.

Do:

- define clear application service methods;
- use DTOs for input/output;
- validate application-level requirements;
- coordinate repositories, domain services, and infrastructure abstractions;
- return explicit results or throw meaningful application exceptions according to existing project patterns.

Avoid:

- leaking EF Core `DbContext` into application services unless this is already the established pattern;
- returning tracked entities to the API layer;
- mixing HTTP concepts into application services;
- placing subscription, premium, Vadis, or Cloud logic randomly across services.

## Domain/Core Rules

The core layer should remain framework-independent.

Do:

- keep entities and value objects expressive;
- enforce true domain invariants in the domain model where appropriate;
- use enums and strongly typed identifiers when useful;
- keep interfaces here only when they represent domain/application needs.

Avoid:

- ASP.NET Core references;
- EF Core attributes unless already used consistently;
- configuration, logging, HTTP, file system, or database-specific code;
- scattering core business rules across controllers.

## Infrastructure Rules

Infrastructure implements external details.

This includes:

- EF Core persistence;
- database configuration;
- file storage;
- email providers;
- external APIs;
- AI provider adapters;
- payment/subscription providers;
- background job implementations.

Do:

- keep provider-specific code behind interfaces;
- isolate third-party SDKs;
- keep database queries efficient and explicit;
- use `AsNoTracking()` for read-only EF Core queries when appropriate;
- avoid loading large object graphs unnecessarily;
- keep migrations intentional and reviewable.

Avoid:

- leaking infrastructure types into Core;
- returning `IQueryable` outside repository/query boundaries unless already established;
- hiding external service failures behind silent fallbacks.

## Entity Framework Core

When working with EF Core:

- prefer async database calls;
- use cancellation tokens when existing patterns support them;
- use `AsNoTracking()` for read-only queries;
- avoid N+1 queries;
- avoid unnecessary eager loading;
- keep entity configurations explicit;
- keep migrations small and tied to intentional model changes;
- do not edit generated migration snapshots manually unless there is a clear reason;
- do not add database-breaking changes without noting migration impact.

For write operations:

- update only intended fields;
- avoid overposting;
- validate ownership/access before mutation;
- keep transaction boundaries explicit when multiple writes must succeed together.

## Authentication And Authorization

Authentication verifies identity. Authorization verifies access.

Do:

- preserve existing JWT/Identity behavior;
- use authorization policies or attributes consistently;
- validate ownership of user-owned resources;
- do not trust client-supplied user IDs when authenticated user context is available;
- avoid exposing data across users;
- keep admin, Cloud, Vadis, premium, and internal operations protected.

Never:

- disable authorization to make a feature work;
- weaken CORS/authentication settings without explicit instruction;
- log tokens, passwords, secrets, or sensitive personal data;
- return sensitive auth failure details to clients.

## Error Handling

Use explicit and consistent error handling.

Do:

- follow existing project error patterns;
- surface validation errors clearly;
- prefer standard problem responses where the project supports them;
- log unexpected server-side failures;
- keep production errors safe and non-sensitive.

Avoid:

- broad `catch (Exception)` blocks that return success;
- silent fallbacks;
- empty catch blocks;
- returning raw exception details to clients;
- using exceptions for normal control flow when a result type or validation path is clearer.

## Validation

Validate at the right layer.

- API layer: request shape, binding, simple input constraints.
- Application layer: use-case rules, required relationships, permission-sensitive operations.
- Domain layer: true invariants that must always hold.

Do not rely only on frontend validation.

## Security And Privacy

Never commit secrets.

Do not add:

- API keys;
- database credentials;
- JWT secrets;
- OAuth secrets;
- production connection strings;
- private tokens;
- real user data.

Use:

- environment variables;
- user secrets;
- existing configuration patterns;
- safe local development defaults.

When handling documents or user career data:

- treat uploaded files and generated documents as sensitive;
- avoid unnecessary logging of document contents;
- avoid storing derived Vadis prompts/responses without clear intent;
- validate file type and size according to existing project rules.

## Open-Core Boundaries

Aptelion follows an open-core strategy.

Aptelion Core should remain credible, useful, and open. Aptelion Cloud, Aptelion Vadis, and advanced Aptelion Studio functionality may remain proprietary.

Aptelion Core may include:

- core application structure;
- reusable UI/API primitives;
- basic application tracking;
- basic document workspace structure;
- basic timeline primitives;
- public data models;
- public API contracts;
- extension points;
- local-first or self-hostable foundations.

Private/proprietary layers may include:

- Aptelion Cloud hosting and SaaS infrastructure;
- Aptelion Vadis scoring and recommendation logic;
- proprietary prompts and evaluation models;
- document generation logic;
- advanced fit analysis;
- advanced interview preparation;
- offer comparison logic;
- multi-tenant infrastructure;
- billing and subscription handling;
- premium integrations;
- commercial analytics.

Rules:

- Do not hard-code premium checks randomly across controllers or services.
- If premium gating is needed, isolate it behind abstractions such as `IFeatureAccessService`, `ISubscriptionService`, or similarly project-consistent interfaces.
- Keep open-source and premium boundaries explicit.
- Do not move existing open-core functionality behind premium gates without explicit instruction.
- Do not introduce artificial limits into the open core unless explicitly requested.
- Keep Vadis-specific proprietary logic behind replaceable interfaces.

## Vadis Integration Rules

Aptelion Vadis is the private guidance layer.

Public/core code may define:

- request/response contracts;
- extension interfaces;
- basic placeholder implementations;
- simple rule-based or local-only foundations.

Private Vadis code may implement:

- advanced scoring;
- role-to-profile analysis;
- CV/job description comparison;
- interview preparation logic;
- next-best-action ranking;
- proprietary prompts;
- evaluation models.

Do not leak proprietary Vadis prompts, scoring weights, ranking logic, or private datasets into Aptelion Core.

## API Contract Rules

When changing API contracts:

- preserve backward compatibility where feasible;
- avoid renaming public fields casually;
- keep request/response DTOs explicit;
- document breaking changes in the final response;
- update frontend clients if the task includes full-stack changes.

Do not expose internal entity structure accidentally.

## Testing Rules

When backend behavior changes, add or update tests when the project has a test structure for the affected area.

Prioritize tests for:

- authorization/ownership checks;
- validation;
- application service behavior;
- persistence queries;
- feature access/premium gating rules when introduced;
- document upload/generation flows;
- authentication-sensitive endpoints.

Avoid tests that only assert implementation details.

## Build And Validation Commands

Before finishing backend changes, run when feasible:

```bash
dotnet build
```

If backend tests exist, run:

```bash
dotnet test
```

If the solution path is unclear, discover it first:

```bash
rg --files -g "*.sln"
rg --files -g "*.csproj"
```

For API local run checks, use the existing project path:

```bash
dotnet run --project src/Backend/JobTracker.API
```

If a command fails, report the command, summarize the error, and state whether it appears caused by the current change or pre-existing project state.

## Code Style

Follow existing C# conventions.

Do:

- use clear names;
- keep methods short enough to understand;
- prefer constructor injection or existing DI style;
- keep nullable reference types respected;
- avoid unnecessary casts;
- avoid magic strings when constants/enums are appropriate;
- use cancellation tokens where existing patterns use them.

Avoid:

- large god services;
- duplicated query logic;
- controller-heavy business logic;
- static service locators;
- hidden global state;
- unnecessary reflection;
- premature generic abstractions.

## Final Response Expectations

When finishing backend work, report:

- what changed;
- files touched;
- build/test results;
- migration impact, if any;
- security/auth impact, if any;
- open-core/Vadis boundary impact, if any;
- known limitations or recommended next step.
