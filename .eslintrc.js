module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:vue/recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/max-attributes-per-line': 'off',
    'no-unused-vars': [2, { args: 'none', ignoreRestSiblings: true, caughtErrors: 'none' }],
    'no-empty': 'off',
    semi: ['error', 'never'], // 去掉行尾分号
    'eol-last': ['error', 'always'], // 文件尾增加新空行
    'comma-dangle': ['error', 'never'], // 拖尾逗号
    'no-trailing-spaces': 'error', // 多余的空格
    quotes: [2, 'single', 'avoid-escape'],
    'space-before-function-paren': 'off',
    // 禁止在计算属性中对属性修改
    'vue/no-side-effects-in-computed-properties': 'off',
    // 属性空格
    'vue/attribute-hyphenation': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/html-self-closing': 'off',
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: true,
      },
    ],
    indent: [
      'off',
      2,
      {
        VariableDeclarator: 'first',
        ObjectExpression: 'first',
      },
    ], // 缩进 2 格
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
}
