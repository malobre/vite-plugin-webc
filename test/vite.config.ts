import { defineConfig } from "vite";

import webc from "@malobre/vite-plugin-webc";

export default defineConfig({
  plugins: [webc()],
});
