import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat ESLint configuration for Next.js 16.
 *
 * `eslint-config-next` exports native flat-config arrays, so the previous
 * `FlatCompat` wrapper is no longer needed (and now throws on circular
 * structures). `core-web-vitals` builds on the base config and adds the
 * performance rules; `typescript` adds the TS parser and rules.
 */
const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // The admin panels parse untrusted JSON from their own API responses and
      // narrow it field by field; blanket `any` bans would only force casts.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
