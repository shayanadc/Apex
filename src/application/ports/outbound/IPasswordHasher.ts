/**
 * Outbound port for password hashing. Keeps the algorithm out of the
 * domain and application layers — they only know that hashing happens.
 */
export interface IPasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
}
