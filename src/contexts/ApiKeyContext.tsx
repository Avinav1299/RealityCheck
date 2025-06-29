import React, { createContext, useContext, useState, useEffect } from 'react';

interface ApiKeys {
  openai: string;
  claude: string;
  mistral: string;
  cohere: string;
  ollama: string;
  newsapi: string;
  bing: string;
  google: string;
}

interface ApiKeyContextType {
  apiKeys: ApiKeys;
  updateApiKey: (service: keyof ApiKeys, key: string) => void;
  getActiveKey: (service: keyof ApiKeys) => string | null;
  hasValidKey: (service: keyof ApiKeys) => boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  availableModels: Array<{
    id: string;
    name: string;
    provider: string;
    description: string;
    requiresKey: boolean;
    isAvailable: boolean;
  }>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
};

interface ApiKeyProviderProps {
  children: React.ReactNode;
}

const ApiKeyProvider: React.FC<ApiKeyProviderProps> = ({ children }) => {
  // Initialize with environment variables first
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: import.meta.env.VITE_OPENAI_API_KEY || '',
    claude: import.meta.env.VITE_CLAUDE_API_KEY || '',
    mistral: import.meta.env.VITE_MISTRAL_API_KEY || '',
    cohere: import.meta.env.VITE_COHERE_API_KEY || '',
    ollama: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
    newsapi: import.meta.env.VITE_NEWSAPI_KEY || '',
    bing: import.meta.env.VITE_BING_IMAGE_API_KEY || '',
    google: import.meta.env.VITE_GOOGLE_API_KEY || ''
  });

  const [selectedModel, setSelectedModel] = useState('claude-3-haiku');

  // Load API keys from localStorage on mount and merge with environment variables
  useEffect(() => {
    const savedKeys = localStorage.getItem('realitycheck_api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        // Merge saved keys with environment variables, prioritizing saved keys
        setApiKeys(prev => {
          const merged = { ...prev };
          Object.keys(parsed).forEach(key => {
            if (parsed[key] && parsed[key].trim() !== '') {
              merged[key as keyof ApiKeys] = parsed[key];
            }
          });
          return merged;
        });
      } catch (error) {
        console.error('Error loading saved API keys:', error);
      }
    }

    const savedModel = localStorage.getItem('realitycheck_selected_model');
    if (savedModel) {
      setSelectedModel(savedModel);
    }
  }, []);

  // Save API keys to localStorage when they change
  useEffect(() => {
    // Only save non-empty keys to localStorage
    const keysToSave: Partial<ApiKeys> = {};
    Object.entries(apiKeys).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        keysToSave[key as keyof ApiKeys] = value;
      }
    });
    localStorage.setItem('realitycheck_api_keys', JSON.stringify(keysToSave));
  }, [apiKeys]);

  // Save selected model to localStorage
  useEffect(() => {
    localStorage.setItem('realitycheck_selected_model', selectedModel);
  }, [selectedModel]);

  const updateApiKey = (service: keyof ApiKeys, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: key
    }));
  };

  const getActiveKey = (service: keyof ApiKeys): string | null => {
    const key = apiKeys[service];
    if (!key || key === 'demo-key' || key.trim() === '' || 
        key === 'your_openai_api_key' || key === 'your_claude_api_key' ||
        key === 'your_mistral_api_key' || key === 'your_cohere_api_key' ||
        key === 'your_newsapi_key' || key === 'your_bing_image_search_api_key' ||
        key === 'your_google_api_key') return null;
    return key;
  };

  const hasValidKey = (service: keyof ApiKeys): boolean => {
    return getActiveKey(service) !== null;
  };

  const availableModels = [
    {
      id: 'ollama-llama2',
      name: 'Llama 2 (Local)',
      provider: 'Ollama',
      description: 'Local inference, privacy-focused',
      requiresKey: false,
      isAvailable: true
    },
    {
      id: 'ollama-codellama',
      name: 'Code Llama (Local)',
      provider: 'Ollama',
      description: 'Specialized for code and technical tasks',
      requiresKey: false,
      isAvailable: true
    },
    {
      id: 'ollama-mistral',
      name: 'Mistral 7B (Local)',
      provider: 'Ollama',
      description: 'Fast local inference',
      requiresKey: false,
      isAvailable: true
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model for complex reasoning',
      requiresKey: true,
      isAvailable: hasValidKey('openai')
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Fast and efficient for most tasks',
      requiresKey: true,
      isAvailable: hasValidKey('openai')
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      description: 'Excellent for analysis and reasoning',
      requiresKey: true,
      isAvailable: hasValidKey('claude')
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Fast and cost-effective',
      requiresKey: true,
      isAvailable: hasValidKey('claude')
    },
    {
      id: 'mistral-large',
      name: 'Mistral Large',
      provider: 'Mistral AI',
      description: 'High-performance multilingual model',
      requiresKey: true,
      isAvailable: hasValidKey('mistral')
    },
    {
      id: 'mistral-medium',
      name: 'Mistral Medium',
      provider: 'Mistral AI',
      description: 'Balanced performance and speed',
      requiresKey: true,
      isAvailable: hasValidKey('mistral')
    },
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'Cohere',
      description: 'Advanced reasoning and generation',
      requiresKey: true,
      isAvailable: hasValidKey('cohere')
    }
  ];

  return (
    <ApiKeyContext.Provider value={{
      apiKeys,
      updateApiKey,
      getActiveKey,
      hasValidKey,
      selectedModel,
      setSelectedModel,
      availableModels
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export default ApiKeyProvider;