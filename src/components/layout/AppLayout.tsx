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

export const AppLayout: React.FC = () => {
  const { currentRoute, justJoinedSpace } = useApp();

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
