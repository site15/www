import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(PrismaService.name);

  constructor() {
    super({
      rejectOnNotFound: true,
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
      ],
    });
  }
  async onModuleInit(): Promise<void> {
    (this as any).$on('query', (e) => {
      if (e.query !== 'SELECT 1') {
        this.logger.debug(
          `query: ${e.query}, params: ${e.params}, duration: ${e.duration}`
        );
      }
    });
    (this as any).$on('error', (e) => {
      this.logger.error(`target: ${e.target}, message: ${e.message}`);
    });
    await this.$connect();
    setInterval(
      () => this.$queryRaw('SELECT 1').catch((err) => this.logger.error(err)),
      60000
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
