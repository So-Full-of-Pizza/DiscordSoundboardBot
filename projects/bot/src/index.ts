import Bot from './bot/bot';
import WebServer from './web/web-server';
import logger from './logger';
import Environment, { WebServerEnvironment } from './environment';

function isEnvironmentVariableValid<T>(value: T | undefined, name: string): value is T {
  const isValid = !!value;

  if (!isValid) logger.error(`No ${ name } provided`);

  return isValid;
}

process.env.TZ = 'Europe/Copenhagen';

if (
  isEnvironmentVariableValid(process.env.BOT_TOKEN, 'BOT_TOKEN')
  && isEnvironmentVariableValid(process.env.HOME_GUILD_ID, 'HOME_GUILD_ID')
  && isEnvironmentVariableValid(process.env.SOUNDS_CONNECTION_STRING, 'SOUNDS_CONNECTION_STRING')
  && isEnvironmentVariableValid(process.env.SOUNDS_BASE_URL, 'SOUNDS_BASE_URL')
  && isEnvironmentVariableValid(process.env.BLOB_STORAGE_CONNECTION_STRING, 'BLOB_STORAGE_CONNECTION_STRING')
  && isEnvironmentVariableValid(process.env.CLIENT_ID, 'CLIENT_ID')
  && isEnvironmentVariableValid(process.env.CLIENT_SECRET, 'CLIENT_SECRET')
  && isEnvironmentVariableValid(process.env.APP_URL, 'APP_URL')
  && (process.env.NODE_ENV === 'production' || isEnvironmentVariableValid(process.env.DEV_FRONTEND_SOUNDS_BASE_URL, 'DEV_FRONTEND_SOUNDS_BASE_URL'))
  && isEnvironmentVariableValid(process.env.PORT, 'PORT')
) {
  const environment: Environment = {
    environment: process.env.NODE_ENV || 'development',
    botToken: process.env.BOT_TOKEN,
    homeGuildId: process.env.HOME_GUILD_ID,
    dbConnectionString: process.env.SOUNDS_CONNECTION_STRING,
    soundsBaseUrl: process.env.SOUNDS_BASE_URL,
    blobStorageConnectionString: process.env.BLOB_STORAGE_CONNECTION_STRING,
  };

  const webServerEnvironment: WebServerEnvironment = {
    environment: environment.environment,
    dbConnectionString: environment.dbConnectionString,
    blobStorageConnectionString: environment.blobStorageConnectionString,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    appURL: process.env.APP_URL,
    soundsBaseUrl: process.env.DEV_FRONTEND_SOUNDS_BASE_URL || process.env.SOUNDS_BASE_URL,
    port: process.env.PORT,
  };

  logger.info('Starting in %s environment', environment.environment);

  const bot = new Bot(environment);
  bot.start()
    .then(() => logger.info('Bot started'))
    .catch(logger.error);

  new WebServer(webServerEnvironment, bot)
    .start();
} else {
  process.exitCode = 1;
}
