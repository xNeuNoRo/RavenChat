import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { RavenDbService } from "./RavenDbService";
import { getLogger, requestContext } from "@neunoro/fastify-kit";

export const ravenSessionPlugin = fp(async (fastify: FastifyInstance) => {
  // Agregamos un hook para abrir una sesión de RavenDB en cada solicitud
  // Las sesiones de ravendb son como transacciones ligeras SQL, que nos garantizara ACID a nivel de cada documento
  fastify.addHook("preHandler", async () => {
    // abrimos la sesion
    const session = RavenDbService.store.openSession();

    // obtenemos nuestra store de la request (individual) del framework (fastify-kit)
    const store = requestContext.getStore();

    // si hay una store, le inyectamos la sesion de ravendb
    if (store) {
      store.set("dbSession", session);
    } else {
      // si no, usamos el logger global del framework para informar el error
      getLogger().error(
        "Error al obtener el store de AlsStore para inyectar la sesión de RavenDB.",
      );
    }
  });

  // Agregamos un hook para cerrar la sesión de RavenDB al responder la solicitud
  fastify.addHook("onResponse", async () => {
    const session = requestContext.get("dbSession");
    if (session) {
      session.dispose();
    }
  });
});
