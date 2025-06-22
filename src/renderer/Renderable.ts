export interface Renderable {
  render(data: Record<string, string | number>): string;
}
