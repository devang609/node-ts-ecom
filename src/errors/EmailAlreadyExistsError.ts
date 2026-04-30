import { StatusCodes } from "http-status-codes";

export class EmailAlreadyExistsError extends Error {
  statusCode: StatusCodes;
  message: string;

  constructor(message: string) {
    super(message);  
    this.message = message;
    this.name = 'EmailAlreadyExistsError';  
    this.statusCode = StatusCodes.CONFLICT;  
    Object.setPrototypeOf(this, new.target.prototype);
  }
}