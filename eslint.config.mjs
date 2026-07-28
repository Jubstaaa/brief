import js from '@eslint/js'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    { ignores: ['node_modules', '.next', 'out', 'data', 'next-env.d.ts'] },

    js.configs.recommended,
    ...nextVitals,
    ...nextTypescript,

    {
        files: ['**/*.{ts,tsx,mjs}'],
        plugins: {
            import: importPlugin,
            perfectionist: perfectionistPlugin,
            prettier: prettierPlugin,
            react: reactPlugin,
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            'import/order': [
                'error',
                {
                    'alphabetize': { caseInsensitive: true, order: 'asc' },
                    'groups': [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always',
                    'pathGroups': [
                        {
                            group: 'external',
                            pattern: 'react',
                            position: 'before',
                        },
                        {
                            group: 'external',
                            pattern: 'react-*',
                            position: 'before',
                        },
                        {
                            group: 'external',
                            pattern: 'next',
                            position: 'before',
                        },
                        {
                            group: 'external',
                            pattern: 'next/**',
                            position: 'before',
                        },
                        {
                            group: 'internal',
                            pattern: '@/**',
                            position: 'after',
                        },
                    ],
                    'pathGroupsExcludedImportTypes': ['react', 'next'],
                },
            ],
            'no-console': ['warn', { allow: ['error'] }],
            'no-unused-vars': 'error',
            'perfectionist/sort-interfaces': [
                'error',
                {
                    customGroups: [
                        {
                            elementNamePattern: '^(id|uuid)$',
                            groupName: 'identity',
                        },
                        {
                            elementNamePattern: '^on[A-Z]',
                            groupName: 'callbacks',
                        },
                    ],
                    groups: ['identity', 'unknown', 'callbacks'],
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'perfectionist/sort-named-imports': [
                'warn',
                { order: 'asc', type: 'alphabetical' },
            ],
            'perfectionist/sort-object-types': [
                'error',
                {
                    customGroups: [
                        {
                            elementNamePattern: '^(id|uuid)$',
                            groupName: 'identity',
                        },
                        {
                            elementNamePattern: '^on[A-Z]',
                            groupName: 'callbacks',
                        },
                    ],
                    groups: ['identity', 'unknown', 'callbacks'],
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'perfectionist/sort-objects': [
                'warn',
                {
                    customGroups: [
                        {
                            elementNamePattern: '^on[A-Z]',
                            groupName: 'callbacks',
                        },
                    ],
                    groups: ['unknown', 'callbacks'],
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
            'prettier/prettier': 'error',
            'react/jsx-sort-props': [
                'warn',
                {
                    callbacksLast: true,
                    ignoreCase: true,
                    locale: 'auto',
                    multiline: 'last',
                    reservedFirst: ['key', 'ref'],
                    shorthandFirst: true,
                    shorthandLast: false,
                },
            ],
        },
        settings: { react: { version: '19.2' } },
    },

    {
        files: ['**/*.types.ts', '**/*.types.tsx', '**/*.d.ts'],
        rules: { 'no-unused-vars': 'off' },
    },

    {
        files: ['lib/pipeline/**', 'scripts/**'],
        rules: { 'no-console': 'off' },
    },

    prettierConfig
)
