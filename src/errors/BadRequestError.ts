import { StatusCodes } from "http-status-codes";

export class BadRequestError extends Error {
  statusCode: StatusCodes;
  message: string;

  constructor(message: string) {
    super(message);  
    this.message = message;
    this.name = 'BadRequestError';  
    this.statusCode = StatusCodes.BAD_REQUEST;  
    Object.setPrototypeOf(this, new.target.prototype);
  }
}