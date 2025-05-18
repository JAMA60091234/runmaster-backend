declare module 'express-async-handler' {
  import { Request, Response, NextFunction } from 'express';

  type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<any>;

  function expressAsyncHandler(handler: AsyncRequestHandler): (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void;

  export = expressAsyncHandler;
} 