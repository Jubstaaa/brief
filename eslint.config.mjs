import js from '@eslint/js'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettierConfig from 'eslint-config-prettier'
import perfectionistPlugin from 'eslint-plugin-perfectionist'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig([
    globalIgnores(['.next', 'out', 'next-env.d.ts']),

    js.configs.recommended,
    ...nextVitals,
    ...nextTypescript,

    {
        extends: [tseslint.configs.recommendedTypeChecked],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    {
        files: ['**/*.{ts,tsx,mjs}'],
        plugins: {
            perfectionist: perfectionistPlugin,
            prettier: prettierPlugin,
            react: reactPlugin,
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            // Core no-unused-vars cannot read TypeScript types: the parameter
            // name in `(ms: number) => void` reads as an unused `ms`.
            '@typescript-eslint/no-unused-vars': 'error',
            'no-console': ['warn', { allow: ['error'] }],
            'no-unused-vars': 'off',
            'perfectionist/sort-imports': [
                'error',
                {
                    customGroups: [
                        {
                            elementNamePattern: [
                                '^react$',
                                '^react-.+',
                                '^next$',
                                '^next/.+',
                            ],
                            groupName: 'framework',
                        },
                    ],
                    environment: 'bun',
                    groups: [
                        'builtin',
                        'framework',
                        'external',
                        'internal',
                        ['parent', 'sibling', 'index'],
                        'unknown',
                    ],
                    ignoreCase: true,
                    internalPattern: ['^@/.+'],
                    newlinesBetween: 1,
                    order: 'asc',
                    type: 'alphabetical',
                },
            ],
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
        // bun:test types `expect(promise).rejects` matchers as returning void,
        // and test fakes stand in for async APIs without awaiting anything.
        files: ['**/*.test.ts'],
        rules: {
            '@typescript-eslint/await-thenable': 'off',
            '@typescript-eslint/require-await': 'off',
        },
    },

    {
        files: ['pipeline/**', 'scripts/**'],
        rules: { 'no-console': 'off' },
    },

    prettierConfig,
])
