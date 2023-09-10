import { TokenPriceDTO } from './dtos/tokenPrice.dto';
import { RoundDTO } from './dtos/round.dt';
import { SchedulerRegistry } from '@nestjs/schedule';
import 'dotenv/config';
import { Observable } from 'rxjs';
export declare class AppService {
    private schedulerRegistry;
    constructor(schedulerRegistry: SchedulerRegistry);
    private currentRound;
    private bettingStartSubject;
    private bettingEndSubject;
    triggerBettingStart(data: boolean): void;
    triggerBettingEnd(data: boolean): void;
    onBettingStart(): Observable<boolean>;
    onBettingEnd(): Observable<boolean>;
    setRound(round: RoundDTO): Promise<any>;
    registerEndTime(stopTime: Date): void;
    getCurrentRound(): RoundDTO;
    stopCurrentRound(): {
        success: boolean;
        job: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        job?: undefined;
    };
    getRoundStatus(): boolean;
    getCurrentResult(): Promise<{
        currentPrice: number;
        initialPrice: number;
    }>;
    setCurrentResult(tokenPrice: number): RoundDTO;
    getTokenInfo(): Promise<TokenPriceDTO>;
    getTokenPrice(): Promise<number>;
}
