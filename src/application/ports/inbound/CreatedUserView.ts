import type { UserView } from './UserView.js';

export type CreatedUserView = UserView & {
  access_token: string;
};
