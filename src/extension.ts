import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { RelationCodeLensProvider } from '@/src/codelens/provider/RelationCodeLensProvider';
import { CodeLensResultCache } from '@/src/codelens/provider/cache/CodeLensResultCache';
import { NoOpCodeLensCache } from '@/src/codelens/provider/cache/NoOpCodeLensCache';
import { VersionAndTimestampCodeLensCache } from '@/src/codelens/provider/cache/VersionAndTimestampCodeLensCache';
import { CacheStrategyConfigKey } from '@/src/configuration/Configuration';
import { VsCodeGoLensConfigurationLoader } from '@/src/configuration/VsCodeGoLensConfigurationLoader';
import { TemplateRenderer } from '@/src/renderer/TemplateRenderer';
import { SymbolHandlerRegistry } from '@/src/symbol/SymbolHandlerRegistry';
import { ConstantSymbolHandler } from '@/src/symbol/handler/ConstantSymbolHandler';
import { FunctionSymbolHandler } from '@/src/symbol/handler/FunctionSymbolHandler';
import { InterfaceSymbolHandler } from '@/src/symbol/handler/InterfaceSymbolHandler';
import { MethodSymbolHandler } from '@/src/symbol/handler/MethodSymbolHandler';
import { StructSymbolHandler } from '@/src/symbol/handler/StructSymbolHandler';
import { TypeAliasSymbolHandler } from '@/src/symbol/handler/TypeAliasSymbolHandler';
import { VariableSymbolHandler } from '@/src/symbol/handler/VariableSymbolHandler';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

class GogoCodeLensExtension implements vscode.Disposable {
  private readonly vsCodeWrapper: VsCodeWrapper;
  private readonly configLoader: VsCodeGoLensConfigurationLoader;

  private providerDisposable: vscode.Disposable | undefined;

  public constructor(vsCodeWrapper: VsCodeWrapper, configLoader: VsCodeGoLensConfigurationLoader) {
    this.vsCodeWrapper = vsCodeWrapper;
    this.configLoader = configLoader;
  }

