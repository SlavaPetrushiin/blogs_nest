import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SortDirectionType } from './../../types/types';
import { Type } from 'class-transformer';

export class AllEntitiesUser {
  @IsOptional()
  @Type(() => String)
  @IsString()
  searchLoginTerm?: string = '';

  @IsOptional()
  @Type(() => String)
  @IsString()
  searchEmailTerm?: string = '';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 10;

  @IsOptional()
  @Type(() => String)
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @Type(() => String)
  @IsEnum(SortDirectionType)
  sortDirection?: string = SortDirectionType.desc;
}
