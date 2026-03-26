import { LaunchType, MenuBarExtra, launchCommand, open } from '@raycast/api';
import { withAccessToken, useCachedPromise } from '@raycast/utils';

import { oauth } from './services/crowdin';
import { useCrowdinClient } from './hooks/useCrowdinClient';

function Command() {
  const client = useCrowdinClient();

  const { data: projects, isLoading } = useCachedPromise(
    async () => {
      const response = await client.projectsGroupsApi.listProjects({ limit: 10 });
      return response.data;
    },
    [],
    { keepPreviousData: true },
  );

  return (
    <MenuBarExtra icon="logo.png" tooltip="Crowdin" isLoading={isLoading}>
      <MenuBarExtra.Section title="Recent Projects">
        {(projects ?? []).map((project) => (
          <MenuBarExtra.Item
            key={project.data.id}
            title={project.data.name}
            onAction={() => open(project.data.webUrl)}
          />
        ))}
      </MenuBarExtra.Section>
      <MenuBarExtra.Section title="Actions">
        <MenuBarExtra.Item
          title="List Projects"
          onAction={() => launchCommand({ name: 'projects', type: LaunchType.UserInitiated })}
        />
        <MenuBarExtra.Item
          title="Upload File"
          onAction={() => launchCommand({ name: 'upload-file', type: LaunchType.UserInitiated })}
        />
        <MenuBarExtra.Item
          title="Build Project Translation"
          onAction={() => launchCommand({ name: 'build-project-translation', type: LaunchType.UserInitiated })}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}

export default withAccessToken(oauth)(Command);
