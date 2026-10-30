// import { defineConfig} from "vitest/config"

// export default defineConfig({
//   test: {
//     include: ["package/*/src/**/*.test.ts", "apps/*/src/**/*.test.ts"],
//     environment: "node",
//     passWithNoTests: false,
//   }
// });

import js from "@eslint/js"

export default tseslint.config(
  { ignore: ["**/dist/**", "**/node_modules/**", "**/drizzle/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
    }
  }
)