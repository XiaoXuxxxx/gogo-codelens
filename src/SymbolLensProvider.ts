import * as vscode from 'vscode';

import { SymbolHandlerRegistry } from '@/src/symbol/SymbolHandlerRegistry';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

export class SymbolCodeLensProvider implements vscode.CodeLensProvider {
  private readonly vsCodeWrapper: VsCodeWrapper;
  private readonly symbolHandlerRegistry: SymbolHandlerRegistry;

  public constructor(vscodeWrapper: VsCodeWrapper, symbolHandlerRegistry: SymbolHandlerRegistry) {
    this.vsCodeWrapper = vscodeWrapper;
    this.symbolHandlerRegistry = symbolHandlerRegistry;
  }

  public async provideCodeLenses(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): Promise<vscode.CodeLens[]> {
    const symbols = await this.vsCodeWrapper.executeDocumentSymbolProvider(document.uri);

    const futureCodeLenses: Promise<vscode.CodeLens[]>[] = [];
    
    for (const symbol of symbols) {
      const symbolHandler = this.symbolHandlerRegistry.getSymbolHandlerBySymbolKind(symbol.kind);
      if (symbolHandler) {
        futureCodeLenses.push(symbolHandler.generateCodeLensFromSymbol(document, symbol));
      }
    }

    const codeLens = await Promise.all(futureCodeLenses);

    return codeLens.flat();
  }
}
