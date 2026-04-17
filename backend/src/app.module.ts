import path from "node:path";
import { Module } from "@neunoro/fastify-kit";
import { RavenDbService } from "./infrastructure/database/RavenDbService";

@Module({
  // Autodescubrimiento de módulos. La Factory escaneará recursivamente el directorio base
  // y registrará automáticamente los módulos encontrados. Esto permite una arquitectura modular
  // y escalable sin necesidad de importar manualmente cada módulo en el módulo raíz.
  autoDiscoverModules: {
    baseDir: path.join(import.meta.dirname, "modules"),
  },
  // Forma tradicional:
  // imports: [BookModule, AnotherModule], --- IGNORE ---
  providers: [
    // Servicios globales de infraestructura
    RavenDbService,
  ],
})
export class AppModule {}
