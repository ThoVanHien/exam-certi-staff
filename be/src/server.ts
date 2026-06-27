import "reflect-metadata";
import { createServer } from "http";
import { app } from "./app";
import { AppDataSource } from "./config/data-source";
import { env } from "./config/env";

const bootstrap = async (): Promise<void> => {
  await AppDataSource.initialize();

  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`${env.APP_NAME} is running on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap application:", error);
  process.exit(1);
});
