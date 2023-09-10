import { AppService } from './app.service';
import { TokenPriceDTO } from './dtos/tokenPrice.dto';
import { RoundDTO } from './dtos/round.dt';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getTokenInfo(): Promise<TokenPriceDTO>;
    getTokenPrice(): Promise<number>;
    getCurrentRound(): RoundDTO;
    setRound(newRound: RoundDTO): Promise<any>;
    stopCurrentRound(): any;
}
