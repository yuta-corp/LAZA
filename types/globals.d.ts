export {}

// Augmentation des claims de session Clerk (guide officiel « basic RBAC »).
// Nécessite la personnalisation du session token dans le Dashboard Clerk :
//   Sessions → Customize session token → { "metadata": "{{user.public_metadata}}" }
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "admin" | "moderator"
    }
  }
}