export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // enforce lowercase subject
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    // max header length
    'header-max-length': [2, 'always', 100],
    // allowed types
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation
        'style', // formatting, missing semicolons, etc.
        'refactor', // code change that neither fixes a bug nor adds a feature
        'perf', // performance improvement
        'test', // adding or updating tests
        'build', // build system or external dependencies
        'ci', // CI configuration
        'chore', // maintenance
        'revert', // revert a previous commit
        'i18n', // internationalization
        'ui', // UI/styling changes
      ],
    ],
  },
}
