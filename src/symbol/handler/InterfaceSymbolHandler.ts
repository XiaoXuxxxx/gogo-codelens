import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

export class InterfaceSymbolHandler implements SymbolHandleable {
  protected readonly symbolKind = vscode.SymbolKind.Interface;

  private readonly vsCodeWrapper: VsCodeWrapper;

  private readonly implementByCodeLensMaker: CodeLensMaker;
  private readonly referenceCodeLensMaker: CodeLensMaker;

  private readonly childMethodImplementByCodeLensMaker: CodeLensMaker;
  private readonly childMethodReferenceCodeLensMaker: CodeLensMaker;

  public constructor(
    vsCodeWrapper: VsCodeWrapper,
    implementByCodeLensMaker: CodeLensMaker,
    referenceCodeLensMaker: CodeLensMaker,
    childMethodImplementByCodeLensMaker: CodeLensMaker,
    childMethodReferenceCodeLensMaker: CodeLensMaker,
  ) {
    this.vsCodeWrapper = vsCodeWrapper;
    this.implementByCodeLensMaker = implementByCodeLensMaker;
    this.referenceCodeLensMaker = referenceCodeLensMaker;

    this.childMethodImplementByCodeLensMaker = childMethodImplementByCodeLensMaker;
    this.childMethodReferenceCodeLensMaker = childMethodReferenceCodeLensMaker;
  }

  public getSymbolKind(): vscode.SymbolKind {
    return this.symbolKind;
  }

  public async generateCodeLensFromSymbol(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
  ): Promise<vscode.CodeLens[]> {
    const promises: Promise<vscode.CodeLens | null>[] = [];

    promises.push(this.generateImplementationCodeLens(document, symbol, this.implementByCodeLensMaker));
    promises.push(this.generateReferenceCodeLens(document, symbol, this.referenceCodeLensMaker));

    const results = await Promise.all(promises);
    const codeLenses: vscode.CodeLens[] = results.filter((lens): lens is vscode.CodeLens => lens !== null);

    const childMethods = (symbol as vscode.DocumentSymbol).children.filter(
      (child): child is vscode.DocumentSymbol => child.kind === vscode.SymbolKind.Method,
    );

    if (childMethods.length === 0) {
      return codeLenses;
    }

    const futureChildCodeLenses: Promise<vscode.CodeLens | null>[] = [];
    for (const method of childMethods) {
      futureChildCodeLenses.push(
        this.generateChildMethodImplementationCodeLens(document, method, this.childMethodImplementByCodeLensMaker),
        this.generateChildMethodReferenceCodeLens(document, method, this.childMethodReferenceCodeLensMaker),
      );
    }

    const unFilteredChildCodeLenses = await Promise.all(futureChildCodeLenses);
    const childCodeLenses = unFilteredChildCodeLenses.filter((lens): lens is vscode.CodeLens => lens !== null);

    return [...codeLenses, ...childCodeLenses];
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
      (e) => !(e.range.start.isEqual(start) && e.uri === document.uri),
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
  ): Promise<vscode.CodeLens | null> {
    if (!codeLensMaker.getShouldShow()) {
      return null;
    }

    const { start } = symbol.range;
    const implementationLocations = await this.vsCodeWrapper.executeImplementationProvider(
      document.uri,
      start.line,
      start.character,
    );

    if (implementationLocations.length > 0 || codeLensMaker.isEmptyTitleTextConfigure()) {
      return codeLensMaker.build(document.uri, symbol.range, implementationLocations);
    }

    return null;
  }

  private async generateChildMethodReferenceCodeLens(
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
      (e) => !(e.range.start.line === start.line && e.uri.path === document.uri.path),
    );

    if (nonSelfReferenceLocations.length > 0 || codeLensMaker.isEmptyTitleTextConfigure()) {
      return codeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations);
    }

    return null;
  }

  private async generateChildMethodImplementationCodeLens(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
    codeLensMaker: CodeLensMaker,
  ): Promise<vscode.CodeLens | null> {
    if (!codeLensMaker.getShouldShow()) {
      return null;
    }

    const { start } = symbol.range;
    const implementationLocations = await this.vsCodeWrapper.executeImplementationProvider(
      document.uri,
      start.line,
      start.character,
    );

    if (implementationLocations.length > 0 || codeLensMaker.isEmptyTitleTextConfigure()) {
      return codeLensMaker.build(document.uri, symbol.range, implementationLocations);
    }

    return null;
  }
}
