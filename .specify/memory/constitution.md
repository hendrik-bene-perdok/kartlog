<!--
SYNC IMPACT REPORT
Version Change: 0.0.0 -> 1.0.0 (Initial Constitution Adoption from .agent/rules/constitution.md)
Modified Principles:
- Adopted "Make it Work, Make it Right, Make it Fast" as Core Principle
- Adopted "Principle Hierarchy" (Security > Correctness > Maintainability > Performance)
- Adopted "Foundational Principles" (KISS, YAGNI, Boy Scout Rule, Pragmatism)
Added Sections:
- I. Architecture & Code Quality
- II. User Experience & Performance
- III. Testing & Quality Assurance
- IV. Security & Data Protection
- V. Infrastructure & Operations
- VI. Governance & Workflow
- VII. Documentation
Templates Updated:
- ✅ templates/plan-template.md (Architecture, Security, Performance gates added)
- ✅ templates/spec-template.md (Security, Performance, Accessibility requirements added)
- ✅ templates/tasks-template.md (Mandatory testing, Security/Audit tasks added)
- ✅ templates/commands/*.md (Implicitly consistent)
Follow-up TODOs:
- None
-->

# Kartlog Constitution

## Core Principles

### "Make it Work, Make it Right, Make it Fast"
We prioritize long-term maintainability over short-term speed, but we reject complexity for complexity’s sake.

### Principle Hierarchy (When Rules Conflict)
Resolve trade-offs in this order:
1. **Security & Privacy**
2. **Correctness**
3. **Maintainability**
4. **Performance / UX optimizations**

### Foundational Principles
- **KISS (Keep It Simple):** Complexity is a liability. Prefer the simplest solution that satisfies requirements.
- **YAGNI:** Do not build features or abstractions for hypothetical future use cases. Solve the problem in front of you.
- **Boy Scout Rule:** Leave the code cleaner than you found it (names, types, structure, tests).
- **Pragmatism over Purity:** Rules exist to produce reliable outcomes, not to win debates. Use judgment—document exceptions.

## I. Architecture & Code Quality

### 1) General Coding Standards
- **DRY (Don’t Repeat Yourself):** Avoid duplication, but do not abstract too early.
  - Use the **Rule of 3**: don’t generalize until a pattern repeats meaningfully.
- **Meaningful Naming:** Names must explain intent.
  - Avoid vague names like `data`, `item`, `handleStuff` except for trivial, tight scopes.
  - Prefer `userProfile`, `cartItem`, `submitOrder`, `parseInvoiceCsv`.
- **Strict Typing:**
  - `any` is **prohibited**.
  - Prefer `unknown` at boundaries and narrow types safely.
  - **Exception:** External/legacy boundaries may use `any` only behind a typed adapter, with a ticket link + removal plan.
- **Refactoring Is Continuous:** No “refactoring sprint” required. Refactor whenever you touch code that is unclear or brittle.

### 2) Design Principles (Practical SOLID)
- **Single Responsibility (SRP):** One module/component = one reason to change.
  - **Guideline:** If a file exceeds ~200 lines, treat it as a smell—split when cohesion is low or testing becomes hard.
- **Open/Closed (OCP):** Prefer extension over modification, **but** refactor stable code when it improves correctness, security, or clarity.
- **Dependency Inversion (DIP):** Depend on abstractions (interfaces), not concrete implementations.
- **Information Hiding:** Expose only what consumers need; keep internals private.

### 3) Backend: Layered Architecture
**Separation of Concerns enforced via Service–Repository pattern.**
- **Controller**
  - HTTP transport only: request parsing, authentication context extraction, and validation.
  - No business rules.
- **Service**
  - Pure business logic, orchestration, domain rules.
  - No framework/transport logic.
- **Repository**
  - Data access only (SQL/NoSQL).
  - No business rules.

**Dependency Injection**
- Use DI to support modularity, testability, and clear boundaries.

### 4) Frontend Architecture
- **State Separation**
  - **Server state:** TanStack Query / SWR (caching, invalidation, pagination).
  - **Client state:** Context / Zustand for UI state only.
- **Composition over Inheritance:** Prefer small composable pieces over “God Components.”
- **Avoid Hidden Coupling:** Keep side-effects explicit (effects, queries, mutation handlers).

## II. User Experience & Performance

### Accessibility (WCAG 2.1 AA)
- All UI **must** comply with **WCAG 2.1 AA**:
  - Semantic HTML first
  - ARIA only when necessary
  - Full keyboard navigation
- Enforcement:
  - New UI must pass automated checks (e.g., axe) and a basic keyboard navigation smoke test.

### Responsiveness
- **Mobile-first** layouts.
- No horizontal scrolling at common breakpoints.
- Prefer fluid layouts and responsive typography.

### Performance Philosophy
- **Avoid Premature Optimization:** Do not obscure logic with micro-optimizations.
- **Perceived Performance:** Skeleton screens, optimistic UI where safe, and visible progress states for long operations.

### Performance SLOs (Latency Budgets)
Despite the above, architectural latency standards are strict.

#### Targets (p95)
- **Standard Reads:** < 200ms
- **Complex Writes:** < 500ms
- **Background Jobs:** Operations > 500ms must be async (`202 Accepted`)

#### Measurement Definition
- Latency is measured **server-side** from request ingress to response egress in **production**.
- Track p50/p95/p99 weekly; regressions require a mitigation plan (ADR or ticket).
- Exclusions (e.g., third-party downtime) must be explicitly documented.

## III. Testing & Quality Assurance

### Testing Strategy (Test Pyramid)
- **Unit Tests**
  - Required for complex logic, utilities, parsing, validation, and domain rules.
  - Mock external dependencies.
- **Integration Tests**
  - Required for service↔repository behavior and critical DB queries.
  - Verify migrations, query correctness, and transactional behavior.
- **Contract Tests**
  - APIs must validate against their OpenAPI/schema contracts (breaking changes must be deliberate and documented).
- **E2E Tests**
  - Required for critical user journeys (e.g., Login, Checkout, Payments, Admin flows).

### Coverage
- Minimum **80% coverage** for shared utilities and core domain logic.
- Coverage is a **floor**, not a goal; critical paths must be well-tested regardless of coverage percentage.

### Flaky Test Policy
- Flaky tests must be quarantined immediately and fixed within **5 working days**.

### CI Gates
- PRs cannot merge if any of the following fail:
  - Linting
  - Type checks
  - Unit/Integration tests
  - Security checks (where configured)

## IV. Security & Data Protection

### 1) Golden Rules
- **OWASP Top 10:** Code must explicitly mitigate common web vulnerabilities.
- **Zero Trust:** Never trust input—client, internal services, and even database values can be malicious or corrupted.
- **Fail Securely:** Deny access on failure; log safely without exposing stack traces or sensitive details.

### 2) Input & Output Hygiene
- **Universal Validation**
  - All incoming data (params, body, headers) must be validated against a strict schema (Zod/Joi/etc.) at the **Controller** layer.
- **Allow-lists over Block-lists**
  - Define exactly what is allowed; reject everything else.
- **SQL Injection Prevention**
  - Raw SQL is prohibited unless absolutely necessary and explicitly approved in code review.
  - Prefer ORM/query builders and parameterized queries.
- **XSS Prevention**
  - Never render unsafe HTML (`dangerouslySetInnerHTML` / `v-html`) unless sanitized (e.g., DOMPurify) and justified.

### 3) Authentication & Authorization
- **No DIY crypto:** Use battle-tested libraries/providers.
- **Authorization is server-side:** Client UI is not a security boundary.
- **Least Privilege:** Users/services receive only minimal required permissions.
- **Session Management**
  - If JWTs are used, they must be short-lived and rotated appropriately.
  - Store sensitive tokens in `HttpOnly`, `Secure` cookies—never in `localStorage`.
- **CSRF Protection**
  - For cookie-based auth: enforce `SameSite` strategy and CSRF tokens where appropriate.
- **Abuse Prevention**
  - Rate limit authentication endpoints and expensive operations; log and alert on suspicious patterns.

### 4) Data Privacy
- **Encryption**
  - PII and secrets must be encrypted at rest and in transit (TLS/HTTPS).
- **Logging**
  - Logging PII (emails, passwords, tokens) is a critical violation.
  - Use masking/redaction and structured fields.

### 5) Supply Chain Security
- Lockfiles are mandatory.
- Dependency updates are automated (Dependabot/Renovate or equivalent).
- Secret scanning runs locally (pre-commit) and in CI; leaked secrets require rotation within **24 hours**.
- Production artifacts/images must be scanned for known vulnerabilities where applicable.

## V. Infrastructure & Operations

### Infrastructure as Code (IaC)
- All infrastructure changes are defined in code (Terraform/CDK/etc.).
- Manual console changes are prohibited (except break-glass incidents—must be followed by IaC reconciliation).

### Observability
- **Structured Logging:** JSON format required.
- **Distributed Tracing:** Required for cross-service requests and latency debugging.
- **Metrics & Dashboards**
  - Service-level dashboards must include latency (p50/p95/p99), error rate, saturation, and key business metrics.

### Alerting Philosophy
- Alerts must be **actionable** (no noisy alerts).
- Define severity levels (SEV1–SEV3) and response expectations.

### Secrets Management
- **Never** commit secrets to Git.
- Use `.env` for local development and a secret manager for production (AWS Secrets Manager/Vault/etc.).
- Rotate secrets on compromise and document the incident.

### Reliability & Recovery
- Backups must exist for critical data.
- **Restore drills** must be performed periodically (schedule defined by the team) to ensure backups are usable.
- Critical systems require runbooks (what to check, where logs are, rollback steps).

## VI. Governance & Workflow

### 1) Git Standards
- **Branching:** Feature branches off `main`.
- **Protection:** No direct pushes to `main`; PRs required.
- **Commits:** Conventional Commits (e.g., `feat(auth): add login validation`).
- **Ownership:** Use CODEOWNERS where appropriate to ensure domain review.

### 2) Code Review Checklist
Reviewers must reject PRs that fail to meet these standards:
- [ ] **Simplicity:** Is the solution as simple as possible? (KISS/YAGNI)
- [ ] **Correctness:** Are edge cases handled? Are invariants enforced?
- [ ] **Legibility:** Are names meaningful? Is logic easy to follow?
- [ ] **Architecture:** Is code in the correct layer (Controller vs Service vs Repo)?
- [ ] **Safety:** Strict types, validation, error handling, and safe defaults
- [ ] **Security:** Authz enforced server-side; sensitive data handled correctly
- [ ] **Observability:** Useful logs/metrics/traces added for new/changed flows
- [ ] **Testing:** Appropriate unit/integration/e2e coverage for the change
- [ ] **Docs:** Public APIs/exports documented; ADR added if the change is architectural

## VII. Documentation

### 1) Philosophy
- **Self-Documenting Code:** Prefer clarity over cleverness; comments are not a substitute for good naming.
- **The “Why” Rule:** Comments should explain **why** a decision exists, not what the code does.

### 2) Implementation
- **Inline Documentation**
  - All exported interfaces, functions, hooks, and public modules must use JSDoc/TSDoc.
  - Must include: purpose, `@param`, and `@returns`.
- **API Documentation**
  - Endpoints must auto-generate docs (OpenAPI/Swagger) derived from schema/code.
  - Manual YAML editing is prohibited.
- **ADRs**
  - Significant structural changes or technology choices must be recorded:
    - `/docs/adr/001-title.md` (context, decision, consequences).
- **README**
  - The repository root must include a setup guide that enables a new developer to run the project locally within **15 minutes**.
- **Docs Freshness Rule**
  - Documentation must be updated in the **same PR** as the behavior change it describes.

## Amendment & Exceptions (Meta)
### Amendments (Changing the Constitution)
- Changes or exceptions to this constitution require:
  1. An ADR (`/docs/adr/`) describing the motivation and impact.

**Version**: 1.0.0 | **Ratified**: 2026-02-07 | **Last Amended**: 2026-02-07
