import { Configuration } from '@/src/configuration/Configuration';

export interface ConfigurationLoader {
  getConfiguration(): Configuration;
}
