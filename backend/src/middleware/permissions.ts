import { queryOne, queryMany } from '../db/connection.js';

export type SpaceRole = 'owner' | 'manager' | 'member';

export interface SpaceSettings {
  members_can_create_tasks: boolean;
  who_can_edit_task_details: 'managers_only' | 'assignee_and_managers';
  who_can_invite: 'managers_only' | 'everyone';
}

const DEFAULT_SETTINGS: SpaceSettings = {
  members_can_create_tasks: true,
  who_can_edit_task_details: 'assignee_and_managers',
  who_can_invite: 'managers_only',
};

export async function getSpaceRole(userId: string, spaceId: string): Promise<SpaceRole | null> {
  const row = await queryOne<{ role: string }>(
    'SELECT role FROM space_members WHERE space_id = $1 AND user_id = $2',
    [spaceId, userId]
  );
  if (!row) return null;
  return row.role as SpaceRole;
}

export async function getSpaceSettings(spaceId: string): Promise<SpaceSettings> {
  const rows = await queryMany<{ setting_key: string; setting_value: string }>(
    'SELECT setting_key, setting_value FROM space_settings WHERE space_id = $1',
    [spaceId]
  );
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (row.setting_key === 'members_can_create_tasks') {
      settings.members_can_create_tasks = row.setting_value === 'true';
    } else if (row.setting_key === 'who_can_edit_task_details') {
      settings.who_can_edit_task_details = row.setting_value as SpaceSettings['who_can_edit_task_details'];
    } else if (row.setting_key === 'who_can_invite') {
      settings.who_can_invite = row.setting_value as SpaceSettings['who_can_invite'];
    }
  }
  return settings;
}

export async function updateSpaceSettings(spaceId: string, settings: Partial<SpaceSettings>): Promise<SpaceSettings> {
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(settings)) {
    const stringValue = typeof value === 'boolean' ? String(value) : value;
    await queryOne(
      `INSERT INTO space_settings (space_id, setting_key, setting_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (space_id, setting_key) DO UPDATE SET setting_value = $3`,
      [spaceId, key, stringValue]
    );
  }
  return getSpaceSettings(spaceId);
}

export function canManageSpace(role: SpaceRole | null): boolean {
  return role === 'owner' || role === 'manager';
}

export function isSpaceOwner(role: SpaceRole | null): boolean {
  return role === 'owner';
}

export function canCreateTask(role: SpaceRole | null, settings: SpaceSettings): boolean {
  if (role === 'owner' || role === 'manager') return true;
  return settings.members_can_create_tasks;
}

export function canEditTask(
  role: SpaceRole | null,
  task: { reporter_id: string; assignee_id: string | null },
  userId: string,
  settings: SpaceSettings
): boolean {
  if (role === 'owner' || role === 'manager') return true;
  if (settings.who_can_edit_task_details === 'assignee_and_managers') {
    if (task.assignee_id === userId) return true;
  }
  return false;
}

export function canChangeStatus(
  role: SpaceRole | null,
  task: { reporter_id: string; assignee_id: string | null },
  userId: string
): boolean {
  if (role === 'owner' || role === 'manager') return true;
  if (task.assignee_id === userId) return true;
  return false;
}

export function canAssignTask(role: SpaceRole | null): boolean {
  return role === 'owner' || role === 'manager';
}

export function canDeleteTask(role: SpaceRole | null): boolean {
  return role === 'owner' || role === 'manager';
}

export function canInviteMembers(role: SpaceRole | null, settings: SpaceSettings): boolean {
  if (role === 'owner' || role === 'manager') return true;
  return settings.who_can_invite === 'everyone';
}

export function canManageMembers(role: SpaceRole | null): boolean {
  return role === 'owner';
}
