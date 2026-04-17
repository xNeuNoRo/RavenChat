import {
  Injectable,
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckResult,
  HealthCheckError,
} from "@neunoro/fastify-kit";
import { RavenDbService } from "./RavenDbService";

@Injectable()
export class RavenDbHealthIndicator extends HealthIndicator {
  public async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const store = RavenDbService.store;
      const session = store.openSession();
      
      const start = performance.now();

      // Hacemos una carga ligera. No importa que el documento "system/health-ping" 
      // no exista, lo importante es que el motor nos devuelva un HTTP 200 (null) sin fallar.
      await session.load("system/health-ping");
      
      const latencyMs = Math.round(performance.now() - start);
      
      session.dispose();

      return this.getStatus(key, true, { 
        status: "up",
        latency: `${latencyMs}ms`,
        database: store.database,
        node: store.urls[0]
      });
    } catch (error: any) {
      // Si la BD se cae o el certificado falla, lanzamos el error de Terminus
      const indicatorError = this.getStatus(key, false, { message: error.message });
      const healthCheckResult: HealthCheckResult = {
        status: "error",
        info: {},
        error: indicatorError,
        details: indicatorError,
      };

      throw new HealthCheckError("RavenDB Health Check failed", healthCheckResult);
    }
  }
}