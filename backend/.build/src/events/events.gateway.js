"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const socket_io_1 = require("socket.io");
const app_service_1 = require("../app.service");
let EventsGateway = exports.EventsGateway = class EventsGateway {
    constructor(appService) {
        this.appService = appService;
    }
    afterInit() {
        this.appService.onBettingStart().subscribe((data) => {
            this.server.emit('bettingStarted', data);
        });
        this.appService.onBettingEnd().subscribe((data) => {
            this.server.emit('bettingEnded', data);
        });
    }
    async findAll(data) {
        const tokenPrice = await this.appService.getTokenPrice();
        const round = this.appService.setCurrentResult(tokenPrice);
        const sharedInterval$ = (0, rxjs_1.interval)(2000).pipe((0, operators_1.map)((item) => ({ event: 'events', data: round })), (0, operators_1.share)());
        return sharedInterval$;
    }
    async identity(data) {
        const tokenPrice = await this.appService.getTokenPrice();
        const round = this.appService.setCurrentResult(tokenPrice);
        return { event: 'events', data: round };
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('events'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "findAll", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('identity'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "identity", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:3000',
        },
    }),
    __metadata("design:paramtypes", [app_service_1.AppService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map