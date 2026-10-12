import Link from "next/link"
import { ClerkProvider } from "@clerk/nextjs"
import { Logo } from "@/components/logo"

/**
 * Habillage des écrans Clerk (connexion, inscription) aux couleurs de Laza :
 * même fond, même typographie et même accent teal que le reste du produit.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#006575",
          borderRadius: "0.5rem",
          fontFamily: "var(--font-sans)",
        },
      }}
    >
      <div className="flex min-h-svh flex-col bg-canvas-tint">
        <header className="flex h-16 items-center border-b border-hairline bg-white px-5">
          <Logo href="/" size={40} />
          <Link
            href="/fil"
            className="ml-auto text-[14px] font-medium text-teal-deep underline-offset-4 hover:underline"
          >
            Registre public
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10">
          {children}
        </main>
      </div>
    </ClerkProvider>
  )
}
