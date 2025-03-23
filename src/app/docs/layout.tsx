import type React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"

import "../globals.css"
import SidebarContainer from "@/components/SidebarContainer"
import DocSearch from "@/components/DocSearch"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Antinature Documentation",
  description: "Documentation for the Antinature Python module",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      <div className="flex min-h-screen">
        <SidebarContainer />
        <div className="flex-1 border-l border-gray-200">
          <header className="sticky top-0 z-10 flex h-16 items-center border-b border-gray-200 bg-white px-6">
            <DocSearch />
            <nav className="ml-auto flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium hover:text-gray-600">
                Home
              </Link>
              <Link href="/docs" className="text-sm font-medium hover:text-gray-600">
                Documentation
              </Link>
              <Link
                href="https://github.com/mukulDeep-01"
                target="_blank"
                className="text-sm font-medium hover:text-gray-600"
              >
                GitHub
              </Link>
            </nav>
          </header>
          <main className="pb-8 pl-8 pr-8 pt-6">
            <div className="mx-auto max-w-4xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}

