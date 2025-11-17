export interface ResponseStatus {
    code: number;
    message: string | null;
    errorCode: string | null;
  }
  
  export interface Response<T> {
    status: ResponseStatus;
    data: T;
  }
  