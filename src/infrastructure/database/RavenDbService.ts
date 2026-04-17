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

  @InjectConfig("DATABASE_URL")
  private readonly dbUrl: string = "http://localhost:8080";

  @InjectConfig("DATABASE_NAME")
  private readonly dbName: string = "RavenChat";

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

      if (!exists) {
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
      this.logger.error("[RavenDB] Error verificando la base de datos:", error);

      throw error;
    }
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
