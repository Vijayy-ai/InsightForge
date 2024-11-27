export const validateJSONString = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateAuthCredentials = (
  authType: 'none' | 'apiKey' | 'basic',
  apiKey?: string,
  username?: string,
  password?: string
): boolean => {
  if (authType === 'apiKey') {
    return Boolean(apiKey?.trim());
  }
  if (authType === 'basic') {
    return Boolean(username?.trim() && password?.trim());
  }
  return true;
}; 