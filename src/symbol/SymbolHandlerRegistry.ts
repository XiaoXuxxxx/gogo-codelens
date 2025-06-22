import { SymbolKind } from 'vscode';

import { SymbolHandleable } from '@/src/symbol/handler/SymbolHandleable';

export class SymbolHandlerRegistry {
  private readonly symbolHandlerBySymbolKind: ReadonlyMap<SymbolKind, SymbolHandleable>;

  public constructor(generators: SymbolHandleable[]) {
    const symbolHandlerBySymbolKind = new Map();

    for (const generator of generators) {
      symbolHandlerBySymbolKind.set(generator.getSymbolKind(), generator);
    }

    this.symbolHandlerBySymbolKind = symbolHandlerBySymbolKind;
  }

  public getSymbolHandlerBySymbolKind(symbolKind: SymbolKind): SymbolHandleable | undefined {
    return this.symbolHandlerBySymbolKind.get(symbolKind);
  }
}
