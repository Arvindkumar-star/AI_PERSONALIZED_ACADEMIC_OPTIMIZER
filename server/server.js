import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import env from './config/env.js';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

export default app;
