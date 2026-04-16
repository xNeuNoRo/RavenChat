import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { RavenDbService } from "./RavenDbService";

export const ravenSessionPlugin = fp(async (fastify: FastifyInstance) => {
  // Agregamos un hook para abrir una sesión de RavenDB en cada solicitud
  // Las sesiones de ravendb son como transacciones ligeras SQL, que nos garantizara ACID a nivel de cada documento
  fastify.addHook("preHandler", async (request) => {
    request.dbSession = RavenDbService.store.openSession();
  });

  // Agregamos un hook para cerrar la sesión de RavenDB al responder la solicitud
  fastify.addHook("onResponse", async (request) => {
    if (request.dbSession) {
      request.dbSession.dispose();
    }
  });
});
