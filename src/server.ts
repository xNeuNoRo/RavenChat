import {
  container,
  Injectable,
  Inject,
  InjectConfig,
  LOGGER_TOKEN,
  LoggerContract,
} from "@neunoro/fastify-kit";

import { PinoLogger } from "./infrastructure/logger/PinoLogger";
import { DatabaseService } from "./infrastructure/database/DatabaseService";
import { buildApp } from "./app";
import { loadAppConfigurations } from "./config/app.config";
import { FastifyInstance } from "fastify";

@Injectable()
class ApplicationServer {
  @InjectConfig("port")
  private readonly port: number = 4000; // Valor por defecto para desarrollo, se puede sobrescribir con la variable de entorno PORT

  @InjectConfig("host")
  private readonly host: string = "0.0.0.0"; // Valor por defecto para permitir conexiones externas, se puede sobrescribir con la variable de entorno HOST

  @Inject(LOGGER_TOKEN)
  private readonly logger!: LoggerContract;

  @Inject(DatabaseService)
  private readonly dbService!: DatabaseService;

  public async start(): Promise<void> {
    try {
      // Conectamos la base de datos
      await this.dbService.connect();

      // Construimos la app Fastify
      const app = await buildApp();

      // Usamos las variables inyectadas
      await app.listen({ port: this.port, host: this.host });
      this.logger.info(`API escuchando en http://${this.host}:${this.port}`);

      // Configuramos el Graceful Shutdown
      this.setupGracefulShutdown(app);
    } catch (error) {
      this.logger.error("💥 Error fatal al arrancar la app:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      process.exit(1);
    }
  }

  /**
   * @description Configura el manejo de señales para realizar un Graceful Shutdown del servidor y la base de datos.
   * @param app La instancia de la aplicación Fastify que se va a cerrar durante el proceso de shutdown.
   * @remarks Este método escucha las señales SIGINT y SIGTERM, que son comunes para indicar que el proceso debe finalizar.
   * Al recibir una de estas señales, se ejecuta la función de shutdown que cierra primero el servidor HTTP y luego
   * la conexión a la base de datos, asegurando que no se pierdan solicitudes en proceso ni se dejen conexiones abiertas.
   * Si ocurre algún error durante este proceso, se registra el error y se fuerza la salida del proceso con un código de error.
   */
  private setupGracefulShutdown(app: FastifyInstance): void {
    const shutdown = async (signal: string) => {
      this.logger.warn(
        `🔴 Señal ${signal} recibida. Iniciando Graceful Shutdown...`,
      );

      try {
        await app.close();
        this.logger.debug("✅ Servidor HTTP cerrado.");

        await this.dbService.disconnect();
        this.logger.debug("✅ Base de datos desconectada.");

        this.logger.info("💤 Shutdown completado. Saliendo...");
        process.exit(0);
      } catch (err) {
        this.logger.error("💥 Error durante el Graceful Shutdown:", { err });
        process.exit(1);
      }
    };

    // Escuchamos las señales de terminación para iniciar el proceso de shutdown
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }
}

// Cargamos las configuraciones de la aplicación antes de resolver cualquier dependencia
loadAppConfigurations();

// Registramos dependencias
container.registerClass(LOGGER_TOKEN, PinoLogger);

const server = container.resolve(ApplicationServer);
await server.start();
