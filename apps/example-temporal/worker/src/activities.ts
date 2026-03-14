import { log } from '@temporalio/activity';

export async function greet(name: string): Promise<string> {
  log.info('Running greet activity', { name });
  return `Hello, ${name}!`;
}

export async function formatGreeting(greeting: string, style: 'uppercase' | 'lowercase'): Promise<string> {
  log.info('Running formatGreeting activity', { style });

  // Simulate some async work
  await new Promise((resolve) => setTimeout(resolve, 100));

  return style === 'uppercase' ? greeting.toUpperCase() : greeting.toLowerCase();
}
