export type ApiResponse<T = any> =
  | {
      error: false;
      message?: string;
      data: T;
    }
  | {
      error: true;
      message: string;
      code: number;
    };

export abstract class ApiRes {
  private constructor() {}

  static success<T>(params: { data: T; message?: string }): ApiResponse<T> {
    return {
      error: false,
      ...params,
    };
  }

  static error(params: { message: string; code: number }): ApiResponse<any> {
    return {
      error: true,
      ...params,
    };
  }
}
