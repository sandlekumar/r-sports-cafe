export const apiClient = async (endpoint, options = {}) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Allows sending httpOnly cookies once auth is implemented
    credentials: options.credentials || 'include', 
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        status: response.status,
        message: data?.error?.message || 'An error occurred with the request',
        code: data?.error?.code || 'UNKNOWN_ERROR',
      };
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw { message: 'Network error or CORS issue' };
    }
    throw error;
  }
};
