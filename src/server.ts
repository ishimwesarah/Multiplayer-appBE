// src/server.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/database';
import apiRouter from './routes/index';
import { initSocketService } from './services/socket.service';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger.config';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 8000;

app.use(cors()); 
app.use(express.json());

// Database Connection
connectDB();

// API Routes
app.use('/api', apiRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req: Request, res: Response) => {
  res.send('Multipleplayer Quiz Backend Server is running!');
});

// Setup for Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});

// Initialize Socket.IO service
initSocketService(io);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});