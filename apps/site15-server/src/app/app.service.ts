import { Injectable } from '@nestjs/common';
import { Message } from '@site15/common';

@Injectable()
export class AppService {
  getData(): Message {
    return { message: 'Welcome to api!' };
  }
}
