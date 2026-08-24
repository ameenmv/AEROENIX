import antfu from '@antfu/eslint-config'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'

export default antfu(
  {
    // Enable UnoCSS rules if used
    unocss: false,
    // TypeScript is enabled by default if tsconfig is found
    typescript: true,
    // Vue is enabled by default
    vue: true,
    // Stylistic rules
    stylistic: true,
    // Ignore documentation files and other non-code files
    ignores: [
      'docs/**',
      'scripts/**',
      '*.md',
      '**/*.md',
      '.gemini/**',
      'ref/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.log',
      '*.tmp',
      '*.temp',
    ],
  },
  // Add your custom rules here
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'warn',
    },
  },
  // i18n linting — catch hardcoded strings in Vue templates
  ...vueI18n.configs.recommended,
  {
    rules: {
      '@intlify/vue-i18n/no-raw-text': [
        'warn',
        {
          // ignore symbols, units, punctuation, numbers
          ignorePattern: '^[-#:()&+\u00D7/\u00B0%.,;!?*\u2191\u2193\u2713\u2192\u2190|\\s\\d]+$',
          // scan these HTML attributes too
          attributes: {
            '/.+/': ['title', 'aria-label', 'placeholder', 'alt'],
          },
        },
      ],
    },
    settings: {
      'vue-i18n': {
        localeDir: {
          pattern: './src/i18n/locales/*.json',
          localeKey: 'path',
        },
        messageSyntaxVersion: '^9.0.0',
      },
    },
  },
  // Exclude story files from i18n raw-text rule (demo files don't need translations)
  {
    files: ['src/stories/**/*.vue'],
    rules: {
      '@intlify/vue-i18n/no-raw-text': 'off',
    },
  },
  // Exclude node scripts from console checks
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js', 'scripts/**/*.cjs', '*.js', '*.cjs', '_test.ts'],
    rules: {
      'no-console': 'off',
      'node/prefer-global/process': 'off',
      'node/prefer-global/buffer': 'off',
      'antfu/no-top-level-await': 'off',
      'style/max-statements-per-line': 'off',
      'regexp/no-super-linear-backtracking': 'off',
    },
  },
)
