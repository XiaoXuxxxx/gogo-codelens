import { Renderable } from '@/src/renderer/Renderable';

export class TemplateRenderer implements Renderable {
  private readonly parts: ReadonlyArray<string>;

  public constructor(template: string) {
    this.parts = this.compile(template);
  }

  private compile(template: string): string[] {
    return template.split(/({{\s*\w+\s*}})/g).filter((part) => part !== '');
  }

  public render(data: Record<string, string | number>): string {
    const resultParts: (string | number)[] = [];

    for (let i = 0; i < this.parts.length; i++) {
      const part = this.parts[i];

      if (!part.startsWith('{{') || !part.endsWith('}}')) {
        resultParts.push(part);
        continue;
      }

      const key = part.slice(2, -2).trim();
      if (key in data) {
        resultParts.push(data[key]);
        continue;
      }

      resultParts.push('');
    }

    return resultParts.join('');
  }
}
