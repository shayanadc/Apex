import type { UserView } from './UserView.js';

export type CreatedUserView = UserView & {
  readonly access_token: string;
};
