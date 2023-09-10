import 'dotenv/config';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { interval, Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { Server } from 'socket.io';
import { AppService } from '../app.service';

@WebSocketGateway({
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'https://play.petlfg.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class EventsGateway {
  constructor(private readonly appService: AppService) {}
  @WebSocketServer()
  server: Server;

  afterInit() {
    // Listen for the custom event emitted from AppService
    this.appService.onBettingStart().subscribe((data) => {
      // Emit a WebSocket event to clients
      this.server.emit('bettingStarted', data);
    });

    this.appService.onBettingEnd().subscribe((data) => {
      // Emit a WebSocket event to clients
      this.server.emit('bettingEnded', data);
    });
    
    this.appService.onRoundEnd().subscribe((data) => {
      // Emit a WebSocket event to clients
      this.server.emit('roundEnded', data);
    });
  }

  @SubscribeMessage('events')
  async findAll(
    @MessageBody() data: any,
  ): Promise<Observable<WsResponse<any>>> {
    const tokenPrice = await this.appService.getTokenPrice();
    const round = this.appService.setCurrentResult(tokenPrice);
    const sharedInterval$ = interval(round.interval).pipe(
      map((item) => ({ event: 'events', data: round })),
      share(),
    );
    return sharedInterval$;
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: any): Promise<any> {
    const tokenPrice = await this.appService.getTokenPrice();
    const round = this.appService.setCurrentResult(tokenPrice);
    return { event: 'events', data: round };
  }
}
