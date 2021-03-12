import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Message } from '@site15/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private prisma = new PrismaClient();
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getData(): Message {
    return this.appService.getData();
  }

  @Get('db')
  getDbData() {
    return this.prisma.projectType.findMany({
      select: { id: true, name: true },
    });
  }
}
