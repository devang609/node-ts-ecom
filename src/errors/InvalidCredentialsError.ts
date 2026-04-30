import { StatusCodes } from "http-status-codes";

export class InvalidCredentialsError extends Error {
  statusCode: StatusCodes;
  message: string;

  constructor(message: string) {
    super(message); 
    this.message = message;
    this.name = 'InvalidCredentialsError';  
    this.statusCode = StatusCodes.UNAUTHORIZED;  
    Object.setPrototypeOf(this, new.target.prototype);  
  }
}