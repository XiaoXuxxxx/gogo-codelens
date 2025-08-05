import * as vscode from 'vscode';

export interface CodeLensResultCache {
  get(document: vscode.TextDocument): vscode.CodeLens[] | undefined;
  set(document: vscode.TextDocument, codeLenses: vscode.CodeLens[]): void;
}
