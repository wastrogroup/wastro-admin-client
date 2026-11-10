# WASTRO Admin Client

React + TypeScript admin frontend (Phase 06 inventory).

## Prerequisites

- Node.js 20+
- Running admin API on `http://localhost:4000`

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

App: `http://localhost:5173`

## Notes

- Local API calls use `/api/v1` via the Vite proxy
- Categories, products, and inventory are live
- Inventory adjustments are transactional and write movement history