  public register(): void {
    this.providerDisposable?.dispose();

    this.configLoader.updateConfiguration();
    const provider = this.createCodeLensProvider();

    this.providerDisposable = vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'go' }, provider);
  }

  public dispose(): void {
    this.providerDisposable?.dispose();
  }

  private createCodeLensProvider(): RelationCodeLensProvider {
    const config = this.configLoader.getConfiguration();

    const functionReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.functionSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.functionSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.functionSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.functionSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    // interface
    const interfaceReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.interfaceSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.interfaceSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.interfaceSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.interfaceSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    const interfaceImplementByCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.interfaceSymbolEntryConfig.implementByDisplayRule.singularTemplate),
      new TemplateRenderer(config.interfaceSymbolEntryConfig.implementByDisplayRule.pluralTemplate),
      config.interfaceSymbolEntryConfig.implementByDisplayRule.emptyText,
      config.interfaceSymbolEntryConfig.implementByDisplayRule.shouldShow && config.shouldShowImplementation,
    );

    // child method of interface
    const childMethodInterfaceReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.childMethodInterfaceSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.childMethodInterfaceSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.childMethodInterfaceSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.childMethodInterfaceSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    const childMethodInterfaceImplementByCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.childMethodInterfaceSymbolEntryConfig.implementByDisplayRule.singularTemplate),
      new TemplateRenderer(config.childMethodInterfaceSymbolEntryConfig.implementByDisplayRule.pluralTemplate),
      config.childMethodInterfaceSymbolEntryConfig.implementByDisplayRule.emptyText,
      config.childMethodInterfaceSymbolEntryConfig.implementByDisplayRule.shouldShow && config.shouldShowImplementation,
    );

    // method
    const methodReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.methodSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.methodSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.methodSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.methodSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    const methodImplementFromCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.methodSymbolEntryConfig.implementFromDisplayRule.singularTemplate),
      new TemplateRenderer(config.methodSymbolEntryConfig.implementFromDisplayRule.pluralTemplate),
      config.methodSymbolEntryConfig.implementFromDisplayRule.emptyText,
      config.methodSymbolEntryConfig.implementFromDisplayRule.shouldShow && config.shouldShowImplementation,
    );

    // struct
    const structReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.structSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.structSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.structSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.structSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    const structImplementFromCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.structSymbolEntryConfig.implementFromDisplayRule.singularTemplate),
      new TemplateRenderer(config.structSymbolEntryConfig.implementFromDisplayRule.pluralTemplate),
      config.structSymbolEntryConfig.implementFromDisplayRule.emptyText,
      config.structSymbolEntryConfig.implementFromDisplayRule.shouldShow && config.shouldShowImplementation,
    );

    // type alias
    const typeAliasReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.typeAliasSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.typeAliasSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.typeAliasSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.typeAliasSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    const typeAliasImplementFromCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.typeAliasSymbolEntryConfig.implementFromDisplayRule.singularTemplate),
      new TemplateRenderer(config.typeAliasSymbolEntryConfig.implementFromDisplayRule.pluralTemplate),
      config.typeAliasSymbolEntryConfig.implementFromDisplayRule.emptyText,
      config.typeAliasSymbolEntryConfig.implementFromDisplayRule.shouldShow && config.shouldShowImplementation,
    );

    // constant
    const constantReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.constantSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.constantSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.constantSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.constantSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    // var
    const variableReferenceCodeLensMaker = new CodeLensMaker(
      new TemplateRenderer(config.variableSymbolEntryConfig.referencesDisplayRule.singularTemplate),
      new TemplateRenderer(config.variableSymbolEntryConfig.referencesDisplayRule.pluralTemplate),
      config.variableSymbolEntryConfig.referencesDisplayRule.emptyText,
      config.variableSymbolEntryConfig.referencesDisplayRule.shouldShow && config.shouldShowReference,
    );

    const symbolHandlerRegistry = new SymbolHandlerRegistry([
      new FunctionSymbolHandler(this.vsCodeWrapper, functionReferenceCodeLensMaker),
      new InterfaceSymbolHandler(
        this.vsCodeWrapper,
        interfaceImplementByCodeLensMaker,
        interfaceReferenceCodeLensMaker,
        childMethodInterfaceImplementByCodeLensMaker,
        childMethodInterfaceReferenceCodeLensMaker,
      ),
      new MethodSymbolHandler(this.vsCodeWrapper, methodImplementFromCodeLensMaker, methodReferenceCodeLensMaker),
      new StructSymbolHandler(this.vsCodeWrapper, structImplementFromCodeLensMaker, structReferenceCodeLensMaker),
      new TypeAliasSymbolHandler(
        this.vsCodeWrapper,
        typeAliasImplementFromCodeLensMaker,
        typeAliasReferenceCodeLensMaker,
      ),
      new ConstantSymbolHandler(this.vsCodeWrapper, constantReferenceCodeLensMaker),
      new VariableSymbolHandler(this.vsCodeWrapper, variableReferenceCodeLensMaker),
    ]);

    const codeLensResultCacheByConfig: Record<CacheStrategyConfigKey, CodeLensResultCache> = {
      NO_CACHE: new NoOpCodeLensCache(),
      VERSION_AND_TIMESTAMP: new VersionAndTimestampCodeLensCache(),
    };

    return new RelationCodeLensProvider(
      this.vsCodeWrapper,
      symbolHandlerRegistry,
      codeLensResultCacheByConfig[config.cacheStrategy],
    );
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const vsCodeWrapper = new VsCodeWrapper();
  const configLoader = new VsCodeGoLensConfigurationLoader();

  const gogoCodeLensExtension = new GogoCodeLensExtension(vsCodeWrapper, configLoader);
  gogoCodeLensExtension.register();

  const restartCommand = vscode.commands.registerCommand('gogoCodeLens.restart', () => {
    gogoCodeLensExtension.register();
  });

  const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('gogoCodeLens')) {
      gogoCodeLensExtension.register();
    }
  });

  context.subscriptions.push(gogoCodeLensExtension, restartCommand, configChangeListener);
}

export function deactivate() {}
