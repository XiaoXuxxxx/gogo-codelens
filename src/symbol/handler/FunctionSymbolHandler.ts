import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

//
// normal function
//
export class FunctionSymbolHandler implements SymbolHandleable {
  protected readonly symbolKind = vscode.SymbolKind.Function;
  private readonly FUNCTION_REGEX = /func\s+(\w+)\s*\(/;

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
    if (!this.referenceCodeLensMaker.getShouldShow()) {
      return [];
    }

    const { start } = symbol.range;

    const charPosition = this.getFunctionCharPosition(document, symbol.range);
    const referenceLocations = await this.vsCodeWrapper.executeReferenceProvider(
      document.uri,
      start.line,
      charPosition,
    );

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.uri.fsPath === document.uri.fsPath && e.range.start.line === start.line),
    );

    if (nonSelfReferenceLocations.length === 0) {
      return [];
    }

    return [this.referenceCodeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations)];
  }

  private getFunctionCharPosition(document: vscode.TextDocument, range: vscode.Range): number {
    try {
      const firstLine = document.lineAt(range.start.line).text;

      const match = this.FUNCTION_REGEX.exec(firstLine);
      if (!match || !match[1]) {
        return 0;
      }

      const functionName = match[1];
      const functionNameIndex = match[0].indexOf(functionName);

      if (functionNameIndex === -1) {
        return 0;
      }

      const position = match.index + functionNameIndex;

      return position;
    } catch (error) {
      return 0;
    }
  }
}
