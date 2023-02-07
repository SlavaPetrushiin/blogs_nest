import { SortDirectionType } from 'src/types/types';

export class AllEntitiesBlog {
  searchNameTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirectionType;
}
