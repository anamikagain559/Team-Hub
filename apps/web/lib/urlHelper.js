export const getApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://api-production-4940.up.railway.app/api/v1';
  
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  return url;
};

export const getSocketUrl = () => {
  let url = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api-production-4940.up.railway.app';
  
  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  return url;
};
