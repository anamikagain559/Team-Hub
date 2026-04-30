import { Server } from 'http';
import app from './app';
import { Server as SocketIOServer } from 'socket.io';

const port = process.env.PORT || 5000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.info('Server closed');
      });
    }
    process.exit(1);
  };

  process.on('uncaughtException', exitHandler);
  process.on('unhandledRejection', exitHandler);
}

main();
