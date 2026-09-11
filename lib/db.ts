import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let client: NeonQueryFunction<false, false> | null = null;

/**
 * Lazily-created Neon client. Resolved on first query so that a missing
 * DATABASE_URL fails at request time instead of breaking the build.
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    client = neon(connectionString);
  }
  return client;
}
