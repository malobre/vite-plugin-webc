import { join, relative } from "node:path";
import { WebC } from "@11ty/webc";
import type { PluginContext as RollupPluginContext } from "rollup";
import { normalizePath } from "vite";
import type { Plugin as VitePlugin, ResolvedConfig as ViteConfig } from "vite";

const dummyIndexFilename = "index.html?vite-plugin-webc-dummy";

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
  let rollupContext: RollupPluginContext;
  let viteConfig: ViteConfig;

  const dependenciesMap = new Map<string, string[]>();
  const dirty: Set<string> = new Set();

  return {
    name: "@malobre/vite-plugin-webc",
    enforce: "pre",
    buildStart() {
      rollupContext = this;
    },
    configResolved(resolved) {
      viteConfig = resolved;
    },
    watchChange(id, _change) {
      for (const [index, dependencies] of dependenciesMap) {
        if (dependencies.includes(id)) {
          dirty.add(index);
        }
      }
    },
    shouldTransformCachedModule(options) {
      return dirty.delete(options.id);
    },
    handleHotUpdate(ctx) {
      for (const [index, dependencies] of dependenciesMap) {
        if (dependencies.includes(ctx.file)) {
          ctx.server.ws.send({
            type: "full-reload",
            path: `/${normalizePath(relative(viteConfig.root, index))}`,
          });

          break;
        }
      }
    },
    transformIndexHtml: {
      order: "pre",
      handler: async (raw, ctx) => {
        const webc = new WebC();

        // Resolve path relative to vite project root.
        webc.setContent(raw, join(viteConfig.root, dummyIndexFilename));

        if (config.components !== undefined) {
          webc.defineComponents(config.components);
        }

        for (const transform of Object.entries(config.transforms ?? {})) {
          webc.setTransform(...transform);
        }

        for (const helper of Object.entries(config.helpers ?? {})) {
          webc.setHelper(...helper);
        }

        const { html, components } = await webc.compile();

        for (const component of components) {
          if (component.endsWith(dummyIndexFilename)) continue;

          rollupContext?.addWatchFile(component);
        }

        dependenciesMap.set(ctx.filename, components);

        return html;
      },
    },
  };
};
