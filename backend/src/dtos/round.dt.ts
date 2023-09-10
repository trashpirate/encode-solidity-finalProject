import {ApiProperty} from "@nestjs/swagger";
import { IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class RoundDTO {
    @ApiProperty({default: null, required: true})
    id: number | null = null;
    
    start: Date | null = null;
    
    @ApiProperty({type: Date, default: "YYYY-MM-DDTHH:mm:ss.sssZ", required: true})
    @Type(() => Date)
    @IsDate()
    end: Date | null = null;
    
    @ApiProperty({type: Date, default: "YYYY-MM-DDTHH:mm:ss.sssZ", required: true})
    @Type(() => Date)
    @IsDate()
    close: Date | null = null;
    
    @ApiProperty({default: "0", required: false})
    initialPrice: number | null = null;
    
    currentPrice: number | null = null;

    @ApiProperty({default: null, required: false})
    endPrice: number | null = null;
    
    status: boolean = false;
    open: boolean | null = true;

    @ApiProperty({default: 600000, required: false})
    interval: number = 600000;
}