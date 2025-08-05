import * as vscode from 'vscode';

import { CacheStrategyConfigKey, Configuration, ConfigurationLoader } from '@/src/configuration/Configuration';

export class VsCodeGoLensConfigurationLoader implements ConfigurationLoader {
  private configuration!: Configuration;

  public constructor() {
    this.loadConfiguration();
  }

  public getConfiguration(): Configuration {
    return this.configuration;
  }

  public updateConfiguration(): void {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    const extensionConfig = vscode.workspace.getConfiguration('gogoCodeLens');

    const configuration: Configuration = {
      cacheStrategy: extensionConfig.get<CacheStrategyConfigKey>('codelens.cacheStrategy')!,
      shouldShowReference: extensionConfig.get<boolean>('codelens.enabled.showReferences')!,
      shouldShowImplementation: extensionConfig.get<boolean>('codelens.enabled.showImplementations')!,
      functionSymbolEntryConfig: {
        referencesDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.function.references.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.function.references.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.function.references.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.function.references.singularTemplate')!,
        },
      },
      methodSymbolEntryConfig: {
        referencesDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.method.references.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.method.references.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.method.references.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.method.references.singularTemplate')!,
        },
        implementFromDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.method.implementFrom.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.method.implementFrom.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.method.implementFrom.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.method.implementFrom.singularTemplate')!,
        },
      },
      interfaceSymbolEntryConfig: {
        referencesDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.interface.references.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.interface.references.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.interface.references.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.interface.references.singularTemplate')!,
        },
        implementByDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.interface.implementBy.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.interface.implementBy.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.interface.implementBy.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.interface.implementBy.singularTemplate')!,
        },
      },
      childMethodInterfaceSymbolEntryConfig: {
        referencesDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.childMethodInterface.references.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.childMethodInterface.references.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.childMethodInterface.references.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.childMethodInterface.references.singularTemplate')!,
        },
        implementByDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.childMethodInterface.implementBy.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.childMethodInterface.implementBy.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.childMethodInterface.implementBy.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.childMethodInterface.implementBy.singularTemplate')!,
        },
      },
      structSymbolEntryConfig: {
        referencesDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.struct.references.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.struct.references.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.struct.references.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.struct.references.singularTemplate')!,
        },
        implementFromDisplayRule: {
          shouldShow: extensionConfig.get<boolean>('codelens.struct.implementFrom.isEnabled')!,
          emptyText: extensionConfig.get<string>('codelens.struct.implementFrom.emptyText')!,
          pluralTemplate: extensionConfig.get<string>('codelens.struct.implementFrom.pluralTemplate')!,
          singularTemplate: extensionConfig.get<string>('codelens.struct.implementFrom.singularTemplate')!,
        },
      },
    };

    this.configuration = configuration;
  }
}
