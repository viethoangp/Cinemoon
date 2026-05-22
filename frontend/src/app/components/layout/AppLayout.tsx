import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { NotificationComponent } from './NotificationComponent';

export const AppLayout = () => {
  return (
    <div
      className="flex flex-col bg-[#121212]"
      style={{ fontFamily: 'Inter, sans-serif', height: '100vh', overflow: 'hidden' }}
    >
      <Navbar />
      <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <Outlet />
      </main>
      <NotificationComponent />
    </div>
  );
};
