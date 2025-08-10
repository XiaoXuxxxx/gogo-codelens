import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

export class ConstantSymbolHandler implements SymbolHandleable {
  protected readonly symbolKind: vscode.SymbolKind = vscode.SymbolKind.Constant;

  private readonly vsCodeWrapper: VsCodeWrapper;
  private readonly referenceCodeLensMaker: CodeLensMaker;

  public constructor(vsCodeWrapper: VsCodeWrapper, referenceCodeLensMaker: CodeLensMaker) {
    this.vsCodeWrapper = vsCodeWrapper;
    this.referenceCodeLensMaker = referenceCodeLensMaker;
  }

  public getSymbolKind(): vscode.SymbolKind {
    return this.symbolKind;
  }

  public async generateCodeLensFromSymbol(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
  ): Promise<vscode.CodeLens[]> {
    const promises: Promise<vscode.CodeLens | null>[] = [];

    promises.push(this.generateReferenceCodeLens(document, symbol, this.referenceCodeLensMaker));

    const results = await Promise.all(promises);
    return results.filter((lens): lens is vscode.CodeLens => lens !== null);
  }

  private async generateReferenceCodeLens(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
    codeLensMaker: CodeLensMaker,
  ): Promise<vscode.CodeLens | null> {
    if (!codeLensMaker.getShouldShow()) {
      return null;
    }

    const { start } = symbol.range;
    const referenceLocations = await this.vsCodeWrapper.executeReferenceProvider(
      document.uri,
      start.line,
      start.character,
    );

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.uri.fsPath === document.uri.fsPath && e.range.start.line === start.line),
    );

    if (nonSelfReferenceLocations.length > 0 || codeLensMaker.isEmptyTitleTextConfigure()) {
      return codeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations);
    }

    return null;
  }
}
