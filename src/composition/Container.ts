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
import { InMemoryUserRepository } from '../adapters/outbound/persistence/InMemoryUserRepository.js';
import { MySqlUserRepository } from '../adapters/outbound/persistence/MySqlUserRepository.js';
import { ScryptPasswordHasher } from '../adapters/outbound/crypto/ScryptPasswordHasher.js';
import { Sha256TokenIssuer } from '../adapters/outbound/crypto/Sha256TokenIssuer.js';
import { createMysqlPool } from '../infrastructure/db/createMysqlPool.js';
import type { IUserRepository } from '../application/ports/outbound/IUserRepository.js';
import type { IPasswordHasher } from '../application/ports/outbound/IPasswordHasher.js';
import type { ITokenIssuer } from '../application/ports/outbound/ITokenIssuer.js';
import type { Pool } from 'mysql2/promise';

export interface ContainerOverrides {
  userRepository?: IUserRepository;
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

  private readonly pool: Pool | null;

  constructor(overrides: ContainerOverrides = {}) {
    if (overrides.userRepository) {
      this.userRepository = overrides.userRepository;
      this.pool = null;
    } else if (process.env.DB_ENGINE === 'mysql') {
      this.pool = createMysqlPool();
      this.userRepository = new MySqlUserRepository(this.pool);
    } else {
      this.userRepository = new InMemoryUserRepository();
      this.pool = null;
    }

    this.passwordHasher = overrides.passwordHasher ?? new ScryptPasswordHasher();
    this.tokenIssuer = overrides.tokenIssuer ?? new Sha256TokenIssuer();

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

  async dispose(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
