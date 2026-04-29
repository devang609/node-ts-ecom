export class EmailAlreadyExistsError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);  // Call the parent class constructor (Error)
    this.name = 'EmailAlreadyExistsError';  // Set the name of the error
    this.statusCode = 409;  // HTTP status code for conflict (email already exists)
    Object.setPrototypeOf(this, new.target.prototype);  // Fix the prototype chain
  }
}