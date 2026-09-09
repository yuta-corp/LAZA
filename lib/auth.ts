import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

/**
 * Garde-fou de l'espace de modération.
 * Exige une session authentifiée dont les public metadata portent le rôle `admin`
 * (lecture via les session claims — voir types/globals.d.ts).
 * Redirige vers l'accueil sinon, et retourne l'identifiant Clerk du modérateur.
 */
export async function requireAdmin(): Promise<string> {
  const { sessionClaims, userId } = await auth()
  // Non connecté → page de connexion (qui ramène sur /admin après connexion).
  if (!userId) {
    redirect("/sign-in")
  }
  // Connecté mais sans le rôle admin → accueil.
  if (sessionClaims?.metadata?.role !== "admin") {
    redirect("/")
  }
  return userId
}