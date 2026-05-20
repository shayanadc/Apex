export type UserProps = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  accessToken: string;
};

export class User {
  private readonly id: number;
  private readonly name: string;
  private readonly email: string;
  private readonly password: string;
  private readonly role: 'USER' | 'ADMIN';
  private readonly accessToken: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.accessToken = props.accessToken;
  }

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getPassword(): string {
    return this.password;
  }

  getRole(): 'USER' | 'ADMIN' {
    return this.role;
  }

  getAccessToken(): string {
    return this.accessToken;
  }
}
