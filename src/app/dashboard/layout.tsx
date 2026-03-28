import React from 'react';
import { auth } from '@/auth';
import AppSidebar from "@/components/dashboard/AppSidebar";

import { redirect } from 'next/navigation';
import { getSidebarItemsForRole } from '@/lib/rbac';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.isActive === false) {
    redirect('/auth/login');
  }

  const role = session.user.role;
  const sidebarItems = getSidebarItemsForRole(role);

  return (
    <div className="h-screen bg-elite-black font-sans flex overflow-hidden">
      <AppSidebar
        name={session.user.name}
        role={session.user.role}
        items={sidebarItems}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
