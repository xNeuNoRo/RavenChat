import { ConfigRegistry } from "@neunoro/fastify-kit";

/**
 * @description Función para cargar las configuraciones de la aplicación desde las variables de entorno.
 */
export const loadAppConfigurations = (): void => {
  // Configuración del Servidor HTTP
  ConfigRegistry.set("port", Number(process.env.PORT) || 4000);
  ConfigRegistry.set("host", process.env.HOST || "0.0.0.0");

  // En el futuro, con mas configs idk
  // ConfigRegistry.set("jwt_secret", process.env.JWT_SECRET);
};
