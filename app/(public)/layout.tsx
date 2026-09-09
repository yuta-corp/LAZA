import { NavLeft } from "@/components/nav-left"
import { TrendsPanel } from "@/components/trends-panel"
import { Header } from "@/components/header"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Barre supérieure, visible uniquement sur mobile */}
      <div className="md:hidden">
        <Header />
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1">
        {/* Sidebar gauche — navigation (desktop) */}
        <NavLeft />

        {/* Fil central */}
        <main className="min-w-0 flex-1 border-x border-border md:max-w-2xl lg:max-w-[600px]">
          {children}
        </main>

        {/* Sidebar droite — tendances (grands écrans) */}
        <TrendsPanel />
      </div>
    </>
  )
}