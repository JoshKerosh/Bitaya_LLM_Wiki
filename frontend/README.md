# BITAYA Incluye Frontend

MVP frontend de chat con React, Vite, TypeScript y Tailwind.

## Ejecutar

```bash
cd /home/davraa01/BITAYA/frontend
npm install
cp .env.example .env.local
npm run dev
```

Abrir:

```text
http://127.0.0.1:5173/
```

## Backend esperado

El frontend llama a:

```text
POST ${VITE_API_BASE_URL}/api/chat
```

Configurar en `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

## Build

```bash
npm run build
```
