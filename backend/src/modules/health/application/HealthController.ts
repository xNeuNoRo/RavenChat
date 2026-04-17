import {
  Controller,
  Get,
  Inject,
  HealthCheckService,
  MemoryHealthIndicator,
  Version,
  EventLoopHealthIndicator,
  Timeout,
} from "@neunoro/fastify-kit";
import { RavenDbHealthIndicator } from "@/infrastructure/database/RavenDbHealthIndicator";

@Controller("health")
@Version("1")
export class HealthController {
  @Inject(HealthCheckService)
  private readonly health!: HealthCheckService;

  @Inject(MemoryHealthIndicator)
  private readonly memory!: MemoryHealthIndicator;

  @Inject(EventLoopHealthIndicator)
  private readonly eventLoop!: EventLoopHealthIndicator;

  @Inject(RavenDbHealthIndicator)
  private readonly ravenDb!: RavenDbHealthIndicator;

  @Get("/")
  @Timeout(5000) // timeout de 5 segundos para el health check
  public async check() {
    return this.health.check([
      // Verificamos que la BD principal esté viva
      () => this.ravenDb.isHealthy("database"),

      // Monitoreo de RAM. (ESto es critico para Render)
      // La capa gratuita de Render tiene 512MB de RAM. Si Fastify + WebSockets
      // empieza a consumir de más, el healthcheck fallará antes de que Render mate el proceso.
      () => this.memory.checkHeap("memory_heap", 200 * 1024 * 1024), // 200MB límite de Heap
      () => this.memory.checkRSS("memory_rss", 300 * 1024 * 1024), // 300MB límite total de proceso
      () => this.eventLoop.check("event_loop", 1000), // 1000ms límite de tiempo de espera del bucle de eventos
    ]);
  }
}
