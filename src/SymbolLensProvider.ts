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

    const futureCodeLenses = symbols
      .map((symbol) => {
        const symbolHandler = this.symbolHandlerRegistry.getSymbolHandlerBySymbolKind(symbol.kind);
        return symbolHandler ? symbolHandler.generateCodeLensFromSymbol(document, symbol) : null;
      })
      .filter((promise): promise is Promise<vscode.CodeLens[]> => promise !== null);

    const codeLens = await Promise.all(futureCodeLenses);

    return codeLens.flat();
  }
}
