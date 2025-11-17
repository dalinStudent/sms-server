import { Type } from "class-transformer";
import { IsInt, Min, IsOptional, IsString } from "class-validator";

export class GetPaginationDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  size!: number;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  searchBy?: string;
}
