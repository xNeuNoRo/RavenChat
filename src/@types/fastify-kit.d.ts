import { IDocumentSession } from "ravendb";

// Apuntamos al nombre exacto de tu librería
declare module "@neunoro/fastify-kit" {
  // TypeScript fusionará (merge) esta interfaz con la original del framework
  export interface AlsStore {
    dbSession: IDocumentSession;
  }
  export interface RequestContext {
    dbSession: IDocumentSession;
  }
}
