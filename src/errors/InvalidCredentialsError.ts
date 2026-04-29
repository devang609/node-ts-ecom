export class InvalidCredentialsError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);  // Call the parent class constructor (Error)
    this.name = 'InvalidCredentialsError';  // Set the name of the error
    this.statusCode = 401;  // HTTP status code for unauthorized (invalid credentials)
    Object.setPrototypeOf(this, new.target.prototype);  // Fix the prototype chain
  }
}