/**
 * Ollama-Only AI Service
 * Simplified service that only connects to local Ollama instance
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
}

class OllamaService {
  private static instance: OllamaService;
  private baseUrl: string;
  private availableModels: OllamaModel[] = [];

  private constructor() {
    // Allow custom Ollama URL from environment, default to localhost
    this.baseUrl = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  /**
   * Check if Ollama is running and get available models
   */
  async checkConnection(): Promise<{ connected: boolean; models: OllamaModel[] }> {
    try {
      // First, try to check if Ollama is accessible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        mode: 'cors' // Explicitly set CORS mode
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.availableModels = data.models || [];
      
      return {
        connected: true,
        models: this.availableModels
      };
    } catch (error) {
      console.error('Ollama connection error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Ollama connection timeout. Please ensure Ollama is running and accessible.');
        }
        if (error instanceof TypeError || error.message === 'Failed to fetch') {
          throw new Error('Cannot connect to Ollama. Please ensure:\n1. Ollama is installed and running (run "ollama serve")\n2. Ollama is accessible at ' + this.baseUrl + '\n3. No firewall is blocking the connection');
        }
        if (error.message.includes('CORS')) {
          throw new Error('CORS error connecting to Ollama. You may need to start Ollama with CORS enabled:\nOLLAMA_ORIGINS=* ollama serve');
        }
      }
      
      return {
        connected: false,
        models: []
      };
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<OllamaModel[]> {
    const connection = await this.checkConnection();
    return connection.models;
  }

  /**
   * Chat with Ollama model
   */
  async chat(messages: ChatMessage[], model?: string): Promise<ChatResponse> {
    try {
      // Check connection first
      const connection = await this.checkConnection();
      if (!connection.connected) {
        throw new Error('Ollama not detected. Please start Ollama on your local machine by running "ollama serve" in your terminal.');
      }

      // Use first available model if none specified
      const selectedModel = model || connection.models[0]?.name;
      if (!selectedModel) {
        throw new Error('No Ollama models found. Please install a model using: ollama pull llama2');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for chat

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        }),
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Model '${selectedModel}' not found. Available models: ${connection.models.map(m => m.name).join(', ')}`);
        }
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.message?.content || 'No response generated',
        model: selectedModel,
        usage: {
          prompt_tokens: data.prompt_eval_count || 0,
          completion_tokens: data.eval_count || 0,
          total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
        }
      };
    } catch (error) {
      console.error('Ollama chat error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Ollama request timeout. The model may be taking too long to respond.');
        }
        if (error instanceof TypeError || error.message === 'Failed to fetch') {
          throw new Error('Lost connection to Ollama. Please ensure Ollama is still running.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Generate embeddings using Ollama
   */
  async generateEmbeddings(text: string, model: string = 'nomic-embed-text'): Promise<number[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt: text
        }),
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama embeddings error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.embedding || [];
    } catch (error) {
      console.error('Ollama embeddings error:', error);
      return [];
    }
  }

  /**
   * Pull a new model
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: modelName
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Model pull error:', error);
      throw error;
    }
  }

  /**
   * Get the current Ollama base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Set a custom Ollama base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

export const ollamaService = OllamaService.getInstance();