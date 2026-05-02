import { Server } from 'http';
import app from './app';
import { SocketHelper } from './app/helper/socketHelper';

const port = process.env.PORT || 5000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // Initialize Socket.io via helper
  SocketHelper.init(server);

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
