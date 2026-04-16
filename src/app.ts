import fs from "node:fs";
import { FastifyKit } from "@neunoro/fastify-kit";
import { AppModule } from "./app.module";

export async function buildApp() {
  // Creamos la aplicación usando la Factory del framework
  const app = await FastifyKit.create({
    // Módulo raíz de la aplicación
    module: AppModule,

    // Habilitamos soporte para WebSockets
    websockets: true,

    // Prefijo base para todas las rutas de la API
    globalPrefix: "/api",

    // Configuración de Seguridad (CORS, Helmet y Rate Limit)
    // El framework ya tiene los plugins integrados internamente.
    security: {
      enableCors: true,
      enableHelmet: true,
      rateLimit: {
        max: 100,
        timeWindow: "1 minute",
      },
    },

    // Configuración de Documentación (Swagger + Scalar)
    // Generará automáticamente la ruta /docs
    swagger: {
      title: "Books API",
      description: "API de alto rendimiento construida con Neucore Framework",
      version: "1.0.0",
    },

    // Opciones de bajo nivel para la instancia de Fastify (SSL, HTTP2, etc.)
    fastifyOptions: {
      // http2: true,
      https: {
        key: fs.readFileSync("./localhost+2-key.pem"),
        cert: fs.readFileSync("./localhost+2.pem"),
      },
      logger: false, // El framework usa su propio sistema de logs
    },
  });

  return app;
}
