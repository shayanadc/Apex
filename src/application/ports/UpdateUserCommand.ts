export type UpdateUserCommand = {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN';
};
