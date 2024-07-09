import { NextResponse } from "next/server";

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

export type NextApiResponse<T = any> = NextResponse<ApiResponse<T>>;

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

export abstract class NextApiRes {
  private constructor() {}

  static success<T>(params: {
    data: T;
    message?: string;
    status?: number;
    headers?: HeadersInit;
  }): NextApiResponse<T> {
    return NextResponse.json(
      ApiRes.success({
        message: params.message,
        data: params.data,
      }),
      {
        status: params.status,
        headers: params.headers,
      }
    );
  }

  static error(params: {
    message: string;
    code: number;
    status?: number;
    headers?: HeadersInit;
  }): NextApiResponse<any> {
    return NextResponse.json(
      ApiRes.error({
        message: params.message,
        code: params.code,
      }),
      {
        status: params.status,
        headers: params.headers,
      }
    );
  }
}
