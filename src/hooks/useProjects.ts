import { useCachedPromise } from '@raycast/utils';
import { useCrowdinClient } from './useCrowdinClient';

export function useProjects() {
  const client = useCrowdinClient();

  return useCachedPromise(
    async () => {
      const response = await client.projectsGroupsApi.withFetchAll().listProjects();
      return response.data;
    },
    [],
    { keepPreviousData: true },
  );
}
