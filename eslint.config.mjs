// Configuration ESLint des packages partagés (packages/*).
// Les apps ont leur propre configuration (eslint-config-next, eslint-config-expo).
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "apps/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
