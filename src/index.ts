import { join } from "path";
import { WebC } from "@11ty/webc";
import type { Plugin as VitePlugin, ResolvedConfig as ViteConfig } from "vite";

type Config = {
  components?:
    | string // Glob
    | Array<string> // Array of paths, use file names as component names.
    | Array<{ [_: string]: string }>; // Map of component names to paths
  transforms?: {
    [type: string]: (content: string) => Promise<string> | string;
  };
  helpers?: {
    [name: string]: (...args: unknown[]) => unknown;
  };
};

export default (config: Config = {}): VitePlugin => {
  let viteConfig: ViteConfig;

  return {
    name: "@malobre/vite-plugin-webc",
    enforce: "pre",
    configResolved(resolved) {
      viteConfig = resolved;
    },
    transformIndexHtml: {
      order: "pre",
      handler: async (raw) => {
        const webc = new WebC();

        // Resolve path relative to vite project root.
        webc.setContent(raw, join(viteConfig.root, "dummy.html"));

        if (config.components !== undefined) {
          webc.defineComponents(config.components);
        }

        for (const transform of Object.entries(config.transforms ?? {})) {
          webc.setTransform(...transform);
        }

        for (const helper of Object.entries(config.helpers ?? {})) {
          webc.setHelper(...helper);
        }

        const { html } = await webc.compile();

        return html;
      },
    },
  };
};
