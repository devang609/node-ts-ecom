import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../errors';

type ValidationTarget = 'body' | 'params' | 'query';

// Factory — returns a middleware configured for a specific schema + target.
// Every route that needs validation uses this; no duplicated Joi logic in controllers.
export function validate(
  schema: Joi.ObjectSchema,
  target: ValidationTarget = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,   // return all validation errors, not just the first
      stripUnknown: true,  // drop fields not in schema — prevents payload pollution
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      next(new BadRequestError(message));
      return;
    }

    // Overwrite with the validated + stripped value so controllers
    // always receive clean, type-safe data
    req[target] = value;
    next();
  };
}