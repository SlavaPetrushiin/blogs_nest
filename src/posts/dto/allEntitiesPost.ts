import { SortDirectionType } from 'src/types/types';

export class AllEntitiesPost {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirectionType;
}
