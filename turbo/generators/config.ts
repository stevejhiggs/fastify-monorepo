import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { PlopTypes } from '@turbo/gen';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('temporal-app', {
    description: 'Generate a Temporal app with API, worker, and shared workflows package',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of this Temporal app? (e.g. order-processing)',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Name is required';
          }
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Name must be kebab-case (lowercase letters, numbers, and hyphens)';
          }
          return true;
        }
      }
    ],
    actions: () => {
      const appDir = `apps/{{ name }}`;

      // All templates live under tooling/templates/
      const templates = '../../tooling/templates';
      const apiTemplate = `${templates}/api`;
      const pkgTemplate = `${templates}/package`;
      const temporalTemplate = `${templates}/temporal-app`;

      const actions: PlopTypes.Actions = [
        // --- Top-level app docs ---
        {
          type: 'add',
          path: `${appDir}/README.md`,
          templateFile: `${temporalTemplate}/README.md.hbs`
        },
        {
          type: 'add',
          path: `${appDir}/claude.md`,
          templateFile: `${temporalTemplate}/claude.md.hbs`
        },

        // --- Shared workflows package ---
        {
          type: 'add',
          path: `${appDir}/packages/workflows/package.json`,
          templateFile: `${temporalTemplate}/packages/workflows/package.json.hbs`
        },
        {
          type: 'add',
          path: `${appDir}/packages/workflows/tsconfig.json`,
          templateFile: `${pkgTemplate}/tsconfig.json`
        },
        {
          type: 'add',
          path: `${appDir}/packages/workflows/src/index.ts`,
          templateFile: `${temporalTemplate}/packages/workflows/src/index.ts.hbs`
        },
        {
          type: 'add',
          path: `${appDir}/packages/workflows/src/example-workflow.ts`,
          templateFile: `${temporalTemplate}/packages/workflows/src/example-workflow.ts`
        },
        {
          type: 'add',
          path: `${appDir}/packages/workflows/src/activities.ts`,
          templateFile: `${temporalTemplate}/packages/workflows/src/activities.ts`
        },

        // --- Worker ---
        {
          type: 'add',
          path: `${appDir}/worker/package.json`,
          templateFile: `${temporalTemplate}/worker/package.json.hbs`
        },
        {
          type: 'add',
          path: `${appDir}/worker/tsconfig.json`,
          templateFile: `${pkgTemplate}/tsconfig.json`
        },
        {
          type: 'add',
          path: `${appDir}/worker/src/index.ts`,
          templateFile: `${temporalTemplate}/worker/src/index.ts.hbs`
        },
        {
          type: 'add',
          path: `${appDir}/worker/src/workflows.ts`,
          templateFile: `${temporalTemplate}/worker/src/workflows.ts.hbs`
        },

        // --- API (reuse static files from tooling/templates/api) ---
        {
          type: 'add',
          path: `${appDir}/api/package.json`,
          templateFile: `${temporalTemplate}/api/package.json.hbs`
        },
        {
          type: 'add',
          path: `${appDir}/api/tsconfig.json`,
          templateFile: `${apiTemplate}/tsconfig.json`
        },
        {
          type: 'add',
          path: `${appDir}/api/tsdown.config.ts`,
          templateFile: `${apiTemplate}/tsdown.config.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/vitest.config.mts`,
          templateFile: `${apiTemplate}/vitest.config.mts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/index.ts`,
          templateFile: `${apiTemplate}/src/index.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/listener.ts`,
          templateFile: `${apiTemplate}/src/listener.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/server.ts`,
          templateFile: `${apiTemplate}/src/server.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/telemetry.ts`,
          templateFile: `${apiTemplate}/src/telemetry.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/temporal-client.ts`,
          templateFile: `${temporalTemplate}/api/src/temporal-client.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/routes/route-registry.ts`,
          templateFile: `${temporalTemplate}/api/src/routes/route-registry.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/routes/health/route.ts`,
          templateFile: `${apiTemplate}/src/routes/health/route.ts`
        },
        {
          type: 'add',
          path: `${appDir}/api/src/routes/example-workflow/route.ts`,
          templateFile: `${temporalTemplate}/api/src/routes/example-workflow/route.ts.hbs`
        },

        // --- Update pnpm-workspace.yaml ---
        async (answers) => {
          const name = (answers as { name: string }).name;
          const workspaceFile = join(plop.getDestBasePath(), 'pnpm-workspace.yaml');
          const content = readFileSync(workspaceFile, 'utf-8');

          const newGlobs = [`  - apps/${name}/*`, `  - apps/${name}/packages/*`];

          if (content.includes(`- apps/${name}/*`)) {
            return 'Workspace globs already present';
          }

          const lines = content.split('\n');
          let lastAppsIndex = -1;
          for (let i = 0; i < lines.length; i++) {
            if (lines[i]?.trimStart().startsWith('- apps/')) {
              lastAppsIndex = i;
            }
          }

          if (lastAppsIndex === -1) {
            return 'Could not find apps/* entries in pnpm-workspace.yaml';
          }

          lines.splice(lastAppsIndex + 1, 0, ...newGlobs);
          writeFileSync(workspaceFile, lines.join('\n'));

          return `Added workspace globs for apps/${name}`;
        }
      ];

      return actions;
    }
  });
}
