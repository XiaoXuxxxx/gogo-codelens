import * as vscode from 'vscode';

import { CodeLensMaker } from '@/src/codelens/CodeLensMaker';
import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';
import { VsCodeWrapper } from '@/src/vscode/VsCodeWrapper';

export class StructSymbolHandler implements SymbolHandleable {
  protected readonly symbolKind = vscode.SymbolKind.Struct;

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
    const { start } = symbol.range;

    const [methodImplementationLocations, referenceLocations] = await Promise.all([
      this.vsCodeWrapper.executeImplementationProvider(document.uri, start.line, start.character),
      this.vsCodeWrapper.executeReferenceProvider(document.uri, start.line, start.character),
    ]);

    const codeLenses: vscode.CodeLens[] = [];

    if (this.implementFromCodeLensMaker.getShouldShow()) {
      if (methodImplementationLocations.length > 0 || this.implementFromCodeLensMaker.isEmptyTitleTextConfigure()) {
        codeLenses.push(
          this.implementFromCodeLensMaker.build(document.uri, symbol.range, methodImplementationLocations),
        );
      }
    }

    const nonSelfReferenceLocations = referenceLocations.filter(
      (e) => !(e.uri.fsPath === document.uri.fsPath && e.range.start.line === start.line),
    );

    if (this.referenceCodeLensMaker.getShouldShow()) {
      if (nonSelfReferenceLocations.length > 0 || this.referenceCodeLensMaker.isEmptyTitleTextConfigure()) {
        codeLenses.push(this.referenceCodeLensMaker.build(document.uri, symbol.range, nonSelfReferenceLocations));
      }
    }

    return codeLenses;
  }
}
