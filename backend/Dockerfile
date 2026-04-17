# ==========================================
# Fase 1: Builder
# ==========================================
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copiamos los archivos de dependencias para aprovechar el caché de Docker
COPY package.json bun.lock ./

# Instalamos TODAS las dependencias (necesarias para tipos de TS y compilación al vuelo)
RUN bun install --frozen-lockfile

# Copiamos el resto del código fuente
COPY . .

# ==========================================
# Fase 2: Runner (Producción)
# ==========================================
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Establecemos el entorno en producción para que Fastify y otras librerías se optimicen
ENV NODE_ENV=production

# Copiamos ÚNICAMENTE lo necesario desde el builder, dejando atrás código basura o caché
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules

# Exponemos el puerto
EXPOSE 4000

# Iniciamos el servidor directamente con Bun
CMD ["bun", "run", "src/server.ts"]