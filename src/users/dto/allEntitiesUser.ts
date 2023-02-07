import { SortDirectionType } from 'src/types/types';

export class AllEntitiesUser {
  searchLoginTerm: string;
  searchEmailTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirectionType;
}
