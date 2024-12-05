<div align="center">
  <p>
    <strong>🚀 @hedystia/astro-bun</strong>
  </p>

  <p>
    <strong>Supercharge your Astro projects with the power of Bun! 🌟</strong>
  </p>

  <p>
    <a href="https://www.npmjs.com/package/@hedystia/astro-bun"><img src="https://img.shields.io/npm/v/@hedystia/astro-bun.svg?style=flat-square" alt="npm version"></a>
    <a href="https://www.npmjs.com/package/@hedystia/astro-bun"><img src="https://img.shields.io/npm/dm/@hedystia/astro-bun.svg?style=flat-square" alt="npm downloads"></a>
    <a href="https://github.com/Zastinian/astro-bun/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Zastinian/astro-bun.svg?style=flat-square" alt="license"></a>
  </p>
</div>

## 🌈 Features

- 🚄 **Lightning-fast** performance with Bun integration
- 🔧 **Easy setup** - get started in minutes
- 🔄 **Seamless compatibility** with Astro projects
- 🛠️ **Unix socket support** - easily run your Bun server with Unix sockets
- 🛠️ **Flexible configuration** options

## 🚀 Quick Start

1. Install the package:
```bash
npm install @hedystia/astro-bun
```

2. Add it to your Astro config:

```javascript
import { defineConfig } from "astro/config";
import bun from "@hedystia/astro-bun";

export default defineConfig({
  // ... other config options
  adapter: bun(),
});
```

3. Build your Astro project:

```shellscript
astro build
```

4. Run your project with Bun:

```shellscript
bun run ./dist/server/entry.mjs
```

## 🎨 Configuration

Customize your setup with these options:

```javascript
import { defineConfig } from "astro/config";
import bun from "@hedystia/astro-bun";

export default defineConfig({
  adapter: bun(),
  output: "static",
  server: {
    "host": "0.0.0.0",
    "port": 3000,
  }
});
```

## 🌟 Why Astro Bun?

- **Blazing Fast**: Harness the speed of Bun for your Astro projects
- **Modern Development**: Stay ahead with cutting-edge web technologies
- **Optimized Performance**: Fine-tuned for efficiency and speed


## 📜 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- [Astro](https://astro.build/) - The web framework that powers this adapter
- [Bun](https://bun.sh/) - The incredible JavaScript runtime
