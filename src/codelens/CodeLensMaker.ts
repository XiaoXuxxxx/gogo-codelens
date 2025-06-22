import * as vscode from 'vscode';
import { CodeLens, Location, Range, Uri } from 'vscode';

import { Renderable } from '@/src/renderer/Renderable';

export class CodeLensMaker {
  private singularTitleTemplate: Renderable;
  private pluralTitleTemplate: Renderable;
  private emptyTitleText: string;
  private shouldShow: boolean;

  public constructor(
    singularTitleTemplate: Renderable,
    pluralTitleTemplate: Renderable,
    emptyTitleText: string,
    shouldShow: boolean,
  ) {
    this.singularTitleTemplate = singularTitleTemplate;
    this.pluralTitleTemplate = pluralTitleTemplate;
    this.emptyTitleText = emptyTitleText;
    this.shouldShow = shouldShow;
  }

  public getShouldShow(): boolean {
    return this.shouldShow;
  }

  public isEmptyTitleTextConfigure(): boolean {
    return this.emptyTitleText.length > 0;
  }

  public updateTemplateRenderers(
    singularTitleTemplate: Renderable,
    pluralTitleTemplate: Renderable,
    emptyTitleText: string,
    shouldShow: boolean,
  ): void {
    this.singularTitleTemplate = singularTitleTemplate;
    this.pluralTitleTemplate = pluralTitleTemplate;
    this.emptyTitleText = emptyTitleText;
    this.shouldShow = shouldShow;
  }

  public build(targetCodelensUri: Uri, targetCodelensRange: Range, destinationLocations: Location[]): CodeLens {
    const implementationCount = destinationLocations.length;

    if (implementationCount === 0) {
      return new vscode.CodeLens(targetCodelensRange, {
        title: this.emptyTitleText,
        command: '',
      });
    }

    if (implementationCount === 1) {
      return new vscode.CodeLens(targetCodelensRange, {
        title: this.singularTitleTemplate.render({ count: implementationCount }),
        command: 'editor.action.goToLocations',
        arguments: [targetCodelensUri, targetCodelensRange.start, destinationLocations],
      });
    }

    return new vscode.CodeLens(targetCodelensRange, {
      title: this.pluralTitleTemplate.render({ count: implementationCount }),
      command: 'editor.action.peekLocations',
      arguments: [targetCodelensUri, targetCodelensRange.start, destinationLocations],
    });
  }
}
