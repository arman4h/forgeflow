import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { HomeView } from '../home/HomeView';
import { MySpaceView } from '../myspace/MySpaceView';
import { SpaceDetailView } from '../space/SpaceDetailView';
import { JoinPreviewPage } from '../invites/JoinPreviewPage';
import { WelcomeToSpace } from '../invites/WelcomeToSpace';
import { SettingsView } from '../settings/SettingsView';
import { CreateSpaceModal } from '../modals/CreateSpaceModal';
import { JoinSpaceModal } from '../modals/JoinSpaceModal';
import { InviteMembersModal } from '../modals/InviteMembersModal';
import { CreateTaskModal } from '../modals/CreateTaskModal';
import { UploadFileModal } from '../modals/UploadFileModal';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { CommandPalette } from '../CommandPalette';

const SidebarSkeleton: React.FC = () => (
  <div className="w-[264px] h-screen flex-shrink-0 bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
    <div className="h-8 w-full bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
    <div className="h-8 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
    <div className="h-8 w-5/6 bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
    <div className="h-8 w-2/3 bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
    <div className="h-8 w-full bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
  </div>
);

const ContentSkeleton: React.FC = () => (
  <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white dark:bg-black">
    <div className="h-14 w-full border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 gap-4">
      <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
      <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
      <div className="h-6 w-20 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
    </div>
    <main className="flex-1 p-8 space-y-6 overflow-y-auto">
      <div className="h-10 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
      <div className="h-4 w-96 bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3 mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded-md animate-pulse" />
        ))}
      </div>
    </main>
  </div>
);

export const AppLayout: React.FC = () => {
  const { currentRoute, justJoinedSpace, spaces, isAuthenticated } = useApp();

  const isLoadingData = isAuthenticated && spaces.length === 0;

  if (isLoadingData) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans antialiased">
        <SidebarSkeleton />
        <ContentSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white dark:bg-black">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Route View Canvas */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-black custom-scrollbar">
          {currentRoute === 'home' && <HomeView />}
          {currentRoute === 'my_space' && <MySpaceView />}
          {currentRoute === 'space_detail' && <SpaceDetailView />}
          {currentRoute === 'join_preview' && <JoinPreviewPage />}
          {currentRoute === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Welcome overlay after joining a space */}
      {justJoinedSpace && <WelcomeToSpace />}

      {/* Modals & Dialogs */}
      <CreateSpaceModal />
      <JoinSpaceModal />
      <InviteMembersModal />
      <CreateTaskModal />
      <UploadFileModal />
      <TaskDetailModal />
      <CommandPalette />
    </div>
  );
};
