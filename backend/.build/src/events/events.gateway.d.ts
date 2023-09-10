import { WsResponse } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { Server } from 'socket.io';
import { AppService } from '../app.service';
export declare class EventsGateway {
    private readonly appService;
    constructor(appService: AppService);
    server: Server;
    afterInit(): void;
    findAll(data: any): Promise<Observable<WsResponse<any>>>;
    identity(data: any): Promise<any>;
}
