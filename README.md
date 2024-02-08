# `@malobre/vite-plugin-webc`

Treat html inputs as [WebC](https://github.com/11ty/webc/tree/v0.11.4?tab=readme-ov-file#webc-is-for-single-file-web-components).

## Usage

1. Install 
    ```shell
    npm install --save-dev https://github.com/malobre/vite-plugin-webc.git
    ```
1. Add plugin to your vite config
    ```js
    import { defineConfig } from 'vite'
    import webc from '@malobre/vite-plugin-webc'

    export default defineConfig({
      plugins: [webc(/* config */)],
    })
   ```

## Configuration

```ts
type Config = {
  // See https://github.com/11ty/webc/tree/v0.11.4?tab=readme-ov-file#register-global-components
  components?: string | Array<string> | Array<{ [_: string]: string }>;

  // See https://github.com/11ty/webc/tree/v0.11.4?tab=readme-ov-file#custom-transforms
  transforms?: {
    [type: string]: (content: string) => Promise<string> | string;
  };

  // See https://github.com/11ty/webc/tree/v0.11.4?tab=readme-ov-file#helper-functions
  helpers?: {
    [name: string]: () => unknown;
  };
};
```

## Quirks

- Input files are processed has if they were located in the vite project root folder.
