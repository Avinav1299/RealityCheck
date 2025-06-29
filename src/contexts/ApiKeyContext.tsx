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
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    claude: '',
    mistral: '',
    cohere: '',
    ollama: 'http://localhost:11434',
    newsapi: '',
    bing: '',
    google: ''
  });

  const [selectedModel, setSelectedModel] = useState('gpt-4');

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('realitycheck_api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(prev => ({ ...prev, ...parsed }));
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
    localStorage.setItem('realitycheck_api_keys', JSON.stringify(apiKeys));
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
    if (!key || key === 'demo-key' || key === '') return null;
    return key;
  };

  const hasValidKey = (service: keyof ApiKeys): boolean => {
    return getActiveKey(service) !== null;
  };

  const availableModels = [
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
    },
    {
      id: 'llama2-70b',
      name: 'Llama 2 70B',
      provider: 'Ollama (Local)',
      description: 'Local inference, privacy-focused',
      requiresKey: false,
      isAvailable: true // Always available if Ollama is running
    },
    {
      id: 'codellama-34b',
      name: 'Code Llama 34B',
      provider: 'Ollama (Local)',
      description: 'Specialized for code and technical tasks',
      requiresKey: false,
      isAvailable: true
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'Ollama (Local)',
      description: 'Fast local inference',
      requiresKey: false,
      isAvailable: true
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