export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
}
