import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ScheduleModule} from '@nestjs/schedule';
import {EventsGateway} from './events/events.gateway';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
