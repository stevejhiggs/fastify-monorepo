import { Client, Connection } from '@temporalio/client';

const TEMPORAL_ADDRESS = process.env['TEMPORAL_ADDRESS'] ?? 'localhost:7233';

let clientPromise: Promise<Client> | undefined;

export function getTemporalClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = Connection.connect({ address: TEMPORAL_ADDRESS }).then(
      (connection) => new Client({ connection })
    );
  }
  return clientPromise;
}
