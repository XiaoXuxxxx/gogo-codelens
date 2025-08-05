import * as vscode from 'vscode';

import { SymbolCodeLensProvider } from '@/src/SymbolLensProvider';
import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { VsCodeGoLensConfigurationLoader } from '@/src/configuration/VsCodeGoLensConfigurationLoader';
import { TemplateRenderer } from '@/src/renderer/TemplateRenderer';
import { SymbolHandlerRegistry } from '@/src/symbol/SymbolHandlerRegistry';
import { FunctionSymbolHandler } from '@/src/symbol/handler/FunctionSymbolHandler';
import { InterfaceSymbolHandler } from '@/src/symbol/handler/InterfaceSymbolHandler';
import { MethodSymbolHandler } from '@/src/symbol/handler/MethodSymbolHandler';
import { StructSymbolHandler } from '@/src/symbol/handler/StructSymbolHandler';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

function createCodeLensProvider(
  configLoader: VsCodeGoLensConfigurationLoader,
  vsCodeWrapper: VsCodeWrapper,
): SymbolCodeLensProvider {
  const config = configLoader.getConfiguration();

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

  const symbolHandlerRegistry = new SymbolHandlerRegistry([
    new FunctionSymbolHandler(vsCodeWrapper, functionReferenceCodeLensMaker),
    new InterfaceSymbolHandler(
      vsCodeWrapper,
      interfaceImplementByCodeLensMaker,
      interfaceReferenceCodeLensMaker,
      childMethodInterfaceImplementByCodeLensMaker,
      childMethodInterfaceReferenceCodeLensMaker,
    ),
    new MethodSymbolHandler(vsCodeWrapper, methodImplementFromCodeLensMaker, methodReferenceCodeLensMaker),
    new StructSymbolHandler(vsCodeWrapper, structImplementFromCodeLensMaker, structReferenceCodeLensMaker),
  ]);

  const codeLensProvider = new SymbolCodeLensProvider(vsCodeWrapper, symbolHandlerRegistry);

  return codeLensProvider;
}

export async function activate(context: vscode.ExtensionContext) {
  const vsCodeWrapper = new VsCodeWrapper();
  const configLoader = new VsCodeGoLensConfigurationLoader();

  const codeLensProvider = createCodeLensProvider(configLoader, vsCodeWrapper);

  let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    { scheme: 'file', language: 'go' },
    codeLensProvider,
  );

  const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (!e.affectsConfiguration('gogoCodeLens')) {
      return;
    }

    configLoader.updateConfiguration();
    codeLensProviderDisposable.dispose();

    const newCodeLensProvider = createCodeLensProvider(configLoader, vsCodeWrapper);

    codeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
      { scheme: 'file', language: 'go' },
      newCodeLensProvider,
    );

    context.subscriptions.push(codeLensProviderDisposable);
    vscode.commands.executeCommand('vscode.executeCodeLensProvider');
  });

  context.subscriptions.push(codeLensProviderDisposable, configChangeListener);
}

export function deactivate() {}
