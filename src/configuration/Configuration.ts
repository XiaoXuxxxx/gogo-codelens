export type CodeLensDisplayRules = {
  shouldShow: boolean;
  singularTemplate: string;
  pluralTemplate: string;
  emptyText: string;
};

export type CacheStrategyConfigKey = 'NO_CACHE' | 'VERSION_AND_TIMESTAMP';

export interface Configuration {
  cacheStrategy: CacheStrategyConfigKey;
  shouldShowReference: boolean;
  shouldShowImplementation: boolean;

  functionSymbolEntryConfig: {
    referencesDisplayRule: CodeLensDisplayRules;
  };
  interfaceSymbolEntryConfig: {
    referencesDisplayRule: CodeLensDisplayRules;
    implementByDisplayRule: CodeLensDisplayRules;
  };
  childMethodInterfaceSymbolEntryConfig: {
    referencesDisplayRule: CodeLensDisplayRules;
    implementByDisplayRule: CodeLensDisplayRules;
  };
  methodSymbolEntryConfig: {
    referencesDisplayRule: CodeLensDisplayRules;
    implementFromDisplayRule: CodeLensDisplayRules;
  };

  structSymbolEntryConfig: {
    referencesDisplayRule: CodeLensDisplayRules;
    implementFromDisplayRule: CodeLensDisplayRules;
  };
}

export interface ConfigurationLoader {
  getConfiguration(): Configuration;
}
