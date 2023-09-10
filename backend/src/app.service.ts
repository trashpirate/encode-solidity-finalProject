import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TokenPriceDTO } from './dtos/tokenPrice.dto';
import { RoundDTO } from './dtos/round.dt';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import 'dotenv/config';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class AppService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  private currentRound = new RoundDTO();

  private bettingStartSubject = new Subject<boolean>();
  private bettingEndSubject = new Subject<boolean>();
  private roundEndSubject = new Subject<boolean>();

  test(): string {
    return 'API running';
  }

  triggerBettingStart(data: boolean) {
    this.bettingStartSubject.next(data);
  }

  triggerBettingEnd(data: boolean) {
    this.bettingEndSubject.next(data);
  }
  
  triggerRoundEnd(data: boolean) {
    this.roundEndSubject.next(data);
  }

  onBettingStart(): Observable<boolean> {
    return this.bettingStartSubject.asObservable();
  }

  onBettingEnd(): Observable<boolean> {
    return this.bettingEndSubject.asObservable();
  }

  onRoundEnd(): Observable<boolean> {
    return this.roundEndSubject.asObservable();
  }
  
  async setRound(round: RoundDTO): Promise<any> {
    try {
      const assert = require('assert');
      assert(round.close < round.end, "Round must close before round end.");
      round.start = new Date(Date.now());
      
      const tokenPrice = await this.getTokenPrice();
      if (round.initialPrice == 0){
          round.initialPrice = tokenPrice;
      }
      
      round.currentPrice = tokenPrice;
       

      this.deleteCurrentCronJobs();
      if (round.start < round.close){
        round.open = true;
        this.registerCloseTime(round.close);
        this.triggerBettingStart(round.status);
      }
      else{
        round.open = false;
      }

      if (round.start < round.end){
        round.status = true;
        this.registerEndTime(round.end);
      }
      else{
        round.status = false;
      }

      this.currentRound = round;
        
      return tokenPrice == null
        ? { success: false }
        : { success: true, round: this.currentRound };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  deleteCurrentCronJobs(){

    const jobs = this.schedulerRegistry.getCronJobs();
    if (jobs.size > 0) {
      jobs.forEach((value, key, map) => {
        this.schedulerRegistry.deleteCronJob(key);
      });
    }
    
  }

  registerEndTime(stopTime: Date) {
    let jobEnd: CronJob = new CronJob(stopTime, () => {
      this.currentRound.status = false;
      this.currentRound.endPrice = this.currentRound.currentPrice;
      this.currentRound.interval = 86400000;
      this.triggerRoundEnd(true);
      console.log('Ended current round!');
    });
    this.schedulerRegistry.addCronJob('endRound', jobEnd);
    jobEnd.start();   

  }

  registerCloseTime(closeTime: Date) {
    let jobEnd: CronJob = new CronJob(closeTime, () => {
      this.currentRound.open = false;
      this.triggerBettingEnd(true);
      console.log('Closed current round!');
    });
    this.schedulerRegistry.addCronJob('closeRound', jobEnd);
    jobEnd.start();   
  }

  getCurrentRound(): RoundDTO {
    return this.currentRound;
  }

  stopCurrentRound() {
    this.currentRound.status = false;
    this.currentRound.open = false;
    this.currentRound.interval = 86400000;
    this.triggerRoundEnd(true);
    this.triggerBettingEnd(true);
    try {
      this.deleteCurrentCronJobs();
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  getRoundStatus() {
    console.log(this.currentRound.status);
    return this.currentRound.status;
  }

  async getCurrentResult() {
    const tokenPrice: number = await this.getTokenPrice();
    this.currentRound.currentPrice = tokenPrice;
    if (this.currentRound.status) {
      return {
        currentPrice: tokenPrice,
        initialPrice: this.currentRound.initialPrice,
      };
    }
    return { currentPrice: tokenPrice, initialPrice: null };
  }

  setCurrentResult(tokenPrice: number): RoundDTO {
    this.currentRound.currentPrice = tokenPrice;
    return this.currentRound;
  }

  setEndResult(tokenPrice: number): RoundDTO {
    this.currentRound.endPrice = tokenPrice;
    return this.currentRound;
  }

  async getTokenInfo(): Promise<TokenPriceDTO> {
    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY, // Replace with your CoinMarketCap API key
            ['Content-Type']: 'application/json',
          },
          params: {
            id: 26073, // Change to the token symbol you want
          },
        },
      );

      // success
      const json = response.data.data['26073'];
      const id = json.id;
      const name = json.name;
      const symbol = json.symbol;
      const price = json.quote.USD.price;

      const tokenPrice: TokenPriceDTO = { id, name, symbol, price };
      return tokenPrice;
    } catch (ex) {
      // error
      console.log(ex);
      return null;
    }
  }

  async getTokenPrice(): Promise<number> {
    try {
      const response = await axios.get(
        'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest',
        {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY, // Replace with your CoinMarketCap API key
            ['Content-Type']: 'application/json',
          },
          params: {
            id: 26073, // Change to the token symbol you want
          },
        },
      );

      // success
      const json = response.data.data['26073'];
      const price = json.quote.USD.price;

      return price;
    } catch (ex) {
      // error
      console.log(ex);
      return null;
    }
  }
}
