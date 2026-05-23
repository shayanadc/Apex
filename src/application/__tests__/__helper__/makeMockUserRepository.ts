import { vi } from 'vitest';
import type { IUserRepository } from '../../ports/outbound/IUserRepository.js';

export function makeMockUserRepository(overrides: Partial<IUserRepository> = {}): IUserRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findByHashedToken: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}
