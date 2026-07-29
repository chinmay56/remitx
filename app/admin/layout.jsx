'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/admin/login') {
      const isAdmin = localStorage.getItem('adminAuth');
      if (!isAdmin) {
        router.push('/admin/login');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
