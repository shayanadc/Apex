export type Role = 'USER' | 'ADMIN';

export type UserProps = {
  id: number;
  name: string;
  email: string;
  password: string;
  accessToken: string;
  role: Role;
};

export class User {
  private readonly id: number;
  private name: string;
  private email: string;
  private accessToken: string;
  private password: string;
  private role: Role;

  constructor(props: UserProps) {
    if (!Number.isInteger(props.id) || props.id <= 0) {
      throw new Error('User id must be a positive integer');
    }
    if (!props.name?.trim()) {
      throw new Error('User name is required');
    }
    if (!isValidEmail(props.email)) {
      throw new Error('User email is invalid');
    }
    if (props.role !== 'USER' && props.role !== 'ADMIN') {
      throw new Error(`Unknown role: ${props.role}`);
    }
    if (!props.password?.trim()) {
      throw new Error('Password hash is required');
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.email = props.email.trim().toLowerCase();
    this.password = props.password;
    this.accessToken = props.accessToken;
    this.role = props.role;
  }

  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getRole(): Role { return this.role; }


  rename(name: string): void {
    const trimmed = name?.trim();
    if (!trimmed) throw new Error('Name is required');
    if (trimmed === this.name) return;
    this.name = trimmed;
  }

  changeEmail(email: string): void {
    const normalized = email?.trim().toLowerCase();
    if (!normalized || !isValidEmail(normalized)) throw new Error('Invalid email');
    if (normalized === this.email) return;
    this.email = normalized;
  }

  promoteToAdmin(): void {
    if (this.role === 'ADMIN') throw new Error('User is already an admin');
    this.role = 'ADMIN';
  }

  demoteToUser(): void {
    if (this.role === 'USER') throw new Error('User is already a regular user');
    this.role = 'USER';
  }
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw?.trim().toLowerCase() ?? '');
}