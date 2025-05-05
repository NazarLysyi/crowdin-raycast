import { Action, ActionPanel, Form, showToast, Toast, open } from '@raycast/api';
import { withAccessToken, getAccessToken } from '@raycast/utils';
import crowdin from '@crowdin/crowdin-api-client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { useState, useEffect } from 'react';
import { oauth } from './services/crowdin';
import { Project } from './types';

function Command({ initialProjectId = '' }: { initialProjectId?: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);

  const { token } = getAccessToken();
  const { domain } = jwt.decode(token) as JwtPayload;

  const fetchProjects = async () => {
    try {
      const { projectsGroupsApi } = new crowdin({
        token,
        organization: domain,
      });
      const response = await projectsGroupsApi.withFetchAll().listProjects();
      setProjects(response.data);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (
      initialProjectId &&
      projects.some((p) => p.data.id.toString() === initialProjectId)
    ) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId, projects]);

  const handleBuild = async () => {
    if (isLoading) {
      showToast({
        style: Toast.Style.Animated,
        title: "Build in progress",
        message: "Please wait for the current build to finish.",
      });
      return;
    }
    if (!selectedProjectId) {
      showToast({
        style: Toast.Style.Failure,
        title: 'No project selected',
        message: 'Please select a project to build.',
      });
      return;
    }
    setIsLoading(true);
    try {
      const { translationsApi } = new crowdin({
        token,
        organization: domain,
      });

      const buildRes = await translationsApi.buildProject(parseInt(selectedProjectId));
      const buildId = buildRes.data.id;

      let status = buildRes.data.status;
      while (status !== 'finished' && status !== 'failed' && status !== 'canceled') {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const statusRes = await translationsApi.checkBuildStatus(parseInt(selectedProjectId), buildId);
        status = statusRes.data.status;
      }

      if (status === 'finished') {
        const downloadRes = await translationsApi.downloadTranslations(parseInt(selectedProjectId), buildId);
        showToast({
          style: Toast.Style.Success,
          title: 'Build finished!',
          message: 'Download: ' + downloadRes.data.url,
        });
        open(downloadRes.data.url);
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: 'Build failed or canceled',
        });
      }
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: 'Failed to build/download',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title='Build Translation' onSubmit={handleBuild} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id='projectId'
        title='Project'
        storeValue
        value={
          projects.some((p) => p.data.id.toString() === selectedProjectId)
            ? selectedProjectId
            : ''
        }
        onChange={setSelectedProjectId}
      >
        <Form.Dropdown.Item value='' title='Select project' />
        {projects.map((project) => (
          <Form.Dropdown.Item
            key={project.data.id}
            value={project.data.id.toString()}
            title={project.data.name ?? ''}
          />
        ))}
      </Form.Dropdown>
    </Form>
  );
}

const WrappedBuildProjectTranslationCommand = withAccessToken(oauth)(Command);
export default WrappedBuildProjectTranslationCommand;
export { WrappedBuildProjectTranslationCommand as BuildProjectTranslationCommand };
