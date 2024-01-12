import { Amplify } from 'aws-amplify';
import config from '../../../aws-exports';

export const awsConfig = {
  ...config,
  oauth: {
    ...config.oauth,
  },
};

export const configureAmplify = () => {
  Amplify.configure({
    ...awsConfig,
    ssr: true,
  });
};
