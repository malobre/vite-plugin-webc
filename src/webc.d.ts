declare module "@11ty/webc" {
  export class WebC {
    constructor();

    defineComponents(
      globOrObject:
        | string // Glob
        | Array<string> // Array of paths, use file names as component names.
        | Array<{ [_: string]: string }>, // Map of component names to paths
    ): void;

    setTransform(
      type: string,
      transform: (content: string) => Promise<string> | string,
    );
    setHelper(name: string, func: (...args: unknown[]) => unknown);
    setContent(input: string, path: string): void;

    compile(): Promise<{
      html: string;
      css: Array<string>;
      js: Array<string>;
      components: Array<string>;
    }>;
  }
}
