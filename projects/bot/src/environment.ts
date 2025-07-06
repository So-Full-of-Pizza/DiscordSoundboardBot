export default interface Environment {
  blobStorageConnectionString: string;
  botToken: string;
  dbConnectionString: string;
  environment: string;
  homeGuildId: string;
  soundsBaseUrl: string;
}

export interface WebServerEnvironment {
  appURL: string;
  blobStorageConnectionString: string;
  clientID: string;
  clientSecret: string;
  dbConnectionString: string
  environment: string;
  soundsBaseUrl: string;
  port: string | number;
}
