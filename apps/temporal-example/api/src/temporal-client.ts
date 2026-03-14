import { Client, Connection } from '@temporalio/client';

const TEMPORAL_ADDRESS = process.env['TEMPORAL_ADDRESS'] ?? 'localhost:7233';

let client: Client | undefined;

export async function getTemporalClient(): Promise<Client> {
  if (client) return client;

  const connection = await Connection.connect({ address: TEMPORAL_ADDRESS });
  client = new Client({ connection });
  return client;
}
