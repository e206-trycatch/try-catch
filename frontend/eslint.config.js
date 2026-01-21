import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      // Prettier와 충돌하는 ESLint 규칙을 꺼주는 설정 (가장 마지막에 와야 함)
      eslintConfigPrettier, 
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      
      // 1. Prettier 규칙을 ESLint 에러로 표시 (포맷팅 안 맞으면 빨간줄)
      'prettier/prettier': 'warn',

      // 2. 개발 속도를 위해 완화한 규칙들 (Error -> Warn)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // 변수 선언해놓고 안 쓰면 에러나는데, 개발 중엔 그럴 수 있으므로 '경고'로 낮춤
      '@typescript-eslint/no-unused-vars': 'warn',
      
      // 급할 때 'any' 타입 쓸 수 있게 에러 대신 '경고' 처리
      '@typescript-eslint/no-explicit-any': 'warn', 
      
      // console.log 남겨도 빌드 에러 안 나게 (배포 땐 지우는 게 좋지만 일단 허용)
      'no-console': 'off',
    },
  },
);