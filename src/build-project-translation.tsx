import { Action, ActionPanel, Form, showToast, Toast, open } from '@raycast/api';
import { withAccessToken, FormValidation, useForm } from '@raycast/utils';

import { oauth } from './services/crowdin';
import { useCrowdinClient } from './hooks/useCrowdinClient';
import { useProjects } from './hooks/useProjects';

interface BuildFormValues {
  projectId: string;
}

export function BuildProjectTranslationCommand({ initialProjectId = '' }: { initialProjectId?: string }) {
  const client = useCrowdinClient();
  const { data: projects, isLoading } = useProjects();

  const { handleSubmit, itemProps } = useForm<BuildFormValues>({
    async onSubmit(values) {
      const toast = await showToast({ style: Toast.Style.Animated, title: 'Building translations...' });
      try {
        const projectId = parseInt(values.projectId);
        const buildRes = await client.translationsApi.buildProject(projectId);
        const buildId = buildRes.data.id;

        const pollBuildStatus = async (): Promise<string> => {
          const statusRes = await client.translationsApi.checkBuildStatus(projectId, buildId);
          const status = statusRes.data.status;
          const progress = statusRes.data.progress;

          if (status === 'finished' || status === 'failed' || status === 'canceled') {
            return status;
          }

          toast.message = `Progress: ${progress}%`;
          await new Promise((r) => setTimeout(r, 2000));
          return pollBuildStatus();
        };

        const finalStatus = await pollBuildStatus();

        if (finalStatus === 'finished') {
          const downloadRes = await client.translationsApi.downloadTranslations(projectId, buildId);
          toast.style = Toast.Style.Success;
          toast.title = 'Build finished!';
          toast.message = 'Opening download...';
          await open(downloadRes.data.url);
        } else {
          toast.style = Toast.Style.Failure;
          toast.title = `Build ${finalStatus}`;
        }
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = 'Failed to build translations';
        toast.message = error instanceof Error ? error.message : 'Unknown error';
      }
    },
    initialValues: { projectId: initialProjectId },
    validation: {
      projectId: FormValidation.Required,
    },
  });

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Build Translation" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown {...itemProps.projectId} title="Project" storeValue>
        <Form.Dropdown.Item value="" title="Select project" />
        {(projects ?? []).map((project) => (
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

export default withAccessToken(oauth)(BuildProjectTranslationCommand);
