import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';

import router from './app/routes';

const app: Application = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send({
    Message: "Collaborative Team Hub Server is running..."
  });
});

// global error handler placeholder
app.use((err: any, req: Request, res: Response, next: any) => {
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || 'Something went wrong!',
    errorDetails: err,
  });
});

// handle not found
app.use((req: Request, res: Response, next: any) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND!',
    errorDetails: {
      path: req.originalUrl,
      message: 'Your requested path is not found!'
    }
  });
});

export default app;
