import { Action, ActionPanel, List, showToast, Toast } from '@raycast/api';
import { withAccessToken, useCachedPromise } from '@raycast/utils';

import { oauth } from './services/crowdin';
import { useCrowdinClient } from './hooks/useCrowdinClient';
import { getSingleProgressBar } from './utils/progress';
import { getLanguageName } from './utils/language';
import { getGroupPath } from './utils/group';
import { UploadFileCommand } from './upload-file';
import { BuildProjectTranslationCommand } from './build-project-translation';
import { Project, TranslationProgress } from './types';

function Command() {
  const client = useCrowdinClient();

  const { data: projects, isLoading: projectsLoading } = useCachedPromise(
    async () => {
      const response = await client.projectsGroupsApi.withFetchAll().listProjects();
      return response.data;
    },
    [],
    {
      keepPreviousData: true,
      onError: (error) => {
        showToast({ style: Toast.Style.Failure, title: 'Failed to fetch projects', message: String(error) });
      },
    },
  );

  const { data: groups } = useCachedPromise(
    async () => {
      const response = await client.projectsGroupsApi.withFetchAll().listGroups();
      return response.data;
    },
    [],
    {
      keepPreviousData: true,
      onError: (error) => {
        showToast({ style: Toast.Style.Failure, title: 'Failed to fetch groups', message: String(error) });
      },
    },
  );

  const { data: languages } = useCachedPromise(
    async () => {
      const response = await client.languagesApi.withFetchAll().listSupportedLanguages();
      return response.data;
    },
    [],
    {
      keepPreviousData: true,
      onError: (error) => {
        showToast({ style: Toast.Style.Failure, title: 'Failed to fetch languages', message: String(error) });
      },
    },
  );

  const { data: progress } = useCachedPromise(
    async (projectList: Project[]) => {
      const results = await Promise.all(
        projectList.map(async (project) => {
          const res = await client.translationStatusApi.withFetchAll().getProjectProgress(project.data.id);
          return { projectId: project.data.id, progress: res };
        }),
      );
      return results.reduce(
        (acc, { projectId, progress }) => {
          acc[projectId] = progress;
          return acc;
        },
        {} as Record<number, TranslationProgress>,
      );
    },
    [projects ?? []],
    {
      execute: !!projects?.length,
      keepPreviousData: true,
      onError: (error) => {
        showToast({ style: Toast.Style.Failure, title: 'Failed to fetch progress', message: String(error) });
      },
    },
  );

  function getLanguagesMarkdown(project: Project) {
    return (project.data.targetLanguageIds ?? [])
      .map((langId) => {
        const langName = getLanguageName(languages ?? [], langId);
        const projectProgress = progress?.[project.data.id];
        const langProgress = projectProgress?.data.find((p) => p.data.languageId === langId);
        const total = langProgress?.data.words.total ?? 0;
        const translated = langProgress?.data.words.translated ?? 0;
        const approved = langProgress?.data.words.approved ?? 0;
        const translatedPercent = total > 0 ? Math.round((translated / total) * 100) : 0;
        const approvedPercent = total > 0 ? Math.round((approved / total) * 100) : 0;
        const bar = getSingleProgressBar(translated, approved, total);
        return `- ${langName}: ${bar} ${translatedPercent}% translated, ${approvedPercent}% approved`;
      })
      .join('\n');
  }

  return (
    <List isLoading={projectsLoading} isShowingDetail searchBarPlaceholder="Search projects...">
      <List.EmptyView title="No Projects Found" description="Create a project on Crowdin to get started" />
      {(projects ?? []).map((project) => {
        const groupPath = getGroupPath(groups ?? [], project.data.groupId);
        const fullPath = groupPath ? `${groupPath}/${project.data.name}` : project.data.name;
        const sourceLangId = project.data.sourceLanguageId ?? '';

        return (
          <List.Item
            key={project.data.id}
            title={fullPath}
            detail={
              <List.Item.Detail
                markdown={`# ${fullPath}\n\n${getLanguagesMarkdown(project)}`}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label
                      title="Description"
                      text={project.data.description ?? 'No description'}
                    />
                    <List.Item.Detail.Metadata.Label
                      title="Source Language"
                      text={getLanguageName(languages ?? [], sourceLangId)}
                    />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={project.data.webUrl} title="Open Project in Browser" />
                <Action.Push
                  title="Add Files"
                  target={<UploadFileCommand initialProjectId={project.data.id.toString()} />}
                />
                <Action.Push
                  title="Build Project Translation"
                  target={<BuildProjectTranslationCommand initialProjectId={project.data.id.toString()} />}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

export default withAccessToken(oauth)(Command);
