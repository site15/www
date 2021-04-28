import { Controller, Get } from '@nestjs/common';
import { Message } from '@site15/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService
  ) {}

  @Get('hello')
  getData(): Message {
    return this.appService.getData();
  }

  @Get('db')
  getDbData() {
    return this.prismaService.projectType.findMany({
      select: { id: true, name: true },
    });
  }
}
