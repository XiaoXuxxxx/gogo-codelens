import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

//
// normal function
//
export class FunctionSymbolHandler implements SymbolHandleable {
  protected readonly symbolKind = vscode.SymbolKind.Function;

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

    const functionNamePosition = this.getFunctionCharPosition(document, symbol.range);
    const referenceLocations = await this.vsCodeWrapper.executeReferenceProvider(
      document.uri,
      functionNamePosition.line,
      functionNamePosition.character,
    );

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.uri.fsPath === document.uri.fsPath && e.range.start.line === functionNamePosition.line),
    );

    if (nonSelfReferenceLocations.length === 0) {
      return [];
    }

    return [this.referenceCodeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations)];
  }

  private getFunctionCharPosition(document: vscode.TextDocument, range: vscode.Range): vscode.Position {
    const line = document.lineAt(range.start.line).text;

    const funcKeyword = 'func';

    const funcIndex = line.indexOf(funcKeyword);
    if (funcIndex === -1) {
      new vscode.Position(range.start.line, 5);
    }

    let currentChar = funcIndex + funcKeyword.length;

    while (currentChar < line.length && line[currentChar] === ' ') {
      currentChar++;
    }

    return new vscode.Position(range.start.line, currentChar);
  }
}
