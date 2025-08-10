import * as vscode from 'vscode';

import { StructSymbolHandler } from '@/src/symbol/handler/StructSymbolHandler';

// handling type alias like this
// type Status unit8
export class TypeAliasSymbolHandler extends StructSymbolHandler {
  protected readonly symbolKind = vscode.SymbolKind.Class;
}
