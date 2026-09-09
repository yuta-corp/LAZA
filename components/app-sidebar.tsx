"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle2, ExternalLink, LayoutGrid, ListChecks, Megaphone, XCircle } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navMain = [
    {
      title: "File de modération",
      url: "/admin",
      icon: <ListChecks />,
      isActive: pathname === "/admin",
    },
    {
      title: "Publiés",
      url: "/admin?status=published",
      icon: <CheckCircle2 />,
    },
    {
      title: "Rejetés",
      url: "/admin?status=rejected",
      icon: <XCircle />,
    },
    {
      title: "Tous les signalements",
      url: "/admin?status=all",
      icon: <LayoutGrid />,
    },
  ]

  const navSecondary = [
    { title: "Voir le site", url: "/", icon: <ExternalLink /> },
    { title: "Signaler un fait", url: "/signaler", icon: <Megaphone /> },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!" render={<Link href="/" />}>
              <Image
                src="/log.png"
                alt="Logo Laza"
                width={28}
                height={28}
                className="size-7 rounded-md object-cover"
              />
              <span className="text-base font-semibold">Laza</span>
              <span className="ml-auto text-xs font-normal text-muted-foreground">Modération</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}