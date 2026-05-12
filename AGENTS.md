# Repository Agent Instructions

## Scope

These instructions apply to the whole repository. More specific instructions may exist in subdirectories and should be followed together with this file.

This repository contains Aptelion, a career operating system for focused professional growth.

Aptelion helps users evaluate opportunities, improve career materials, prepare for interviews, understand offers, and keep applications moving with clarity and intent.

## Brand And Product Direction

Always read `BRAND.md` before making UI, copy, layout, naming, architecture, or product experience changes.

Use the current Aptelion brand architecture:

- **Aptelion**: the main product and platform brand.
- **Aptelion Core**: the open-source foundation.
- **Aptelion Cloud**: the hosted commercial SaaS product.
- **Aptelion Signal**: the private AI guidance and decision-support layer.
- **Aptelion Studio**: the workspace experience for documents, applications, interviews, offers, and timelines.

Some internal technical names may still use legacy `JobTracker` naming during the transition. Do not rename projects, namespaces, folders, deployment paths, or package names unless explicitly requested.

## Product Experience

Aptelion should feel like a premium, calm, intelligent career operating system. It should help users answer:

- Which opportunity fits me?
- What should I improve before applying?
- How should I prepare?
- What needs attention today?
- What is the clearest next step?

The product should reduce career uncertainty, not add another dashboard to manage.

Prefer product language such as:

- Fit Overview
- Analyze fit
- Document Studio
- Interview Studio
- Offer Overview
- Timeline
- Signal Guidance
- Next best move
- Momentum
- Application Queue
- Recommended next action

Avoid tactical, combat, weapon, magic AI, bot, or hype-heavy language in product surfaces.

## Current Technical Stack

Frontend:

- Angular
- Tailwind CSS
- Spartan UI
- Lucide icons

Backend:

- ASP.NET Core
- Clean Architecture
- Entity Framework Core
- SQL Server
- ASP.NET Core Identity
- JWT Bearer Authentication

## Working Style

Act like a senior engineer working inside an existing codebase.

Before editing:

- inspect relevant files first;
- search for existing patterns before adding new ones;
- understand the current feature boundary;
- keep the patch cohesive and reviewable.

When implementing:

- deliver working code, not just a plan;
- preserve existing behavior unless the task explicitly asks for a behavior change;
- prefer simple, maintainable solutions over clever hacks;
- avoid broad rewrites unless explicitly requested;
- avoid speculative abstractions;
- avoid hidden behavior changes;
- keep changes consistent across all relevant UI surfaces.

Do not stop with only a plan unless the task is clearly blocked.

## Git Safety

The working tree may contain user changes.

- Never run destructive commands such as `git reset --hard`, `git checkout --`, or mass deletion commands unless explicitly requested.
- Never revert changes you did not make.
- If unexpected unrelated changes appear, stop and report the situation.
- Do not amend commits unless explicitly requested.
- Do not rename large project structures unless explicitly requested.

## Search And File Exploration

Prefer fast, targeted repository exploration.

- Use `rg` for text search when available.
- Use `rg --files` for file discovery when available.
- Search before adding new helpers, components, services, or constants.
- Read enough surrounding context before patching.
- Batch related edits instead of making many tiny, disconnected changes.

## Code Quality

Optimize for correctness, clarity, type safety, and long-term maintainability.

Do:

- follow existing Angular and .NET conventions;
- keep components focused and readable;
- use proper TypeScript and C# types;
- reuse existing utilities, models, pipes, stores, services, DTOs, and abstractions;
- keep naming consistent and domain-specific;
- surface errors using existing notification/error patterns;
- keep UI logic, application logic, domain logic, and infrastructure concerns separated;
- prefer small composable helpers over large template expressions or god services;
- add or update tests when behavior changes.

Avoid:

