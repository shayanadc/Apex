import { ListUsersHandler } from '../adapters/inbound/http/handlers/ListUsersHandler.js';
import { GetUserHandler } from '../adapters/inbound/http/handlers/GetUserHandler.js';
import { UpdateUserHandler } from '../adapters/inbound/http/handlers/UpdateUserHandler.js';
import { DeleteUserHandler } from '../adapters/inbound/http/handlers/DeleteUserHandler.js';
import { ListUsersUseCase } from '../application/usecases/ListUsersUseCase.js';
import { GetUserUseCase } from '../application/usecases/GetUserUseCase.js';
import { UpdateUserUseCase } from '../application/usecases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../application/usecases/DeleteUserUseCase.js';
import { InMemoryUserRepository } from '../adapters/outbound/persistence/InMemoryUserRepository.js';
import type { IUserRepository } from '../application/ports/outbound/IUserRepository.js';

export interface ContainerOverrides {
  userRepository?: IUserRepository;
}

export class Container {
  readonly userRepository: IUserRepository;

  readonly listUsers: ListUsersUseCase;
  readonly getUser: GetUserUseCase;
  readonly updateUser: UpdateUserUseCase;
  readonly deleteUser: DeleteUserUseCase;

  readonly listUsersHandler: ListUsersHandler;
  readonly getUserHandler: GetUserHandler;
  readonly updateUserHandler: UpdateUserHandler;
  readonly deleteUserHandler: DeleteUserHandler;

  constructor(overrides: ContainerOverrides = {}) {
    this.userRepository = overrides.userRepository ?? new InMemoryUserRepository();

    this.listUsers = new ListUsersUseCase(this.userRepository);
    this.getUser = new GetUserUseCase(this.userRepository);
    this.updateUser = new UpdateUserUseCase(this.userRepository);
    this.deleteUser = new DeleteUserUseCase(this.userRepository);

    this.listUsersHandler = new ListUsersHandler(this.listUsers);
    this.getUserHandler = new GetUserHandler(this.getUser);
    this.updateUserHandler = new UpdateUserHandler(this.updateUser);
    this.deleteUserHandler = new DeleteUserHandler(this.deleteUser);
  }
}
