export type UserRole = 'LAWYER' | 'COMMON';

export class User {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
  }): User {
    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.role,
      data.createdAt,
    );
  }
}
