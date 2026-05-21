import { ListUsersHandler } from '../adapters/inbound/http/handlers/ListUsersHandler.js';
import { GetUserHandler } from '../adapters/inbound/http/handlers/GetUserHandler.js';
import { UpdateUserHandler } from '../adapters/inbound/http/handlers/UpdateUserHandler.js';
import { DeleteUserHandler } from '../adapters/inbound/http/handlers/DeleteUserHandler.js';
import { ListUsersUseCase } from '../application/usecases/ListUsersUseCase.js';
import { GetUserUseCase } from '../application/usecases/GetUserUseCase.js';
import { UpdateUserUseCase } from '../application/usecases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../application/usecases/DeleteUserUseCase.js';
import { InMemoryUserRepository } from '../adapters/outbound/persistence/InMemoryUserRepository.js';

/**
 * The wired-up HTTP handlers the router needs to serve requests.
 */
export interface Container {
  listUsersHandler: ListUsersHandler;
  getUserHandler: GetUserHandler;
  updateUserHandler: UpdateUserHandler;
  deleteUserHandler: DeleteUserHandler;
}

/**
 * Composition root — the single place where concrete adapters, use cases,
 * and handlers are instantiated and wired together.
 */
export function createContainer(): Container {
  const repo = new InMemoryUserRepository();

  return {
    listUsersHandler: new ListUsersHandler(new ListUsersUseCase(repo)),
    getUserHandler: new GetUserHandler(new GetUserUseCase(repo)),
    updateUserHandler: new UpdateUserHandler(new UpdateUserUseCase(repo)),
    deleteUserHandler: new DeleteUserHandler(new DeleteUserUseCase(repo)),
  };
}
