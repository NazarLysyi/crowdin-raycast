import { Action, ActionPanel, List } from '@raycast/api';
import { withAccessToken, getAccessToken } from '@raycast/utils';
import crowdin from '@crowdin/crowdin-api-client'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { useEffect, useState } from 'react';

import { oauth } from './services/crowdin';
import { getGroupPath } from './utils/group';
import { UploadFileCommand } from './upload-file'; 

interface Group {
  data: {
    id: number;
    name: string;
    description?: string;
    parentId?: number;
  };
}

function Command() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { token } = getAccessToken();
  const { domain } = jwt.decode(token) as JwtPayload;

  useEffect(() => {
    async function fetchGroups() {
      try {
        const { projectsGroupsApi } = new crowdin({
          token,
          organization: domain,
        });

        const response = await projectsGroupsApi.withFetchAll().listGroups();
        setGroups(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch groups. Please try again.');
        console.error('Error fetching groups:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGroups();
  }, [token, domain]);

  if (error) {
    return (
      <List isLoading={isLoading}>
        <List.EmptyView
          title="Error"
          description={error}
          actions={
            <ActionPanel>
              <Action title="Retry" onAction={() => setIsLoading(true)} />
            </ActionPanel>
          }
        />
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search groups..."
      onSelectionChange={(id) => {
        const group = groups.find(g => g.data.id.toString() === id);
        setSelectedGroup(group || null);
      }}
    >
      {groups.map((group) => (
        <List.Item
          key={group.data.id}
          id={group.data.id.toString()}
          title={group.data.name}
          subtitle={getGroupPath(groups, group.data.id)}
          accessories={[
            { text: group.data.description || 'No description' }
          ]}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                title="Copy Group ID"
                content={group.data.id.toString()}
              />
              {group.data.description && (
                <Action.CopyToClipboard
                  title="Copy Description"
                  content={group.data.description}
                />
              )}
            </ActionPanel>
          }
        />
      ))}
      {!isLoading && groups.length === 0 && (
        <List.EmptyView
          title="No Groups Found"
          description="There are no groups available in your organization."
        />
      )}
    </List>
  );
}

export default withAccessToken(oauth)(Command); 