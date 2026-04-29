export class UserNotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);  // Call the parent class constructor (Error)
    this.name = 'UserNotFoundError';  // Set the name of the error
    this.statusCode = 404;  // HTTP status code for not found
    Object.setPrototypeOf(this, new.target.prototype);  // Fix the prototype chain
  }
}