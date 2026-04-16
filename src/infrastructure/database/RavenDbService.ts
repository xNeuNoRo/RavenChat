import { InjectConfig } from "@neunoro/fastify-kit";
import DocumentStore, { IDocumentStore } from "ravendb";

export class RavenDbService {
  private static _store: IDocumentStore;

  @InjectConfig("DATABASE_URL")
  private readonly dbUrl!: string;

  @InjectConfig("DATABASE_NAME")
  private readonly dbName!: string;

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
    RavenDbService._store = store;

    console.log(
      `RavenDB inicializado en ${this.dbUrl} con base de datos ${this.dbName}`,
    );
  }

  public async close(): Promise<void> {
    if (RavenDbService._store) {
      RavenDbService._store.dispose();
      RavenDbService._store = undefined as any;
      console.log("Conexión a RavenDB cerrada correctamente.");
    }
  }
}
