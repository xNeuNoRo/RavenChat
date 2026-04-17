import { Module } from "@neunoro/fastify-kit";
import { HealthController } from "./application/HealthController";
import { RavenDbHealthIndicator } from "@/infrastructure/database/RavenDbHealthIndicator";

@Module({
  controllers: [HealthController],
  providers: [RavenDbHealthIndicator],
})
export class HealthModule {}
