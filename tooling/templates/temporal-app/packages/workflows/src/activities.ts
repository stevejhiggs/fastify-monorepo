import { log } from '@temporalio/activity';

export async function processInput(input: string): Promise<string> {
  log.info('Running processInput activity', { input });
  return `Processed: ${input}`;
}

export async function formatOutput(data: string): Promise<string> {
  log.info('Running formatOutput activity', { data });
  return data.toUpperCase();
}
