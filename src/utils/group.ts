import { Group } from '../types';

export function getGroupPath(groups: Group[], groupId?: number): string {
  if (!groupId) return '';
  const group = groups.find((g) => g.data.id === groupId);
  if (!group) return '';
  const parentPath = group.data.parentId ? getGroupPath(groups, group.data.parentId) : '';
  return parentPath ? `${parentPath}/${group.data.name}` : group.data.name;
}
