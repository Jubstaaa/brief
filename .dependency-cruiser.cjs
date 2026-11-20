/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            from: {},
            to: { circular: true },
        },
        {
            name: 'no-orphans',
            comment:
                'A module nothing imports is dead code, unless Next or Bun loads it by convention.',
            severity: 'error',
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
            to: {},
        },
        {
            name: 'no-dev-deps-in-site',
            comment:
                'Site code ships in the build; the pipeline and scripts run in CI with devDependencies installed.',
            severity: 'error',
            from: {
                path: '^(app|components|lib)/',
                pathNot: '[.]test[.]tsx?$',
            },
            to: { dependencyTypes: ['npm-dev'] },
        },
        {
            name: 'lib-does-not-import-pipeline',
            comment:
                'lib/ is shared with the site; the pipeline depends on lib, never the reverse.',
            severity: 'error',
            from: { path: '^lib/' },
            to: { path: '^pipeline/' },
        },
        {
            name: 'not-to-unresolvable',
            severity: 'error',
            from: {},
            to: { couldNotResolve: true },
        },
    ],
    options: {
        doNotFollow: { path: 'node_modules' },
        exclude: { path: '^([.]next|out)/' },
        tsPreCompilationDeps: true,
        tsConfig: { fileName: 'tsconfig.json' },
        enhancedResolveOptions: {
            exportsFields: ['exports'],
            conditionNames: ['import', 'require', 'node', 'default', 'types'],
            mainFields: ['module', 'main', 'types', 'typings'],
        },
    },
}
