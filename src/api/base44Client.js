import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: '698443c73189e3e9321e1de9',
});

export const { auth } = base44;
