import { CodeLens, TextDocument } from 'vscode';

import { CodeLensResultCache } from '@/src/codelens/provider/cache/CodeLensResultCache';

export class NoOpCodeLensCache implements CodeLensResultCache {
  public get(document: TextDocument): CodeLens[] | undefined {
    return undefined;
  }

  public set(document: TextDocument, codeLenses: CodeLens[]): void {}
}
