import { OAuth } from '@raycast/api';
import { OAuthService } from '@raycast/utils';

const CLIENT_ID = 'D4lmHUDpF5dAfSLqSXSH';

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.Web,
  providerName: 'Crowdin',
  providerIcon: 'logo.png',
  description: 'Connect your Crowdin account...',
});

export const oauth = new OAuthService({
  client,
  clientId: CLIENT_ID,
  authorizeUrl: 'https://oauth.raycast.com/v1/authorize/DQpg7HuDzkwMQOIafTxC9kVvgdX1kcT13c6dloYYmX4Qm9qddOhVPF4zKYdV1cdC-SpImfV4T4RAJS_yGF-mFJ0ZdSzoMQFo8esU3GgTV_0zRNrJtylgz6yQde9_VkuMDDqdgu79DKMeFejyfNEElQGe',
  tokenUrl: 'https://oauth.raycast.com/v1/token/mEAcG6C2A8qoBnBqtaPRBq4enjHl52OKzzdSRdsLH5HQZrgoKBFgmEcsCp8TnavpZ8jvfooo7xK4dlBgrkOrqJNvBEcxNJj3TW4O75i7_NnEmuSSzIDt23Umq0TliKZKxiRcupce41yhyykAoUE',
  refreshTokenUrl: 'https://oauth.raycast.com/v1/refresh-token/PmKMRPmmVnBXyFqsUxH_YIeAxK4R_UX8E9Yv9jZKjYujfGDtr8zc9L2c1cI9t38rpb61AJh4SE9LzUKoRtXveCln5Jk_angA6baKW0cH7kcslBxMjuMC5wTTmKoEsBRI2XTSZUCse-7Uztn9B7g',
  scope: '*',
});
