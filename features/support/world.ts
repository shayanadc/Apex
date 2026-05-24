import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { Pool } from 'mysql2/promise';

export interface UserSlot {
  id: number;
  plainToken: string;
}

export class AppWorld extends World {
  pool!: Pool;
  adminToken: string = '';
  adminId: number = 0;
  lastResponse: Response | undefined;
  lastCreatedUserId: number = 0;
  lastCreatedUserToken: string = '';
  users: Map<string, UserSlot> = new Map();

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(AppWorld);
