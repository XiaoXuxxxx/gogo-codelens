import * as vscode from 'vscode';

export interface SymbolHandleable {
  getSymbolKind(): vscode.SymbolKind;

  generateCodeLensFromSymbol(document: vscode.TextDocument, symbol: vscode.DocumentSymbol): Promise<vscode.CodeLens[]>;
}