- spaghetti code;
- duplicated logic;
- large untyped objects;
- unnecessary `any`;
- broad `try/catch` blocks that hide errors;
- silent fallbacks;
- deeply nested template logic;
- controller-heavy business logic;
- copy-pasted Tailwind class blobs when a reusable pattern is obvious;
- fragile DOM hacks;
- unnecessary dependencies.

## Visual Direction

Use the Aptelion visual direction from `BRAND.md`.

Preferred direction:

- premium light-first UI;
- calm dark mode support;
- clean surfaces;
- generous spacing;
- soft depth;
- clear hierarchy;
- selective cyan/blue accents;
- subtle motion;
- meaningful progress signals;
- Sora for headings;
- Inter for UI and body text.

Core palette:

- Aptelion Navy: `#0B1020`
- Deep Signal: `#16213E`
- Slate: `#5E6B82`
- Soft Surface: `#F5F8FC`
- Line Gray: `#D7DFEA`

Brand accents:

- Aptelion Cyan: `#4FC3E8`
- Signal Blue: `#2E7CF6`
- Clear Mist: `#DDF6FF`

Semantic colors:

- Success: `#2FBF71`
- Warning: `#F59E0B`
- Danger: `#E5484D`
- Neutral: `#64748B`

Avoid excessive glow, excessive violet as the main brand color, noisy animated backgrounds, crypto/cyberpunk styling, generic AI orb visuals, and decoration without product meaning.

Violet may only be used sparingly as a secondary accent, especially in Interview-related surfaces.

## Main Product Areas

Use the following workspace structure:

- **Fit**: role fit, match score, strengths, gaps, missing keywords, recommended next action.
- **Documents**: CV, cover letter, tailored versions, block-level editing, reusable content blocks.
- **Interview**: guided preparation, scenario selection, answer practice, follow-up questions, session recap.
- **Offer**: compensation, negotiation, offer comparison, decision clarity.
- **Timeline**: milestones, deadlines, follow-ups, reminders, application history.

## Open-Core Boundaries

Design the codebase so that Aptelion Core remains useful and open, while Aptelion Cloud, Aptelion Signal, and advanced Aptelion Studio features can remain private.

Aptelion Core may include:

- shared UI foundation;
- design system primitives;
- basic application tracker;
- basic document workspace;
- basic timeline primitives;
- public schemas;
- public API contracts;
- public extension interfaces;
- reusable frontend components;
- local development setup;
- documentation.

Private/proprietary areas may include:

- AI scoring logic;
- recommendation engine;
- proprietary prompts;
- document generation logic;
- advanced fit analysis;
- advanced interview preparation;
- offer comparison logic;
- multi-tenant SaaS infrastructure;
- billing;
- premium integrations;
- commercial analytics;
- production deployment configuration;
- internal evaluation datasets;
- advanced automation logic.

Do not hard-code premium checks randomly across controllers, services, or components. If premium gating is needed later, isolate it behind explicit abstractions.

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

Do not weaken authentication, authorization, validation, CORS, file upload restrictions, or user data isolation.

## Scoped Instructions

Additional scoped instructions exist in subdirectories:

- `src/Frontend/AGENTS.md` for frontend-specific UI, Angular, Spartan UI, Tailwind, and design-system rules.
- `src/Backend/AGENTS.md` for backend-specific ASP.NET Core, Clean Architecture, EF Core, API, security, and open-core rules.

When editing files under a scoped directory, follow both this root file and the nearest scoped `AGENTS.md`.

## Validation Commands

For frontend changes, run when feasible:

```bash
cd src/Frontend
npm install
npm run build
```

For backend changes, run when feasible:

```bash
dotnet build
```

If backend tests exist, run:

```bash
dotnet test
```

If a command fails, report the failing command, include the relevant error summary, and distinguish between pre-existing failures and failures caused by the current changes when possible.

## Final Response Expectations

When finishing a task, report:

- what changed;
- files touched;
- build/test results;
- known limitations;
- recommended next step, if there is one.

Be concise, but do not hide uncertainty or failed validation.
