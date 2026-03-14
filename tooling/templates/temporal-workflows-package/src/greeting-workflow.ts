import { proxyActivities } from '@temporalio/workflow';

import type * as activities from './activities.ts';

const { greet, formatGreeting } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30 seconds',
  retry: {
    maximumAttempts: 3
  }
});

export async function greetingWorkflow(name: string, style: 'uppercase' | 'lowercase' = 'uppercase'): Promise<string> {
  const greeting = await greet(name);
  const formatted = await formatGreeting(greeting, style);
  return formatted;
}
