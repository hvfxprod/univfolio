/**
 * Future server-only school adapter contract:
 * verify(assertion) -> { provider, subject, verifiedAt, academicProfile }
 * Verify the school's signed assertion/API response before returning an identity.
 * Map (provider, subject) to an account UUID with administrator-controlled linking;
 * never use an email or student-number match as proof of identity.
 * This adapter intentionally has no school endpoint or credentials yet.
 */
export const identityProvider = Object.freeze({id:'manual',name:'관리자 수동 승인',connected:false});
export function initIdentityStore(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS external_identities (
    provider TEXT NOT NULL, subject TEXT NOT NULL, account TEXT NOT NULL,
    verified_at TEXT NOT NULL, PRIMARY KEY(provider,subject), UNIQUE(provider,account)
  );`);
}
