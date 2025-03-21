'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  title: string;
  href: string;
  items?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Overview',
    href: '/docs/overview',
  },
  
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
  },
  {
    title: 'Theory',
    href: '/docs/theory',
  },
  {
    title: 'Tutorials',
    href: '/docs/Tutorials',
    items: [
      { title: '1. Introduction to Antimatter', href: '/tutorials/01_intro_to_antimatter' },
      { title: '2. Working with Positronium', href: '/tutorials/02_working_with_positronium' },
      { title: '3. Advanced Basis Sets', href: '/tutorials/03_advanced_basis_sets' },
      { title: '4. Relativistic Effects', href: '/tutorials/04_relativistic_effects' },
      { title: '5. Quantum Computing', href: '/tutorials/05_quantum_computing' },
    ],
  },
  {
    title: 'Examples',
    href: '/docs/examples',
    items: [
      { title: '1. HeH System', href: '/examples/01_heh' },
      { title: '2. LiH System', href: '/examples/02_lih' },
      { title: '3. Complex Molecules', href: '/examples/03_complex_molecule' },
      { title: '4. Hydrogen', href: '/examples/04_hydrogen' },
      { title: '5. Positronium ESE', href: '/examples/05_positronium_ese' },
      { title: '6. Positronium GSE', href: '/examples/06_positronium_gse' },
      { title: '7. Annihilation Rates', href: '/examples/07_anhilation_rates' },
    ],
  },
  {
    title: 'How-To Guides',
    href: '/docs/howtos',
  },
  {
    title:'Contributor Guide',
    href: '/docs/contibuterguide',
  },
  {
    title:'Release Notes',
    href: '/docs/releasenotes',
  },
  
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderSidebarItems = (items: SidebarItem[], level = 0) => {
    return items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
      const hasChildren = item.items && item.items.length > 0;
      
      return (
        <div key={item.href} className={`pl-${level * 4}`}>
          <Link 
            href={item.href}
            className={`block py-2 px-4 rounded-md ${
              isActive 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {item.title}
          </Link>
          
          {hasChildren && (
            <div className="ml-4 border-l border-gray-200 dark:border-gray-700">
              {renderSidebarItems(item.items!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <nav className="w-64 pr-8 py-4">
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">Antinature</h3>
      </div>
      <div className="space-y-1">
        {renderSidebarItems(sidebarItems)}
      </div>
    </nav>
  );
}