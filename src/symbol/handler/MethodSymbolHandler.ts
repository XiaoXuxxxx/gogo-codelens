import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

export class MethodSymbolHandler implements SymbolHandleable {
  protected readonly symbolKind = vscode.SymbolKind.Method;
  private readonly METHOD_REGEX = /func\s*\(\w*\s*\*?\w*\)\s*(\w+)\s*\(/;
  private readonly RECEIVER_REGEX = /\(.*\)/;

  private readonly vsCodeWrapper: VsCodeWrapper;
  private readonly implementFromCodeLensMaker: CodeLensMaker;
  private readonly referenceCodeLensMaker: CodeLensMaker;

  public constructor(
    vsCodeWrapper: VsCodeWrapper,
    implementFromCodeLensMaker: CodeLensMaker,
    referenceCodeLensMaker: CodeLensMaker,
  ) {
    this.vsCodeWrapper = vsCodeWrapper;
    this.implementFromCodeLensMaker = implementFromCodeLensMaker;
    this.referenceCodeLensMaker = referenceCodeLensMaker;
  }

  public getSymbolKind(): vscode.SymbolKind {
    return this.symbolKind;
  }

  public async generateCodeLensFromSymbol(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
  ): Promise<vscode.CodeLens[]> {
    if (!this.hasReceiver(document, symbol.range)) {
      return [];
    }

    const charPosition = this.getMethodCharPosition(document, symbol.range);
    const promises: Promise<vscode.CodeLens | null>[] = [];

    promises.push(this.generateImplementationCodeLens(document, symbol, this.implementFromCodeLensMaker, charPosition));
    promises.push(this.generateReferenceCodeLens(document, symbol, this.referenceCodeLensMaker, charPosition));

    const results = await Promise.all(promises);
    return results.filter((lens): lens is vscode.CodeLens => lens !== null);
  }

  private async generateReferenceCodeLens(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
    codeLensMaker: CodeLensMaker,
    charPosition: number,
  ): Promise<vscode.CodeLens | null> {
    if (!codeLensMaker.getShouldShow()) {
      return null;
    }

    const { start } = symbol.range;
    const referenceLocations = await this.vsCodeWrapper.executeReferenceProvider(
      document.uri,
      start.line,
      charPosition,
    );

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.range.start.line === start.line && e.uri.fsPath === document.uri.fsPath),
    );

    if (nonSelfReferenceLocations.length > 0 || codeLensMaker.isEmptyTitleTextConfigure()) {
      return codeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations);
    }

    return null;
  }

  private async generateImplementationCodeLens(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
    codeLensMaker: CodeLensMaker,
    charPosition: number,
  ): Promise<vscode.CodeLens | null> {
    if (!codeLensMaker.getShouldShow()) {
      return null;
    }

    const { start } = symbol.range;
    const implementationLocations = await this.vsCodeWrapper.executeImplementationProvider(
      document.uri,
      start.line,
      charPosition,
    );

    if (implementationLocations.length > 0 || codeLensMaker.isEmptyTitleTextConfigure()) {
      return codeLensMaker.build(document.uri, symbol.range, implementationLocations);
    }

    return null;
  }

  private getMethodCharPosition(document: vscode.TextDocument, range: vscode.Range): number {
    try {
      const firstLine = document.lineAt(range.start.line).text;

      const match = this.METHOD_REGEX.exec(firstLine);
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

  private hasReceiver(document: vscode.TextDocument, range: vscode.Range) {
    try {
      const lineText = document.lineAt(range.start.line).text;
      return this.RECEIVER_REGEX.test(lineText);
    } catch (error) {
      return false;
    }
  }
}
