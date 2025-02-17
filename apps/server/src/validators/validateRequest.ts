import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "../middleware/errors/types.js";

type ValidateRequestOptions = {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
};

export const validateRequest = (schemas: ValidateRequestOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError("Validation failed", {
            errors: error.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          })
        );
      } else {
        next(error);
      }
    }
  };
};
