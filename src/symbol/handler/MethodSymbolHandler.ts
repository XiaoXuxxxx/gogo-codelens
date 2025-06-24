import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

export class MethodSymbolHandler implements SymbolHandleable {
  protected readonly symbolKind = vscode.SymbolKind.Method;

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
    const methodNamePosition = this.getMethodCharPosition(document, symbol.range);
    const promises: Promise<vscode.CodeLens | null>[] = [];

    promises.push(
      this.generateImplementationCodeLens(document, symbol, this.implementFromCodeLensMaker, methodNamePosition),
    );
    promises.push(this.generateReferenceCodeLens(document, symbol, this.referenceCodeLensMaker, methodNamePosition));

    const results = await Promise.all(promises);
    return results.filter((lens): lens is vscode.CodeLens => lens !== null);
  }

  private async generateReferenceCodeLens(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
    codeLensMaker: CodeLensMaker,
    position: vscode.Position,
  ): Promise<vscode.CodeLens | null> {
    if (!codeLensMaker.getShouldShow()) {
      return null;
    }

    const referenceLocations = await this.vsCodeWrapper.executeReferenceProvider(
      document.uri,
      position.line,
      position.character,
    );

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.range.start.line === position.line && e.uri.fsPath === document.uri.fsPath),
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
    position: vscode.Position,
  ): Promise<vscode.CodeLens | null> {
    if (!codeLensMaker.getShouldShow()) {
      return null;
    }

    const implementationLocations = await this.vsCodeWrapper.executeImplementationProvider(
      document.uri,
      position.line,
      position.character,
    );

    if (implementationLocations.length > 0 || codeLensMaker.isEmptyTitleTextConfigure()) {
      return codeLensMaker.build(document.uri, symbol.range, implementationLocations);
    }

    return null;
  }

  private getMethodCharPosition(document: vscode.TextDocument, range: vscode.Range): vscode.Position {
    let isFoundParenthesis = false;
    let isNowInsideTheComment = false;
    let weight = 0;

    for (let lineNumber = range.start.line; lineNumber < range.end.line; lineNumber++) {
      const currentLineCharacters = document.lineAt(lineNumber).text;
      const characterCount = currentLineCharacters.length;

      for (let currentCharacterIndex = 0; currentCharacterIndex < characterCount; currentCharacterIndex++) {
        const currentCharacter = currentLineCharacters[currentCharacterIndex];
        const nextCharacter = currentLineCharacters[currentCharacterIndex + 1];

        if (currentCharacter === ' ') {
          continue;
        }

        if (isNowInsideTheComment) {
          if (currentCharacter === '*' && nextCharacter === '/') {
            isNowInsideTheComment = false;
          }

          continue;
        }

        // now not in the inside

        if (currentCharacter === '/' && nextCharacter === '*') {
          isNowInsideTheComment = true;
          continue;
        }

        if (currentCharacter === '(') {
          weight++;
          isFoundParenthesis = true;
          continue;
        }

        if (currentCharacter === ')') {
          weight--;
          continue;
        }

        if (isFoundParenthesis && weight === 0 && currentCharacter !== '*' && currentCharacter !== '/') {
          return new vscode.Position(lineNumber, currentCharacterIndex);
        }
      }
    }

    return new vscode.Position(range.start.line, 0);
  }
}
