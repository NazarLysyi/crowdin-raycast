import { useMemo } from 'react';
import { getAccessToken } from '@raycast/utils';
import crowdin from '@crowdin/crowdin-api-client';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function useCrowdinClient() {
  const { token } = getAccessToken();
  const { domain } = jwt.decode(token) as JwtPayload;

  return useMemo(() => new crowdin({ token, organization: domain }), [token, domain]);
}
