export type ApiResponse<T = any> =
  | {
      error: false;
      message: string;
      data?: T;
    }
  | {
      error: true;
      message: string;
      code: number;
    };
