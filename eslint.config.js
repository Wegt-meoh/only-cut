import { defineConfig } from "eslint/config";
import globals from "globals";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default defineConfig([
    { files: ["**/*.{js,ts}"] },
    {
        languageOptions: {
            globals: globals.browser,
        }, plugins: {
            "@stylistic": stylistic,
        },
    },
    stylistic.configs.recommended,
    tseslint.configs.recommended,
    {
        rules: {
            "@stylistic/indent": ["error", 4],
            "@stylistic/quotes": ["warn", "double"],
            "@stylistic/semi": ["error", "always"],
        },
    },
    { ignores: ["src-tauri", "node_modules", "dist"] },
]);
