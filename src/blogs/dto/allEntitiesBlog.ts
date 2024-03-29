import { SortDirectionType } from './../../types/types';

export class AllEntitiesBlog {
  searchNameTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirectionType;
}

export class AllEntitiesBanBlog {
  searchLoginTerm: string;
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: SortDirectionType;
}
