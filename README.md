# Study Buddy Monorepo

Academic graph collaboration web app built with Next.js, Express.js, and Neo4j.

## Repository Structure

- `apps/frontend`: Next.js client application with Tailwind CSS (Apple-like design system).
- `apps/backend`: Express.js server boilerplate interacting with Neo4j AuraDB.

## Tech Stack
* **Database:** Neo4j (Cypher Query Language)
* **Backend:** Express.js (Node.js) + `neo4j-driver`
* **Frontend:** Next.js + Tailwind CSS
* **Monorepo Tooling:** Turborepo (`turbo`)

## Development

Install all dependencies in root:
```bash
npm install
```

Start both applications in development mode simultaneously using Turbo:
```bash
npm run dev
```

Build all applications:
```bash
npm run build
```