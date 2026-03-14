'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';

export function Demo1Layout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const { settings, setOption } = useSettings();
  const pathname = usePathname();
  const isCreateCourseRoute = pathname.startsWith('/orbit/courses/create');
  const hideHeader = isCreateCourseRoute;
  const hideSidebar = isCreateCourseRoute;

  useEffect(() => {
    const bodyClass = document.body.classList;

    if (settings.layouts.demo1.sidebarCollapse) {
      bodyClass.add('sidebar-collapse');
    } else {
      bodyClass.remove('sidebar-collapse');
    }
  }, [settings]); // Runs only on settings update

  useEffect(() => {
    // Set current layout
    setOption('layout', 'demo1');
  }, [setOption]);

  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add('demo1');

    const timer = setTimeout(() => {
      bodyClass.add('layout-initialized');
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove('demo1');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
      bodyClass.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []); // Runs only once on mount

  useEffect(() => {
    const bodyClass = document.body.classList;

    bodyClass.toggle('sidebar-fixed', !hideSidebar);
    bodyClass.toggle('header-fixed', !hideHeader);

    return () => {
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('header-fixed');
    };
  }, [hideHeader, hideSidebar]);

  return (
    <>
      {!isMobile && !hideSidebar && <Sidebar />}

      <div className="wrapper flex grow flex-col">
        {!hideHeader && <Header />}

        <main className="grow pt-5" role="content">
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}

export default Demo1Layout;
