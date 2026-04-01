export interface ApiError {
  error: {
    code: string;
    message: string;
    status: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminStatsResponse {
  totalQuotes: number;
  quotesThisWeek: number;
  acceptedQuotes: number;
  pendingQuotes: number;
}
