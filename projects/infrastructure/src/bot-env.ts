import { Config } from '@pulumi/pulumi';

const getBotEnv = (config: Config) => {
  const blobStorageConnectionString = config.getSecret('blobStorageConnectionString');
  const botToken = config.getSecret('botToken');
  const clientId = config.getSecret('clientId');
  const clientSecret = config.getSecret('clientSecret');
  const homeGuildId = config.getSecret('homeGuildId');
  const soundsBaseUrl = config.get('soundsBaseUrl');
  const soundsConnectionString = config.getSecret('soundsConnectionString');

  return [
    {
      name: 'BLOB_STORAGE_CONNECTION_STRING',
      value: blobStorageConnectionString,
    },
    {
      name: 'BOT_TOKEN',
      value: botToken,
    },
    {
      name: 'CLIENT_ID',
      value: clientId,
    },
    {
      name: 'CLIENT_SECRET',
      value: clientSecret,
    },
    {
      name: 'HOME_GUILD_ID',
      value: homeGuildId,
    },
    {
      name: 'SOUNDS_BASE_URL',
      value: soundsBaseUrl,
    },
    {
      name: 'SOUNDS_CONNECTION_STRING',
      value: soundsConnectionString,
    },
    {
      name: 'PORT',
      value: '80',
    },
  ];
};

export default getBotEnv;
