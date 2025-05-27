import { Action, ActionPanel, List } from '@raycast/api';
import { withAccessToken, getAccessToken } from '@raycast/utils';
import crowdin, { ApplicationsModel } from '@crowdin/crowdin-api-client'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { useEffect, useState } from 'react';

import { oauth } from './services/crowdin';
import { createModuleActions, getApplicationModules } from './utils/application';
import { Project } from './types/application';

function Command() {
  const [applications, setApplications] = useState<ApplicationsModel.Application[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = getAccessToken();
  const { domain } = jwt.decode(token) as JwtPayload;

  useEffect(() => {
    async function fetchData() {
      try {
        const { applicationsApi, projectsGroupsApi } = new crowdin({
          token,
          organization: domain,
        });

        const [applicationsResponse, projectsResponse] = await Promise.all([
          applicationsApi.withFetchAll().listApplicationInstallations(),
          projectsGroupsApi.withFetchAll().listProjects()
        ]);

        setApplications(applicationsResponse.data.map((item: any) => item.data));
        setProjects(projectsResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false); 
      }
    }

    fetchData();
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
      searchBarPlaceholder="Search applications..."
    >
      {applications.map((app) =>
        app && app.identifier ? (
          <List.Item
            key={app.identifier}
            id={app.identifier}
            title={app.name}
            subtitle={app.name}
            actions={createModuleActions({
              modules: getApplicationModules(app.modules),
              domain,
              appIdentifier: app.identifier,
              projects
            })}
          />
        ) : null
      )}
      {!isLoading && applications.length === 0 && (
        <List.EmptyView
          title="No Applications Found"
          description="There are no applications available in your organization."
        />
      )}
    </List>
  );
}

export default withAccessToken(oauth)(Command); 