import React, { createContext, useContext, useState, useEffect } from 'react';

interface APIKeyContextType {
  apiKey: string;
  provider: string;
  setApiKey: (key: string) => void;
  setProvider: (provider: string) => void;
  isConfigured: boolean;
}

const APIKeyContext = createContext<APIKeyContextType | undefined>(undefined);

export const APIKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [provider, setProviderState] = useState<string>('openai');

  useEffect(() => {
    const savedKey = localStorage.getItem('edify_api_key');
    const savedProvider = localStorage.getItem('edify_provider');
    if (savedKey) {
      setApiKeyState(savedKey);
    }
    if (savedProvider) {
      setProviderState(savedProvider);
    }
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem('edify_api_key', key);
    } else {
      localStorage.removeItem('edify_api_key');
    }
  };

  const setProvider = (newProvider: string) => {
    setProviderState(newProvider);
    localStorage.setItem('edify_provider', newProvider);
  };

  const isConfigured = Boolean(apiKey);

  return (
    <APIKeyContext.Provider value={{ apiKey, provider, setApiKey, setProvider, isConfigured }}>
      {children}
    </APIKeyContext.Provider>
  );
};

export const useAPIKey = () => {
  const context = useContext(APIKeyContext);
  if (context === undefined) {
    throw new Error('useAPIKey must be used within an APIKeyProvider');
  }
  return context;
};
