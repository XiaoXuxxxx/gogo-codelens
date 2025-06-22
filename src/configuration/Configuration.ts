export type CodeLensDisplayRules = {
  shouldShow: boolean;
  singularTemplate: string;
  pluralTemplate: string;
  emptyText: string;
};

export interface Configuration {
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
