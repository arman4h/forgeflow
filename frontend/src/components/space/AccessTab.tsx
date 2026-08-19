import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Crown, Wrench, User, ChevronRight, X, UserMinus } from 'lucide-react';
import type { SpaceRole, SpaceSettings } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const ROLE_CONFIG: Record<SpaceRole, { label: string; icon: React.ReactNode; color: string; description: string }> = {
  owner: {
    label: 'Owner',
    icon: <Crown className="w-4 h-4 text-amber-500" />,
    color: 'text-amber-600 dark:text-amber-400',
    description: 'Full control over the workspace',
  },
  manager: {
    label: 'Manager',
    icon: <Wrench className="w-4 h-4 text-cyan-500" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    description: 'Can manage tasks, invite members, and edit work',
  },
  member: {
    label: 'Member',
    icon: <User className="w-4 h-4 text-zinc-500" />,
    color: 'text-zinc-600 dark:text-zinc-400',
    description: 'Can work on assigned tasks and comment',
  },
};

export const AccessTab: React.FC = () => {
  const {
    currentSpace,
    currentUser,
    getSpaceMembers,
    getSpaceRole,
    getSpaceSettings,
    updateMemberRole,
    updateSpaceSettings,
    users,
  } = useApp();

  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<SpaceRole>('member');

  if (!currentSpace) return null;

  const myRole = getSpaceRole(currentSpace.id);
  const settings = getSpaceSettings(currentSpace.id);
  const members = getSpaceMembers(currentSpace.id);
  const isOwner = myRole === 'owner';

  const handleRoleChange = (userId: string, newRole: SpaceRole) => {
    updateMemberRole(currentSpace.id, userId, newRole);
    setEditingMember(null);
  };

  const handleSettingChange = (key: keyof SpaceSettings, value: any) => {
    updateSpaceSettings(currentSpace.id, { [key]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Access</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Control who can manage this workspace.
          </p>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Members ({members.length})
        </h3>
        <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {members.map(member => {
            const roleInfo = ROLE_CONFIG[member.role];
            const isEditing = editingMember === member.userId;
            const isCurrentUser = member.userId === currentUser.id;

            return (
              <div key={member.userId} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                    {member.user?.avatar ? (
                      <img src={member.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (member.user?.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      {member.user?.name || 'Unknown'}
                      {isCurrentUser && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">(you)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {member.user?.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      {(['owner', 'manager', 'member'] as SpaceRole[]).map(role => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(member.userId, role)}
                          disabled={role === 'owner' && member.role === 'owner'}
                          className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-colors cursor-pointer ${
                            editingRole === role
                              ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300'
                              : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                          } ${role === 'owner' && member.role === 'owner' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {ROLE_CONFIG[role].icon}
                          <span className="ml-1">{ROLE_CONFIG[role].label}</span>
                        </button>
                      ))}
                      <button
                        onClick={() => setEditingMember(null)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingMember(member.userId);
                        setEditingRole(member.role);
                      }}
                      disabled={!isOwner || member.role === 'owner'}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md border transition-colors ${
                        isOwner && member.role !== 'owner'
                          ? 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-default'
                      }`}
                    >
                      {roleInfo.icon}
                      <span className={roleInfo.color}>{roleInfo.label}</span>
                      {isOwner && member.role !== 'owner' && (
                        <ChevronRight className="w-3 h-3 text-zinc-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Permissions */}
      {isOwner && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Workspace Permissions
          </h3>
          <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {/* Who can create tasks */}
            <div className="p-3.5">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Who can create tasks?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSettingChange('members_can_create_tasks', false)}
                  className={`flex-1 px-3 py-2 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                    !settings.members_can_create_tasks
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300'
                      : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Managers only
                </button>
                <button
                  onClick={() => handleSettingChange('members_can_create_tasks', true)}
                  className={`flex-1 px-3 py-2 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                    settings.members_can_create_tasks
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300'
                      : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Managers + Members
                </button>
              </div>
            </div>

            {/* Who can edit task details */}
            <div className="p-3.5">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Who can edit task details?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSettingChange('who_can_edit_task_details', 'managers_only')}
                  className={`flex-1 px-3 py-2 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                    settings.who_can_edit_task_details === 'managers_only'
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300'
                      : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Managers only
                </button>
                <button
                  onClick={() => handleSettingChange('who_can_edit_task_details', 'assignee_and_managers')}
                  className={`flex-1 px-3 py-2 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                    settings.who_can_edit_task_details === 'assignee_and_managers'
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300'
                      : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Assignee + Managers
                </button>
              </div>
            </div>

            {/* Who can invite members */}
            <div className="p-3.5">
              <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Who can invite members?
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSettingChange('who_can_invite', 'managers_only')}
                  className={`flex-1 px-3 py-2 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                    settings.who_can_invite === 'managers_only'
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300'
                      : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Managers only
                </button>
                <button
                  onClick={() => handleSettingChange('who_can_invite', 'everyone')}
                  className={`flex-1 px-3 py-2 text-[11px] font-medium rounded-md border transition-colors cursor-pointer ${
                    settings.who_can_invite === 'everyone'
                      ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300'
                      : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  Everyone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role descriptions (for non-owners) */}
      {!isOwner && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Role Permissions
          </h3>
          <div className="bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {(Object.entries(ROLE_CONFIG) as [SpaceRole, typeof ROLE_CONFIG[SpaceRole]][]).map(([role, config]) => (
              <div key={role} className="p-3.5">
                <div className="flex items-center gap-2 mb-1">
                  {config.icon}
                  <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{config.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
