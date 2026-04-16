import path from "node:path";
import { Module, TRANSACTION_MANAGER_TOKEN } from "@neunoro/fastify-kit";
import { DatabaseService } from "./infrastructure/database/DatabaseService";

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
    DatabaseService,
  ],
})
export class AppModule {}
