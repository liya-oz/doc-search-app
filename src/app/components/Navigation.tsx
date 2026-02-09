'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const navItems = [
    { href: '/', label: 'Search' },
    { href: '/documents', label: 'Documents' },
  ];

  return (
    <nav className="w-full flex justify-center items-center py-4 mb-12 bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl flex items-center justify-between px-4">
        <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 select-none">
          DocSearch
        </span>
        <ul className="flex gap-8">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <li
                key={item.href}
                className="relative flex flex-col items-center"
              >
                <Link
                  href={item.href}
                  className={`text-base font-medium transition-colors duration-150 ${
                    active
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200'
                  }`}
                  style={{ letterSpacing: '0.01em' }}
                >
                  {item.label}
                </Link>
                {active && (
                  <span className="mt-2 w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shadow" />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
