import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem {
  title: string;
  href: string;
  items?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
  },
  {
    title: 'Theory',
    href: '/docs/theory',
    items: [
      { title: 'Quantum Framework', href: '/docs/theory/quantum-framework' },
      { title: 'Hamiltonians', href: '/docs/theory/hamiltonians' },
      // Add more as needed
    ],
  },
  {
    title: 'Tutorials',
    href: '/docs/tutorials',
    items: [
      { title: 'Introduction to Antimatter', href: '/docs/tutorials/intro-to-antimatter' },
      // Add more as needed
    ],
  },
  {
    title: 'How-To Guides',
    href: '/docs/howtos',
  },
  {
    title: 'Examples',
    href: '/docs/examples',
  },
  {
    title: 'API Reference',
    href: '/docs/api',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderSidebarItems = (items: SidebarItem[], level = 0) => {
    return items.map((item) => {
      const isActive = pathname === item.href;
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