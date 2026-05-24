import { Role } from '../../domain/user/Role.js';
import { EmailAlreadyInUseError } from '../../domain/user/errors/EmailAlreadyInUseError.js';
import { InvalidUserError } from '../../domain/user/errors/InvalidUserError.js';
import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { IPasswordHasher } from '../ports/outbound/IPasswordHasher.js';
import type { ITokenIssuer } from '../ports/outbound/ITokenIssuer.js';
import type { CreateUserCommand } from '../ports/inbound/CreateUserCommand.js';
import type { CreatedUserView } from '../ports/inbound/CreatedUserView.js';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenIssuer: ITokenIssuer,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreatedUserView> {
    command.actor.assertCanCreateUsers();

    const { name, email, password, role: rawRole } = command.newUser;

    if (!password?.trim()) {
      throw new InvalidUserError('Password is required');
    }
    const role = Role.from(rawRole);

    const emailOwner = await this.userRepository.findByEmail(email?.trim().toLowerCase() ?? '');
    if (emailOwner !== null) {
      throw new EmailAlreadyInUseError(email);
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const token = this.tokenIssuer.issue();

    const user = await this.userRepository.save({
      name,
      email,
      password: passwordHash,
      accessToken: token.hash,
      role,
    });

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      role: user.getRole().getValue(),
      access_token: token.plain,
    };
  }
}
