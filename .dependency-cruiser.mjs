/** @type {import('dependency-cruiser').IConfiguration} */
const config = {
    forbidden: [
        {
            from: {},
            name: 'no-circular',
            severity: 'error',
            to: { circular: true },
        },
        {
            comment:
                'A module nothing imports is dead code, unless Next or Bun loads it by convention.',
            from: {
                orphan: true,
                pathNot: [
                    '(^|/)[.][^/]+[.](?:js|cjs|mjs|ts|json)$',
                    '[.]d[.]ts$',
                    '(^|/)tsconfig[.]json$',
                    '(^|/)(?:eslint|postcss|next)[.]config[.](?:js|cjs|mjs|ts)$',
                    '[.]test[.]tsx?$',
                    '^app/',
                    '^scripts/',
                ],
            },
            name: 'no-orphans',
            severity: 'error',
            to: {},
        },
        {
            comment:
                'Site code ships in the build; the pipeline and scripts run in CI with devDependencies installed.',
            from: {
                path: '^(app|components|lib)/',
                pathNot: '[.]test[.]tsx?$',
            },
            name: 'no-dev-deps-in-site',
            severity: 'error',
            to: { dependencyTypes: ['npm-dev'] },
        },
        {
            comment:
                'The site never reaches the content pipeline (model, GitHub and bucket clients); the pipeline depends on lib, never the reverse.',
            from: { path: '^(app|components|lib)/' },
            name: 'site-does-not-import-pipeline',
            severity: 'error',
            to: { path: '^pipeline/' },
        },
        {
            from: {},
            name: 'not-to-unresolvable',
            severity: 'error',
            to: { couldNotResolve: true },
        },
    ],
    options: {
        doNotFollow: { path: 'node_modules' },
        enhancedResolveOptions: {
            conditionNames: ['import', 'require', 'node', 'default', 'types'],
            exportsFields: ['exports'],
            mainFields: ['module', 'main', 'types', 'typings'],
        },
        exclude: { path: '^([.]next|out)/' },
        tsConfig: { fileName: 'tsconfig.json' },
        tsPreCompilationDeps: true,
    },
}
export default config
