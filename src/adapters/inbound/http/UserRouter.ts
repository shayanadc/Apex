import { Hono } from 'hono';
import type { ListUsersHandler } from './handlers/ListUsersHandler.js';
import type { GetUserHandler } from './handlers/GetUserHandler.js';
import type { CreateUserHandler } from './handlers/CreateUserHandler.js';
import type { UpdateUserHandler } from './handlers/UpdateUserHandler.js';
import type { DeleteUserHandler } from './handlers/DeleteUserHandler.js';
import type { AuthVariables } from './middleware/AuthMiddleware.js';

type AppEnv = { Variables: AuthVariables };

export class UserRouter {
  private readonly router: Hono<AppEnv>;

  constructor(
    private readonly listUsersHandler: ListUsersHandler,
    private readonly getUserHandler: GetUserHandler,
    private readonly createUserHandler: CreateUserHandler,
    private readonly updateUserHandler: UpdateUserHandler,
    private readonly deleteUserHandler: DeleteUserHandler,
  ) {
    this.router = new Hono<AppEnv>();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/users', (c) => this.listUsersHandler.handle(c));
    this.router.get('/users/:id', (c) => this.getUserHandler.handle(c));
    this.router.post('/users', (c) => this.createUserHandler.handle(c));
    this.router.patch('/users/:id', (c) => this.updateUserHandler.handle(c));
    this.router.delete('/users/:id', (c) => this.deleteUserHandler.handle(c));
  }

  get instance(): Hono<AppEnv> {
    return this.router;
  }
}
