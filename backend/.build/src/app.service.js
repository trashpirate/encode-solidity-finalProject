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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const round_dt_1 = require("./dtos/round.dt");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
require("dotenv/config");
const rxjs_1 = require("rxjs");
let AppService = exports.AppService = class AppService {
    constructor(schedulerRegistry) {
        this.schedulerRegistry = schedulerRegistry;
        this.currentRound = new round_dt_1.RoundDTO();
        this.bettingStartSubject = new rxjs_1.Subject();
        this.bettingEndSubject = new rxjs_1.Subject();
    }
    triggerBettingStart(data) {
        this.bettingStartSubject.next(data);
    }
    triggerBettingEnd(data) {
        this.bettingEndSubject.next(data);
    }
    onBettingStart() {
        return this.bettingStartSubject.asObservable();
    }
    onBettingEnd() {
        return this.bettingEndSubject.asObservable();
    }
    async setRound(round) {
        try {
            const tokenPrice = await this.getTokenPrice();
            round.initialPrice = tokenPrice;
            round.currentPrice = tokenPrice;
            round.start = new Date(Date.now());
            round.status = true;
            this.currentRound = round;
            this.registerEndTime(round.end);
            this.triggerBettingStart(round.status);
            return tokenPrice == null
                ? { success: false }
                : { success: true, round: this.currentRound };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    registerEndTime(stopTime) {
        let jobEnd = new cron_1.CronJob(stopTime, () => {
            this.currentRound.status = false;
            console.log('Ended current round!');
        });
        const jobs = this.schedulerRegistry.getCronJobs();
        if (jobs.size > 0) {
            this.schedulerRegistry.deleteCronJob('endRound');
        }
        this.schedulerRegistry.addCronJob('endRound', jobEnd);
        jobEnd.start();
    }
    getCurrentRound() {
        return this.currentRound;
    }
    stopCurrentRound() {
        this.currentRound.status = false;
        this.currentRound.initialPrice = null;
        this.triggerBettingEnd(true);
        try {
            const job = this.schedulerRegistry.getCronJob('endRound');
            job.stop();
            return { success: true, job: job.running };
        }
        catch (e) {
            return { success: false, error: e.message };
        }
    }
    getRoundStatus() {
        console.log(this.currentRound.status);
        return this.currentRound.status;
    }
    async getCurrentResult() {
        const tokenPrice = await this.getTokenPrice();
        this.currentRound.currentPrice = tokenPrice;
        if (this.currentRound.status) {
            return {
                currentPrice: tokenPrice,
                initialPrice: this.currentRound.initialPrice,
            };
        }
        return { currentPrice: tokenPrice, initialPrice: null };
    }
    setCurrentResult(tokenPrice) {
        this.currentRound.currentPrice = tokenPrice;
        return this.currentRound;
    }
    async getTokenInfo() {
        try {
            const response = await axios_1.default.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest', {
                headers: {
                    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY,
                    ['Content-Type']: 'application/json',
                },
                params: {
                    id: 26073,
                },
            });
            const json = response.data.data['26073'];
            const id = json.id;
            const name = json.name;
            const symbol = json.symbol;
            const price = json.quote.USD.price;
            const tokenPrice = { id, name, symbol, price };
            return tokenPrice;
        }
        catch (ex) {
            console.log(ex);
            return null;
        }
    }
    async getTokenPrice() {
        try {
            const response = await axios_1.default.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest', {
                headers: {
                    'X-CMC_PRO_API_KEY': 'c72fc6fd-dae6-4a41-8cfa-c0d9068b158b',
                    ['Content-Type']: 'application/json',
                },
                params: {
                    id: 26073,
                },
            });
            const json = response.data.data['26073'];
            const price = json.quote.USD.price;
            return price;
        }
        catch (ex) {
            console.log(ex);
            return null;
        }
    }
};
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [schedule_1.SchedulerRegistry])
], AppService);
//# sourceMappingURL=app.service.js.map