import * as vscode from 'vscode';

import { CodeLensResultCache } from '@/src/codelens/provider/cache/CodeLensResultCache';
import { SymbolHandlerRegistry } from '@/src/symbol/SymbolHandlerRegistry';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

export class RelationCodeLensProvider implements vscode.CodeLensProvider {
  private readonly vsCodeWrapper: VsCodeWrapper;
  private readonly symbolHandlerRegistry: SymbolHandlerRegistry;

  private readonly codeLensResultCache: CodeLensResultCache;

  public constructor(
    vscodeWrapper: VsCodeWrapper,
    symbolHandlerRegistry: SymbolHandlerRegistry,
    codeLensResultCache: CodeLensResultCache,
  ) {
    this.vsCodeWrapper = vscodeWrapper;
    this.symbolHandlerRegistry = symbolHandlerRegistry;
    this.codeLensResultCache = codeLensResultCache;
  }

  public async provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): Promise<vscode.CodeLens[]> {
    const cacheCodeLens = this.codeLensResultCache.get(document);
    if (cacheCodeLens !== undefined) {
      return cacheCodeLens;
    }

    const symbols = await this.vsCodeWrapper.executeDocumentSymbolProvider(document.uri);
    if (symbols.length === 0) {
      return [];
    }

    const futureCodeLenses: Promise<vscode.CodeLens[]>[] = [];

    for (const symbol of symbols) {
      const symbolHandler = this.symbolHandlerRegistry.getSymbolHandlerBySymbolKind(symbol.kind);
      if (symbolHandler) {
        futureCodeLenses.push(symbolHandler.generateCodeLensFromSymbol(document, symbol));
      }
    }

    if (futureCodeLenses.length === 0) {
      return [];
    }

    const codeLens = await Promise.all(futureCodeLenses);
    const flattedCodeLens = codeLens.flat();

    this.codeLensResultCache.set(document, flattedCodeLens);

    return flattedCodeLens;
  }
}
