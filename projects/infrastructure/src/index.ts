import { Image } from '@pulumi/docker-build';
import { Config, interpolate } from '@pulumi/pulumi';
import { app, operationalinsights, resources } from '@pulumi/azure-native';
import getBotEnv from './bot-env';

const appName = 'botman-ac';

const resourceGroup = new resources.ResourceGroup(appName);

const workspace = new operationalinsights.Workspace('loganalytics', {
  resourceGroupName: resourceGroup.name,
  sku: { name: 'PerGB2018' },
  retentionInDays: 30,
});

const workspaceSharedKeys = operationalinsights.getSharedKeysOutput({
  resourceGroupName: resourceGroup.name,
  workspaceName: workspace.name,
});

const managedEnv = new app.ManagedEnvironment('env', {
  resourceGroupName: resourceGroup.name,
  appLogsConfiguration: {
    destination: 'log-analytics',
    logAnalyticsConfiguration: {
      customerId: workspace.customerId,
      sharedKey: workspaceSharedKeys.apply((r: operationalinsights.GetSharedKeysResult) => r.primarySharedKey!),
    },
  },
});

const domainName = 'soundboard.sofullofpizza.com';
const appUrl = `https://${ domainName }`;

const config = new Config();

const registryLoginServer = 'docker.io';
const registryUsername = config.get('dockerHubUsername');
const registryPassword = config.get('dockerHubPassword');

const image = new Image(appName, {
  tags: [interpolate`${ registryUsername }/${ appName }:latest`],
  dockerfile: { location: '../bot/Dockerfile' },
  context: { location: '../..' },
  platforms: ['linux/amd64'],
  push: true,
  registries: [{
    address: registryLoginServer,
    username: registryUsername,
    password: registryPassword,
  }],
});

// eslint-disable-next-line no-new
new app.ContainerApp(appName, {
  resourceGroupName: resourceGroup.name,
  managedEnvironmentId: managedEnv.id,
  configuration: {
    ingress: {
      external: true,
      targetPort: 80,
      customDomains: [{
        name: domainName,
        certificateId: app.getManagedCertificateOutput({
          resourceGroupName: resourceGroup.name,
          environmentName: managedEnv.name,
          managedCertificateName: 'soundboard.sofullofpizza.com-env98656-250710220841',
        }).apply(x => x.id),
      }],
    },
    registries: [{
      server: registryLoginServer,
      username: registryUsername,
      passwordSecretRef: 'pwd',
    }],
    secrets: [{
      name: 'pwd',
      value: registryPassword,
    }],
  },
  template: {
    containers: [{
      name: appName,
      image: image.ref,
      env: [
        ...getBotEnv(config),
        {
          name: 'APP_URL',
          value: appUrl,
        },
      ],
    }],
  },
});

// eslint-disable-next-line import/prefer-default-export
export const url = appUrl;
