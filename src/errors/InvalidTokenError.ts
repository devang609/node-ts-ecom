import { StatusCodes } from "http-status-codes";

export class InvalidTokenError extends Error {
  statusCode: StatusCodes;
  message: string;

  constructor(message: string) {
    super(message);  
    this.message = message;
    this.name = 'InvalidTokenError';  
    this.statusCode = StatusCodes.UNAUTHORIZED;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
