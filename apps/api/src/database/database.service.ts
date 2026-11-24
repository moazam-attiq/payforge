import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { Environment } from '../config/environment';
import * as schema from './schema';

export type PayForgeDatabase = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;
  readonly client: PayForgeDatabase;

  constructor(config: ConfigService<Environment, true>) {
    this.pool = new Pool({
      connectionString: config.getOrThrow('DATABASE_URL'),
      application_name: 'payforge-api',
      max: 10,
      connectionTimeoutMillis: 3_000,
      idleTimeoutMillis: 30_000,
    });
    this.client = drizzle({ client: this.pool, schema });
  }

  async checkConnection(): Promise<void> {
    await this.pool.query('select 1');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
