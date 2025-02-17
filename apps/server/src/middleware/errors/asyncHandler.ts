import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next))
      .then((result) => {
        if (result !== undefined && !res.headersSent) {
          res.json(result);
        }
      })
      .catch((error) => {
        if (!res.headersSent) {
          next(error);
        }
      });
  };
