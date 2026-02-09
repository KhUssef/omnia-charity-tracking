# Omnia Charity Tracking Backend

## Overview
This backend is built with [NestJS](https://nestjs.com/), a progressive Node.js framework for scalable server-side applications. It powers the Omnia Charity Tracking platform, managing aid distribution, user authentication, family and visit tracking, and dashboard analytics.

## Architecture
- **Framework:** NestJS (TypeScript)
- **Database:** TypeORM (likely PostgreSQL or MySQL)
- **Authentication:** JWT-based, with role management
- **Modules:**
  - `aid`: Aid management (CRUD, search)
  - `aid-distribution`: Distribution tracking, visit linkage
  - `auth`: User registration, login, JWT, guards
  - `dashboard`: Analytics, heatmaps, stats
  - `deposit`: Deposit management
  - `family`: Family entity management
  - `location`: Location tracking, city boundaries
  - `user`: User CRUD, visit assignment
  - `visit`: Visit scheduling, tasks, linkage to users/families
  - `common`: Vulnerability scoring, interceptors
  - `config`: Configuration management
  - `scripts`: Data seeding, admin creation, simulation
  - `ai-recommendation`: Donation recommendations using AI logic

## Features
- **User Authentication & Authorization:**
  - Register, login, refresh, logout
  - JWT tokens, role-based access (admin, employee, etc.)
- **Aid Management:**
  - CRUD operations for aid
  - Search and filter
- **Aid Distribution:**
  - Track distributions per visit
  - Secure endpoints (JWT + roles)
- **Family & Visit Tracking:**
  - CRUD for families
  - Visit scheduling, assignment, completion
  - Assign users to visits, track current visit
- **Dashboard Analytics:**
  - Heatmaps for families and visits
  - City-level stats
- **Deposits:**
  - Manage deposits and related entities
- **Location Management:**
  - City boundaries, location updates
- **Data Seeding & Simulation:**
  - Scripts for admin/test user creation, fake data, visit timeline simulation
- **AI Recommendation System:**
  - Donation recommendations for families using AI logic

## API Endpoints
See `api-endpoints.txt` for a full list. Key endpoints:
- `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`
- `/aid` (CRUD)
- `/aid-distribution` (CRUD, by visit)
- `/dashboard/heatmap/families`, `/dashboard/heatmap/visits`, `/dashboard/cities/families`, `/dashboard/cities/visits`
- `/family`, `/visit`, `/deposit`, `/location`
- `/ai-recommendation/:familyId`

## Workflow
1. **User Registration/Login:** Users register and log in via `/auth` endpoints. JWT tokens are issued for secure access.
2. **Aid & Distribution:** Admins/employees create and manage aid. Distributions are linked to visits and families.
3. **Visit Assignment:** Users are assigned to visits, tracked via `user.service.ts` and `visit.service.ts`.
4. **Family Management:** Families are created, updated, and linked to visits and aid distributions.
5. **Dashboard Analytics:** Data is aggregated for heatmaps and city-level stats.
6. **Data Seeding:** Scripts automate admin/test user creation and simulate real-world scenarios.

## Critical Points
- **Security:** JWT authentication, role-based guards, password hashing (bcrypt)
- **Data Integrity:** Visit assignment logic ensures only one active visit per user
- **Error Handling:** Consistent use of exceptions (e.g., `NotFoundException`, `ConflictException`)
- **Scalability:** Modular structure, global interceptors, CORS enabled
- **Automation:** Cron jobs and scripts for data maintenance and simulation

## Setup & Usage
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run start:dev
   ```
3. Seed data and simulate:
   ```bash
   npm run start:full
   ```
4. Run tests:
   ```bash
   npm test
   ```

## Project Scripts
- `create:admin`: Create admin user
- `create:test-users`: Generate test users
- `seed:fake-data`: Populate database with fake data
- `simulate:timeline`: Simulate visit timelines
- `sync:visits`: Sync active visits
- `backfill:boundaries`: Update city boundaries

## Contributing
- Follow NestJS best practices
- Use TypeScript and strict linting
- Write unit and e2e tests

## License
UNLICENSED

## AI Recommendation System

A new module `ai-recommendation` provides donation recommendations for families using simple AI logic (extensible to real ML models).

- **Endpoint**: `GET /ai-recommendation/:familyId`
- **Réponse**: JSON avec recommandations personnalisées (type, montant, fréquence)
- **Emplacement du modèle ML**: `src/ai-recommendation/utils/model/`
- **Service**: Récupère les données de la famille et de l’historique des aides, applique la logique de recommandation.

### Exemple de réponse
```json
{
  "familyId": "...",
  "recommendation": {
    "type": "food",
    "amount": 100,
    "frequency": "monthly",
    "reason": "Based on vulnerability and past aid."
  },
  "aidHistoryCount": 3
}
```

---
For frontend documentation, see the corresponding frontend folder.
