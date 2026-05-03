import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import httpStatus from 'http-status';

import router from './app/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './app/docs/swagger';

const app: Application = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://web-production-12fe.up.railway.app'
      // Adding potential Vercel link too
    ];
    if (!origin || allowedOrigins.includes(origin) || origin.includes('railway.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send({
    Message: "Collaborative Team Hub Server is running..."
  });
});

// global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  try {
    require('fs').appendFileSync('error.log', new Date().toISOString() + ' - ' + JSON.stringify({ name: err.name, message: err.message, stack: err.stack, issues: err.issues }) + '\n');
  } catch (e) { }

  let statusCode = err.status || httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong!';
  let errorDetails = err;

  // Handle Zod validation errors
  if (err.name === 'ZodError' || (err.issues && Array.isArray(err.issues))) {
    statusCode = httpStatus.BAD_REQUEST;
    message = err.issues.map((issue: any) => `${issue.path[issue.path.length - 1]}: ${issue.message}`).join('. ');
  } else if (err.name === 'PrismaClientKnownRequestError' || err.message?.includes('prisma')) {
    // Handle Prisma errors
    statusCode = httpStatus.BAD_REQUEST;
    message = `Database Error: ${err.message || 'Operation failed'}`;

    if (err.code === 'P2002') {
      message = 'A record with this information already exists (Duplicate Entry).';
    } else if (err.code === 'P2021') {
      message = 'Database tables are missing. Please run prisma db push.';
    } else {
      message = `Database Error (${err.code || 'Unknown'}): ${err.message}`;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages: [{
      path: '',
      message: message
    }],
    // stack: config.env !== 'production' ? err?.stack : undefined,
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
