import {ApiResponse} from "@nestjs/swagger";

export class TokenPriceDTO {
  id?: number;
  name?: string;
  symbol?: string;
  price?: number;
}
