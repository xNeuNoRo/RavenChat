import { IDocumentSession } from "ravendb";

declare module "fastify" {
  interface FastifyRequest {
    dbSession: IDocumentSession;
  }
}
