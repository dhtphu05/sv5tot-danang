# 07 — PERMANENT DUAL-MODE ARCHITECTURE & ISOLATION SPECIFICATION
**Project:** 5TOT Đà Nẵng  
**Phase:** BE0-R2 — Final Design Closure  
**Cross-References:** `src/shared/config/executionMode.ts`, `src/entities/services/modeResolver.ts`, `src/entities/services/contracts.ts`

---

## 1. PERMANENT DUAL-MODE MANDATE

The 5TOT Đà Nẵng system permanently supports two strictly isolated execution modes sharing a single unified React frontend:

```text
UI / Pages / Widgets (Single Unified Codebase)
                      |
                      v
Feature Hooks (src/features/services/useDomainServices.ts)
                      |
                      v
Typed Domain Service Contracts (src/entities/services/contracts.ts)
                      |
                      v
Mode Resolver (src/entities/services/modeResolver.ts)
             /                 \
            v                   v
[DEMO MODE]                     [BACKEND MODE]
demoServicesAdapter             backendServicesAdapter
       |                               |
In-Memory / Demo Store          Authenticated HTTP Client (/api/v2/*)
       |                               |
Isolated Demo Fixtures          PostgreSQL (Prisma) + Private Object Storage
```

---

## 2. STRICT ISOLATION INVARIANTS

| Dimension | Interactive Demo Mode (`DEMO`) | Real Backend Mode (`BACKEND`) |
| :--- | :--- | :--- |
| **Activation** | Default (`VITE_5TOT_EXECUTION_MODE=DEMO` or `?mode=demo`) | Explicit configuration (`VITE_5TOT_EXECUTION_MODE=BACKEND` or `?mode=backend`) |
| **Authentication & Persona Switching** | Interactive Demo Launcher & instant Persona Switcher (`Student`, `Collective`, `School Officer`, `City Manager`, `City Officer`, `Committee`, `Admin`) enabled. | Real credential / OIDC login (`POST /api/v2/auth/login`). **Persona Switcher UI is disabled/hidden in `BACKEND` mode**; URL query parameters never grant roles. |
| **Persistence Layer** | Browser memory / isolated Demo storage (`5tot_danang_*` Demo keys). Works 100% offline / without backend server. | PostgreSQL 16+ via Prisma ORM (`prisma/schema.prisma`). Zero reliance on `localStorage` for business data. |
| **Evidence Storage** | Simulated in-memory / Demo preview URLs. | Private Cloud Object Storage (`EvidenceObject` + `EvidenceObjectVersion`) via presigned PUT/GET URLs. |
| **Error & Fallback Behavior** | Deterministic in-memory validation errors. | **Zero Silent Fallback:** If any `/api/v2/*` request fails (`4xx`, `5xx`, or network timeout), `httpClient` throws a typed `BackendApiError` surfaced in the UI. It **NEVER** catches a backend error and returns Demo fixture data. |
| **Server Imports** | Demo stores (`src/staff/*Store.ts`, `src/demo/**`) run only in the browser when `mode === 'DEMO'`. | Backend V2 (`src/server-v2/**`) has **zero runtime imports** from `src/demo/**` or `src/staff/*Store.ts`. |

---

## 3. SHARED DOMAIN VOCABULARY & CONTRACT ALIGNMENT

To guarantee that no frontend page or widget is ever duplicated between modes:
1. Both `demoServicesAdapter` and `backendServicesAdapter` implement the exact same `DomainServicesBundle` interface (`src/entities/services/contracts.ts`).
2. Both modes enforce the same canonical business rules:
   - **Individual Track:** 5 criteria (`ETHICS`, `ACADEMIC`, `PHYSICAL`, `VOLUNTEER`, `INTEGRATION`) -> School Preliminary Review (`SCHOOL_PRELIMINARY`) -> Forward to City (`CITY_REVIEW`) -> Committee (`COMMITTEE_FINALIZATION`) -> Published `ApplicationFinalResult`.
   - **Collective Track:** Authorized Collective Representative -> 4 requirements (`TT01` School recognition prerequisite, `TT02` `participatingMembers === totalMembers` [100%], `TT03` `recognizedMembers * 100 >= totalMembers * 20` [>= 20%], `TT04` no violations + evidence) -> Direct-to-City submission (`CITY_UNASSIGNED`) -> City Manager Assignment -> City Officer Review -> Committee -> Published `ApplicationFinalResult`.
3. Optimistic concurrency (`version`) is supported in both adapters (`demoServicesAdapter` increments `version` in memory; `backendServicesAdapter` sends `expectedVersion` to PostgreSQL).
