import * as vscode from 'vscode';

type executeDocumentSymbolProviderResponse = (vscode.SymbolInformation & vscode.DocumentSymbol)[];

export class VsCodeWrapper {
  public constructor() {
    return this;
  }

  public async executeDocumentSymbolProvider(
    uri: vscode.Uri,
  ): Promise<executeDocumentSymbolProviderResponse> {
    const symbols = await vscode.commands.executeCommand<executeDocumentSymbolProviderResponse>(
      'vscode.executeDocumentSymbolProvider',
      uri,
    );

    return symbols;
  }

  public async executeImplementationProvider(
    uri: vscode.Uri,
    line: number,
    character: number,
  ): Promise<vscode.Location[]> {
    const implementationLocations = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeImplementationProvider',
      uri,
      new vscode.Position(line, character),
    );

    return implementationLocations;
  }

  public async executeReferenceProvider(
    uri: vscode.Uri,
    line: number,
    character: number,
  ): Promise<vscode.Location[]> {
    const referenceLocations = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeReferenceProvider',
      uri,
      new vscode.Position(line, character),
    );

    return referenceLocations;
  }
}
