import "dotenv/config"

/**
 * Promeut un utilisateur Clerk au rôle `admin` (public metadata).
 * Usage : pnpm db:promote user@example.com
 *
 * NB : après la promotion, l'utilisateur doit se reconnecter pour que ses
 * session claims (et donc le lien « Modération ») reflètent le nouveau rôle.
 */
const email = process.argv[2]

if (!email) {
  console.error("Usage : pnpm db:promote <email>")
  process.exit(1)
}

const secretKey = process.env.CLERK_SECRET_KEY
if (!secretKey) {
  console.error("CLERK_SECRET_KEY manquante (doit être présente dans .env.local).")
  process.exit(1)
}

const API = "https://api.clerk.com/v1"

const search = await fetch(`${API}/users?email_address=${encodeURIComponent(email)}`, {
  headers: { Authorization: `Bearer ${secretKey}` },
})
if (!search.ok) {
  console.error(`Recherche d'utilisateur impossible (HTTP ${search.status}).`)
  process.exit(1)
}

const { data } = (await search.json()) as { data?: Array<{ id: string }> }
const user = data?.[0]
if (!user) {
  console.error(`Aucun utilisateur Clerk avec l'email : ${email}`)
  process.exit(1)
}

const res = await fetch(`${API}/users/${user.id}/metadata`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ public_metadata: { role: "admin" } }),
})

if (!res.ok) {
  console.error(`Promotion impossible (HTTP ${res.status}).`)
  process.exit(1)
}

console.log(`✔ ${email} promu admin. Il doit se reconnecter pour rafraîchir ses session claims.`)