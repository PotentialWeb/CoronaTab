module.exports = {
  extends: ['stylelint-config-recommended'],
  rules: {
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'tailwind',
        'apply',
        'variants',
        'responsive',
        'screen',
        'mixin',
        'add-mixin',
        'define-mixin'
      ]
    }],
    'declaration-block-trailing-semicolon': null,
    'no-descending-specificity': null,
    'no-duplicate-selectors': null
  }
}
