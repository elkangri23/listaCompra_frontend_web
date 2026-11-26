# syntax=docker/dockerfile:1
# Frontend listaCompra — Next.js 15 + React 19
# Las variables NEXT_PUBLIC_* y NEXTAUTH_URL se fijan EN EL BUILD (punto 3):
# van como ARG y quedan horneadas en el bundle. Cambiarlas exige rebuild.

FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=https://listacompra.laurafernandezenfermeria.com/api/v1
ARG NEXTAUTH_URL=https://listacompra.laurafernandezenfermeria.com
ARG NEXTAUTH_SECRET
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
# Evita que Next intente telemetría / descargas en build
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Como en el backend: los archivos del builder son de root y el proceso
# corre como node; sin --chown, Next no podría escribir su caché.
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/next.config.js ./next.config.js
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/.next ./.next

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/auth/session || exit 1

CMD ["npm", "run", "start", "--", "-p", "3000"]
