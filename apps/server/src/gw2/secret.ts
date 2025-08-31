import keytar from 'keytar';

export const SERVICE = 'GW2Mcp';
export const ACCOUNT = 'GW2_API_KEY';

function mask(key: string): string {
  if (key.length <= 4) return '*'.repeat(key.length);
  return `${key.slice(0, 2)}...${key.slice(-2)}`;
}

export async function setApiKey(key: string): Promise<void> {
  try {
    await keytar.setPassword(SERVICE, ACCOUNT, key);
  } catch (err) {
    console.warn({ key: mask(key) }, 'keytar setApiKey failed');
    throw err;
  }
}

export async function deleteApiKey(): Promise<void> {
  try {
    await keytar.deletePassword(SERVICE, ACCOUNT);
  } catch (err) {
    console.warn('keytar deleteApiKey failed');
    throw err;
  }
}

export async function hasApiKey(): Promise<boolean> {
  try {
    const key = await keytar.getPassword(SERVICE, ACCOUNT);
    return !!key;
  } catch (err) {
    console.warn('keytar hasApiKey failed');
    throw err;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    return await keytar.getPassword(SERVICE, ACCOUNT);
  } catch (err) {
    console.warn('keytar getApiKey failed');
    throw err;
  }
}
