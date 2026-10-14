# Tu Mundo Finder

Base de proyecto con el cliente y la API separados para que puedan evolucionar y desplegarse de forma independiente.

## Estructura

```text
.
├── frontend/       # Aplicación web (Vite + React)
└── backend/        # API HTTP (Node.js + Express)
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Puesta en marcha

En una terminal, inicia la API:

```bash
cd backend
npm install
npm run dev
```

En otra terminal, inicia el cliente:

```bash
cd frontend
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000` y el cliente en `http://localhost:5173`. El proxy del cliente reenvía las solicitudes que comiencen con `/api` a la API local.

## Variables de entorno

Cada aplicación incluye un archivo `.env.example`. Cópialo como `.env` y ajusta sus valores si hace falta. Los archivos `.env` no se versionan.
