import { ListUsersHandler } from '../adapters/inbound/http/handlers/ListUsersHandler.js';
import { GetUserHandler } from '../adapters/inbound/http/handlers/GetUserHandler.js';
import { CreateUserHandler } from '../adapters/inbound/http/handlers/CreateUserHandler.js';
import { UpdateUserHandler } from '../adapters/inbound/http/handlers/UpdateUserHandler.js';
import { DeleteUserHandler } from '../adapters/inbound/http/handlers/DeleteUserHandler.js';
import { ListUsersUseCase } from '../application/usecases/ListUsersUseCase.js';
import { GetUserUseCase } from '../application/usecases/GetUserUseCase.js';
import { CreateUserUseCase } from '../application/usecases/CreateUserUseCase.js';
import { UpdateUserUseCase } from '../application/usecases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../application/usecases/DeleteUserUseCase.js';
import { ScryptPasswordHasher } from '../adapters/outbound/crypto/ScryptPasswordHasher.js';
import { Sha256TokenIssuer } from '../adapters/outbound/crypto/Sha256TokenIssuer.js';
import type { IUserRepository } from '../application/ports/outbound/IUserRepository.js';
import type { IPasswordHasher } from '../application/ports/outbound/IPasswordHasher.js';
import type { ITokenIssuer } from '../application/ports/outbound/ITokenIssuer.js';

export interface ContainerDependencies {
  userRepository: IUserRepository;
  passwordHasher?: IPasswordHasher;
  tokenIssuer?: ITokenIssuer;
}

export class Container {
  readonly userRepository: IUserRepository;
  readonly passwordHasher: IPasswordHasher;
  readonly tokenIssuer: ITokenIssuer;

  readonly listUsers: ListUsersUseCase;
  readonly getUser: GetUserUseCase;
  readonly createUser: CreateUserUseCase;
  readonly updateUser: UpdateUserUseCase;
  readonly deleteUser: DeleteUserUseCase;

  readonly listUsersHandler: ListUsersHandler;
  readonly getUserHandler: GetUserHandler;
  readonly createUserHandler: CreateUserHandler;
  readonly updateUserHandler: UpdateUserHandler;
  readonly deleteUserHandler: DeleteUserHandler;

  constructor(deps: ContainerDependencies) {
    this.userRepository = deps.userRepository;
    this.passwordHasher = deps.passwordHasher ?? new ScryptPasswordHasher();
    this.tokenIssuer = deps.tokenIssuer ?? new Sha256TokenIssuer();

    this.listUsers = new ListUsersUseCase(this.userRepository);
    this.getUser = new GetUserUseCase(this.userRepository);
    this.createUser = new CreateUserUseCase(
      this.userRepository,
      this.passwordHasher,
      this.tokenIssuer,
    );
    this.updateUser = new UpdateUserUseCase(this.userRepository);
    this.deleteUser = new DeleteUserUseCase(this.userRepository);

    this.listUsersHandler = new ListUsersHandler(this.listUsers);
    this.getUserHandler = new GetUserHandler(this.getUser);
    this.createUserHandler = new CreateUserHandler(this.createUser);
    this.updateUserHandler = new UpdateUserHandler(this.updateUser);
    this.deleteUserHandler = new DeleteUserHandler(this.deleteUser);
  }
}
