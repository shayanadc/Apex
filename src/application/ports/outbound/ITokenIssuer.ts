/**
 * Outbound port for access tokens. Single source of truth for both
 * minting a new token and hashing an incoming one — so the issuance
 * side (use case) and the verification side (auth middleware) can never
 * drift apart on algorithm choice.
 */
export interface ITokenIssuer {
  /** Returns the plain token (shown to the client once) and its persisted hash. */
  issue(): IssuedToken;
  /** Hashes a plain token using the same scheme as `issue` — used for verification. */
  hash(plain: string): string;
}

export type IssuedToken = {
  readonly plain: string;
  readonly hash: string;
};
