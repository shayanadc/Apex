import { Role } from '../../domain/user/Role.js';
import { Email } from '../../domain/user/Email.js';
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

    const { name, email: rawEmail, password, role: rawRole } = command.newUser;

    if (!name?.trim()) {
      throw new InvalidUserError('User name is required');
    }
    if (!password?.trim()) {
      throw new InvalidUserError('Password is required');
    }
    const role = Role.from(rawRole);
    const email = Email.create(rawEmail);

    const emailOwner = await this.userRepository.findByEmail(email);
    if (emailOwner !== null) {
      throw new EmailAlreadyInUseError(email.getValue());
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
      email: user.getEmail().getValue(),
      role: user.getRole().getValue(),
      // The plain token is only available at creation time. After this response is sent,
      // only the hash is stored and there is no way to recover the original value.
      access_token: token.plain,
    };
  }
}
