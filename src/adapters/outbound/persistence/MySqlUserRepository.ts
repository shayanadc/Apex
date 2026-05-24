import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { User, type NewUserData, type UserId } from '../../../domain/user/User.js';
import { Role } from '../../../domain/user/Role.js';
import { Email } from '../../../domain/user/Email.js';
import type { IUserRepository } from '../../../application/ports/outbound/IUserRepository.js';
import { UserNotFoundError } from '../../../application/errors/UserNotFoundError.js';

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password: string;
  access_token: string | null;
  role: 'USER' | 'ADMIN';
}

const SELECT_USER = 'SELECT id, name, email, password, access_token, role FROM users';

type LookupColumn = 'id' | 'email' | 'access_token';

function rowToUser(row: UserRow): User {
  return User.reconstitute({
    id: row.id,
    name: row.name,
    email: Email.create(row.email),
    password: row.password,
    accessToken: row.access_token ?? '',
    role: Role.from(row.role),
  });
}

export class MySqlUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<User[]> {
    const [rows] = await this.pool.execute<UserRow[]>(SELECT_USER);
    return rows.map(rowToUser);
  }

  findById(id: UserId): Promise<User | null> {
    return this.findOneBy('id', id);
  }

  findByEmail(email: Email): Promise<User | null> {
    return this.findOneBy('email', email.getValue());
  }

  findByHashedToken(hash: string): Promise<User | null> {
    return this.findOneBy('access_token', hash);
  }

  async save(draft: NewUserData): Promise<User> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, access_token, role) VALUES (?, ?, ?, ?, ?)',
      [
        draft.name,
        draft.email.getValue(),
        draft.password,
        draft.accessToken,
        draft.role.getValue(),
      ],
    );

    return User.reconstitute({
      id: result.insertId,
      name: draft.name,
      email: draft.email,
      password: draft.password,
      accessToken: draft.accessToken,
      role: draft.role,
    });
  }

  async update(user: User): Promise<User> {
    const state = user.toState();
    const [result] = await this.pool.execute<ResultSetHeader>(
      'UPDATE users SET name = ?, email = ?, password = ?, access_token = ?, role = ? WHERE id = ?',
      [
        state.name,
        state.email.getValue(),
        state.password,
        state.accessToken,
        state.role.getValue(),
        state.id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new UserNotFoundError(user.getId());
    }

    return user;
  }

  async delete(id: UserId): Promise<void> {
    const [result] = await this.pool.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?', [
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new UserNotFoundError(id);
    }
  }

  private async findOneBy(column: LookupColumn, value: string | number): Promise<User | null> {
    const [rows] = await this.pool.execute<UserRow[]>(`${SELECT_USER} WHERE ${column} = ?`, [
      value,
    ]);
    const row = rows[0];
    return row ? rowToUser(row) : null;
  }
}
