# syntax=docker/dockerfile:1

# Stage 1 — Build du frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2 — Build du backend
FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# On récupère le frontend déjà buildé
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
RUN rm -f tsconfig.build.tsbuildinfo && npm run build

# Stage 3 — Image de production légère
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --production && npm cache clean --force
# Copie du backend compilé + frontend statique
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/frontend/dist ./frontend/dist
EXPOSE 3000
CMD ["node", "dist/main"]
