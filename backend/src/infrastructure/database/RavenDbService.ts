import {
  Inject,
  InjectConfig,
  LOGGER_TOKEN,
  LoggerContract,
} from "@neunoro/fastify-kit";

import DocumentStore, {
  IDocumentStore,
  GetDatabaseNamesOperation,
  CreateDatabaseOperation,
} from "ravendb";
import { MessagesByUserStats } from "../../modules/chat/infrastructure/indexes/MessagesByUserStats";

export class RavenDbService {
  private static _store: IDocumentStore;

  @Inject(LOGGER_TOKEN)
  private readonly logger!: LoggerContract;

  @InjectConfig("database_url")
  private readonly dbUrl!: string;

  @InjectConfig("database_name")
  private readonly dbName!: string;

  private async ensureDatabaseExists(
    store: IDocumentStore,
    databaseName: string,
  ) {
    try {
      // Verificamos si la base de datos existe enviando una operación de mantenimiento al servidor

      // Obtenemos la lista de bases de datos disponibles en el servidor
      const dbNames = await store.maintenance.server.send(
        new GetDatabaseNamesOperation(0, 100),
      );

      // Verificamos si la base de datos que queremos usar ya existe
      // (simplmente verificando que se encuentre en el array)
      const exists = dbNames.includes(databaseName);

      this.logger.info(
        "[RavenDB] Verificando existencia de la base de datos:",
        {
          database: databaseName,

          exists,
          dbNames,
        },
      );

      if (exists) {
        this.logger.info(
          `[RavenDB] La base de datos '${databaseName}' ya existe.`,
        );
      } else {
        this.logger.info(
          `[RavenDB] La base de datos '${databaseName}' no existe. Creándola...`,
        );

        // Enviamos la operación para crear la base de datos al servidor

        await store.maintenance.server.send(
          new CreateDatabaseOperation({ databaseName }),
        );

        this.logger.info(
          `[RavenDB] Base de datos '${databaseName}' creada con éxito.`,
        );
      }
    } catch (error: any) {
      // Si el error es por falta de permisos, no detenemos la app
      if (
        error.name === "AuthorizationException" ||
        process.env.RAVEN_CERT_BASE64
      ) {
        this.logger.warn(
          `[RavenDB] Sin permisos para verificar/crear la BD automáticamente. Asumiendo que '${databaseName}' existe en el servidor Cloud.`,
        );
        return;
      }

      this.logger.error("[RavenDB] Error verificando la base de datos:", error);

      throw error;
    }
  }

  /**
   * @description Parchea globalThis.fetch para inyectar la configuración de mTLS nativo de Bun en 
   * las peticiones que van a RavenDB, esto es necesario para poder conectar con RavenDB Cloud 
   * usando certificados mTLS sin tener que usar librerías externas como https-proxy-agent que no son compatibles con Bun.
   * @param crtBase64 El certificado mTLS en formato base64, obtenido de RavenDB Cloud.
   * @param keyBase64 La clave privada del certificado mTLS en formato base64, obtenida de RavenDB Cloud.
   */
  private interceptRavenDbRequests(crtBase64: string, keyBase64: string) {
    this.logger.info(
      "[Bun-Fix] Parcheando globalThis.fetch para inyectar mTLS nativo...",
    );

    // Convertimos los certificados de base64 a buffers, que es el formato que espera la API de Bun para TLS
    const crtBuffer = Buffer.from(crtBase64, "base64");
    const keyBuffer = Buffer.from(keyBase64, "base64");

    // Guardamos el fetch original de Bun
    const originalFetch = globalThis.fetch;

    // Sobrescribimos el fetch global del servidor
    globalThis.fetch = async (
      url: RequestInfo | URL,
      options?: RequestInit,
    ) => {
      let targetUrl: string;

      if (typeof url === "string") {
        targetUrl = url;
      } else if (url instanceof URL) {
        targetUrl = url.toString();
      } else {
        targetUrl = url.url;
      }

      // Si la petición va a RavenDB, le inyectamos la seguridad de Bun
      if (targetUrl.includes("ravendb.cloud")) {
        options = options || {};
        // Usamos la API exclusiva de Bun (tls: { cert, key })
        (options as any).tls = {
          cert: crtBuffer,
          key: keyBuffer,
          rejectUnauthorized: true,
        };
      }

      // Dejamos que la petición continúe
      return originalFetch(url, options);
    };
  }

  public static get store(): IDocumentStore {
    if (!RavenDbService._store) {
      throw new Error(
        "RavenDB Store todavia no se ha inicializado, asegúrate de llamar a RavenDbService.initialize() antes de acceder a la propiedad store.",
      );
    }
    return RavenDbService._store;
  }

  public async initialize(): Promise<void> {
    if (RavenDbService._store) return;

    // Leemos las variables de entorno para el certificado mTLS (si existen)
    const crtBase64 = process.env.RAVEN_CERT_CRT_BASE64;
    const keyBase64 = process.env.RAVEN_CERT_KEY_BASE64;

    // Si tenemos las variables de entorno para el certificado
    if (crtBase64 && keyBase64) {
      this.interceptRavenDbRequests(crtBase64, keyBase64);
    }

    const store = new DocumentStore(this.dbUrl, this.dbName);

    // Configuramos la convención para determinar el nombre
    // de la colección a partir de la propiedad @collection
    // en los objetos literales
    store.conventions.findCollectionNameForObjectLiteral = (entity: any) =>
      entity["@collection"];

    store.initialize();

    await this.ensureDatabaseExists(store, this.dbName);
    await new MessagesByUserStats().execute(store);

    RavenDbService._store = store;

    this.logger.info(
      `RavenDB inicializado en ${this.dbUrl} con base de datos ${this.dbName}`,
    );
  }

  public async close(): Promise<void> {
    if (RavenDbService._store) {
      RavenDbService._store.dispose();
      RavenDbService._store = undefined as any;
      this.logger.info("Conexión a RavenDB cerrada correctamente.");
    }
  }
}
