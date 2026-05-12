# Frontend Agent Instructions

## Scope

These instructions apply to the Angular frontend under `src/Frontend`.

Follow the root `AGENTS.md` and `BRAND.md` first. This file adds frontend-specific rules for Angular, Tailwind CSS, Spartan UI, product language, and Aptelion visual quality.

Read `BRAND.md` before making UI, copy, layout, naming, or product experience changes.

## Product Experience

The frontend should make Aptelion feel like a premium career operating system.

The product should help users:

- understand opportunity fit;
- improve career materials;
- prepare for interviews;
- compare offers;
- follow up on time;
- keep momentum.

Do not build generic SaaS screens. Every screen should make the next useful user action clear.

## UI Quality Bar

Every important screen should have:

- clear visual hierarchy;
- strong spacing;
- meaningful sectioning;
- consistent typography;
- useful empty states;
- responsive layout;
- accessible controls;
- clear primary action;
- Aptelion and Signal language;
- polished, production-like feel.

Avoid:

- random bento grids;
- excessive glow;
- excessive gradients;
- tactical or gamer language;
- purple as the default accent;
- generic AI orb visuals;
- decorative cards with no product value;
- copy-pasted long Tailwind class strings;
- inconsistent button, card, and dropdown styles.

## Angular Rules

- Keep standalone component conventions.
- Keep templates readable.
- Move complex expressions into computed values, signals, or component methods.
- Prefer typed interfaces for UI data.
- Avoid `any`.
- Avoid hidden behavior changes.
- Preserve existing route behavior unless explicitly requested.
- Preserve accessibility and keyboard behavior.
- Keep feature boundaries clear.
- Do not create god components.
- Do not place large business workflows directly inside templates.

## State And Data Rules

Use the project's existing state patterns.

Do:

- use signals and computed state where aligned with current code;
- keep state close to the feature when local;
- reuse existing stores/services when available;
- keep API calls in services, not components;
- keep UI-only state separate from persisted domain state.

Avoid:

- duplicated local state that conflicts with stores;
- direct API calls from deeply nested UI components;
- untyped mock objects leaking into production paths;
- hard-coded demo data unless the component is explicitly a mock/demo.

## Spartan UI Usage

Use Spartan UI as a consistent accessible foundation.

Do:

- use Spartan components for buttons, dropdowns, dialogs, sheets, inputs, badges, cards, command menus, and similar primitives where appropriate;
- keep variants consistent;
- wrap repeated UI patterns in shared components when useful;
- keep component APIs small and explicit.

Avoid:

- bypassing existing Spartan-based patterns with one-off custom controls;
- overriding internals with brittle CSS;
- using `::ng-deep` unless there is no clean alternative;
- inline `<style>` blocks in templates;
- inconsistent custom implementations for the same UI primitive.

## Tailwind And Styling Rules

Tailwind is allowed, but the visual system must remain coherent.

Do:

- use global design tokens where possible;
- prefer semantic tokens such as `primary`, `accent`, `muted`, `border`, `card`, and `foreground`;
- keep spacing, radius, shadow, and typography consistent;
- use module accents intentionally;
- keep dark mode functional when changing tokens.

Avoid:

- excessive arbitrary values;
- excessive glow effects;
- violet as the default product identity;
- noisy animated backgrounds;
- one-off visual experiments that do not match `BRAND.md`;
- local CSS for global brand concerns.

## Aptelion Visual Direction

Use the Aptelion brand system.

Preferred:

- Aptelion Navy;
- Deep Signal;
- Aptelion Cyan;
- Signal Blue;
- Clear Mist;
- Soft Surface;
- Line Gray;
- Slate;
- Sora for headings;
- Inter for UI/body.

Violet may appear only as a subtle secondary accent, especially in Interview-related surfaces.

Avoid:

- cyberpunk visuals;
- crypto-style glow;
- military dashboard styling;
- generic AI assistant visuals;
- aggressive dark-mode-only aesthetics.

## Product Language

Use calm, useful, career-focused language.

Prefer:

- `Today's Focus`
- `Momentum`
- `Application Queue`
- `Signal Guidance`
- `Next best move`
- `Fit Overview`
- `Analyze fit`
- `Document Studio`
- `Interview Studio`
- `Offer Overview`
- `Timeline`
- `Create tailored document`
- `Keyword gap found`
- `Preview impact`
- `Focus mode`
- `Recommended next action`

Avoid:

- `Tactical`
- `Combat`
- `Arsenal`
- `Dojo`
- `Weaponry`
- `Mission Intel`
- `Deploy`
- `Operative`
- `Autopilot Engaged`
- `Magic AI`
- `Kwd Deficiency Detected`
- `Synchronizing Intel`
- `Career hacking`

## Dashboard Rules

The dashboard should not be a passive analytics page.

Prioritize:

- Today's Focus;
- Momentum;
- Application Queue;
- Signal Guidance;
- Recent Work;
- Follow-ups;
- At Risk;
- Ready to Improve.

The dashboard should answer:

- What matters now?
- What is stuck?
- What is the next best move?
- Which application needs attention today?
- Where is momentum being lost?

Avoid dashboards that only show counts and charts without next actions.

## Workspace Rules

Use the main Aptelion Studio structure:

- Fit
- Documents
- Interview
- Offer
- Timeline

Each workspace should have:

- a clear purpose;
- a summary surface;
- useful details;
- a recommended action;
- empty states that explain what to do next.

## Documents UI Rules

Documents should feel like a Document Studio, not just a file vault.

Prefer:

- document structure;
- tailored versions;
- CV and cover letter surfaces;
- reusable content sections;
- block-level improvement direction;
- preview and version-oriented language.

Avoid:

- weapon/arsenal/vault-heavy language;
- vague AI generation promises;
- large empty text areas without structure.

## Interview UI Rules

Interview should feel like Interview Studio, not a combat mode.

Prefer:

- scenario selection;
- practice path;
- answer review;
- follow-up question;
- session recap;
- targeted improvement suggestions.

Avoid:

- combat framing;
- interrogation language;
- aggressive performance copy.

## Accessibility

Do not regress accessibility.

Keep:

- semantic elements;
- labels;
- `aria-label` where needed;
- visible focus states;
- keyboard navigation;
- sufficient contrast;
- non-color-only status communication.

## Validation

After frontend changes, run when feasible:

```bash
cd src/Frontend
npm install
npm run build
```

If build fails, report the command and relevant error summary.
