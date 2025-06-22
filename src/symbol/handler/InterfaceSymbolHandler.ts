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
    const { start } = symbol.range;

    const [methodImplementationLocations, referenceLocations] = await Promise.all([
      this.vsCodeWrapper.executeImplementationProvider(document.uri, start.line, start.character),
      this.vsCodeWrapper.executeReferenceProvider(document.uri, start.line, start.character),
    ]);

    const codeLenses: vscode.CodeLens[] = [];

    if (this.implementByCodeLensMaker.getShouldShow()) {
      if (methodImplementationLocations.length > 0 || this.implementByCodeLensMaker.isEmptyTitleTextConfigure()) {
        codeLenses.push(this.implementByCodeLensMaker.build(document.uri, symbol.range, methodImplementationLocations));
      }
    }

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.range.start.isEqual(start) && e.uri === document.uri),
    );

    if (this.referenceCodeLensMaker.getShouldShow()) {
      if (nonSelfReferenceLocations.length > 0 || this.referenceCodeLensMaker.isEmptyTitleTextConfigure()) {
        codeLenses.push(this.referenceCodeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations));
      }
    }

    const futureChildCodeLenses: Promise<vscode.CodeLens[]>[] = [];
    for (const method of (symbol as vscode.DocumentSymbol).children) {
      if (method.kind === vscode.SymbolKind.Method) {
        const futureCodeLens = this.generateFromChildMethod(
          document,
          method as vscode.SymbolInformation & vscode.DocumentSymbol,
        );
        futureChildCodeLenses.push(futureCodeLens);
      }
    }

    const childCodeLenses = await Promise.all(futureChildCodeLenses);

    return [...codeLenses, ...childCodeLenses.flat()];
  }

  private async generateFromChildMethod(
    document: vscode.TextDocument,
    symbol: vscode.DocumentSymbol,
  ): Promise<vscode.CodeLens[]> {
    const { start } = symbol.range;

    const [methodImplementationLocations, referenceLocations] = await Promise.all([
      this.vsCodeWrapper.executeImplementationProvider(document.uri, start.line, start.character),
      this.vsCodeWrapper.executeReferenceProvider(document.uri, start.line, start.character),
    ]);

    const codeLenses: vscode.CodeLens[] = [];

    if (this.childMethodImplementByCodeLensMaker.getShouldShow()) {
      if (
        methodImplementationLocations.length > 0 ||
        this.childMethodImplementByCodeLensMaker.isEmptyTitleTextConfigure()
      ) {
        codeLenses.push(
          this.childMethodImplementByCodeLensMaker.build(document.uri, symbol.range, methodImplementationLocations),
        );
      }
    }

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.range.start.line === start.line && e.uri.path === document.uri.path),
    );

    if (this.childMethodReferenceCodeLensMaker.getShouldShow()) {
      if (nonSelfReferenceLocations.length > 0 || this.childMethodReferenceCodeLensMaker.isEmptyTitleTextConfigure()) {
        codeLenses.push(
          this.childMethodReferenceCodeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations),
        );
      }
    }

    return codeLenses;
  }
}
