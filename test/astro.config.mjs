// @ts-check
import { defineConfig } from "astro/config";
import bun from "@hedystia/astro-bun";

// https://astro.build/config
export default defineConfig({
  adapter: bun(),
  output: "static",
  server: {
    host: "0.0.0.0",
  },
});
