import type { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { User, type NewUserData, type UserId } from '../../../domain/user/User.js';
import { Role } from '../../../domain/user/Role.js';
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

function rowToUser(row: UserRow): User {
  return User.reconstitute({
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    accessToken: row.access_token ?? '',
    role: Role.from(row.role),
  });
}

export class MySqlUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<User[]> {
    const [rows] = await this.pool.execute<UserRow[]>(
      'SELECT id, name, email, password, access_token, role FROM users',
    );
    return rows.map(rowToUser);
  }

  async findById(id: UserId): Promise<User | null> {
    const [rows] = await this.pool.execute<UserRow[]>(
      'SELECT id, name, email, password, access_token, role FROM users WHERE id = ?',
      [id],
    );
    return rows.length > 0 ? rowToUser(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await this.pool.execute<UserRow[]>(
      'SELECT id, name, email, password, access_token, role FROM users WHERE email = ?',
      [email],
    );
    return rows.length > 0 ? rowToUser(rows[0]) : null;
  }

  async findByHashedToken(hash: string): Promise<User | null> {
    const [rows] = await this.pool.execute<UserRow[]>(
      'SELECT id, name, email, password, access_token, role FROM users WHERE access_token = ?',
      [hash],
    );
    return rows.length > 0 ? rowToUser(rows[0]) : null;
  }

  async save(draft: NewUserData): Promise<User> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password, access_token, role) VALUES (?, ?, ?, ?, ?)',
      [draft.name, draft.email, draft.password, draft.accessToken || null, draft.role.getValue()],
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
        state.email,
        state.password,
        state.accessToken || null,
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
}
