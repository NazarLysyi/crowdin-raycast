import { Action, ActionPanel, List } from '@raycast/api';
import { withAccessToken, getAccessToken } from '@raycast/utils';
import crowdin from '@crowdin/crowdin-api-client'
import jwt, { JwtPayload } from 'jsonwebtoken';
import { useEffect, useState } from 'react';

import { oauth } from './services/crowdin';
import { getSingleProgressBar } from './utils/progress';
import { getLanguageName } from './utils/language';
import { getGroupPath } from './utils/group';
import { UploadFileCommand } from './upload-file';
import { BuildProjectTranslationCommand } from './build-project-translation';
import { Project, Group, Language, TranslationProgress } from './types';

function Command() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [progress, setProgress] = useState<Record<number, TranslationProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  const { token } = getAccessToken();
  const { domain } = jwt.decode(token) as JwtPayload;

  useEffect(() => {
    const { projectsGroupsApi, languagesApi, translationStatusApi } = new crowdin({
      token: token,
      organization: domain,
    });

    Promise.all([
      projectsGroupsApi.withFetchAll().listProjects(),
      projectsGroupsApi.withFetchAll().listGroups(),
      languagesApi.withFetchAll().listSupportedLanguages()
    ])
      .then(([projectsResponse, groupsResponse, languagesResponse]) => {
        setProjects(projectsResponse.data);
        setGroups(groupsResponse.data);
        setLanguages(languagesResponse.data);

        // Fetch progress for each project
        const progressPromises = projectsResponse.data.map(project => 
          translationStatusApi.withFetchAll().getProjectProgress(project.data.id)
            .then(progress => ({ projectId: project.data.id, progress }))
        );

        Promise.all(progressPromises)
          .then(progressResults => {
            const progressMap = progressResults.reduce((acc, { projectId, progress }) => {
              acc[projectId] = progress;
              return acc;
            }, {} as Record<number, TranslationProgress>);
            setProgress(progressMap);
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Error fetching progress:', error);
            setIsLoading(false);
          });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, [token, domain]);

  const getProgressForLanguage = (projectId: number, languageId: string) => {
    const projectProgress = progress[projectId];
    if (!projectProgress) return null;
    
    const languageProgress = projectProgress.data.find(p => p.data.languageId === languageId);
    if (!languageProgress) return null;

    const { words, phrases } = languageProgress.data;
    return {
      words: {
        total: words.total,
        translated: words.translated,
        approved: words.approved,
        progress: Math.round((words.translated / words.total) * 100)
      },
      phrases: {
        total: phrases.total,
        translated: phrases.translated,
        approved: phrases.approved,
        progress: Math.round((phrases.translated / phrases.total) * 100)
      }
    };
  };

  const getLanguagesMarkdown = (project: Project) => {
    return (project.data.targetLanguageIds ?? [])
      .filter((langId): langId is string => true)
      .map((langId) => {
        const langName = getLanguageName(languages, langId);
        const progress = getProgressForLanguage(project.data.id, langId);
        const total = progress ? progress.words.total : 0;
        const translated = progress ? progress.words.translated : 0;
        const approved = progress ? progress.words.approved : 0;
        const translatedPercent = total > 0 ? Math.round((translated / total) * 100) : 0;
        const approvedPercent = total > 0 ? Math.round((approved / total) * 100) : 0;
        const bar = getSingleProgressBar(translated, approved, total);
        const tooltip = `${translatedPercent}% translated, ${approvedPercent}% approved`;
        return `- ${langName}: ${bar} ${tooltip}`;
      }).join('\n');
  };

  return (
    <List isLoading={isLoading} isShowingDetail>
      {projects.map((project) => {
        const groupPath = getGroupPath(groups, typeof project.data.groupId === 'number' ? project.data.groupId : undefined);
        const fullPath = groupPath ? `${groupPath}/${project.data.name ?? ''}` : (project.data.name ?? '');
        const sourceLangId = typeof project.data.sourceLanguageId === 'string' ? project.data.sourceLanguageId : '';
        
        return (
          <List.Item
            key={project.data.id}
            title={fullPath}
            detail={
              <List.Item.Detail
                markdown={`# ${fullPath}\n\n${getLanguagesMarkdown(project)}`}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title='Description' text={typeof project.data.description === 'string' ? project.data.description : 'No description'} />
                    <List.Item.Detail.Metadata.Label title='Source Language' text={getLanguageName(languages, sourceLangId)} />
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  url={project.data.webUrl ?? ''}
                  title='Open Project in Browser'
                />
                <Action.Push
                  title='Add Files'
                  target={<UploadFileCommand initialProjectId={project.data.id.toString()} />}
                />
                <Action.Push
                  title='Build Project Translation'
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
