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
  private baseUrl: string = 'http://localhost:11434';
  private availableModels: OllamaModel[] = [];

  private constructor() {}

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
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      this.availableModels = data.models || [];
      
      return {
        connected: true,
        models: this.availableModels
      };
    } catch (error) {
      console.error('Ollama connection error:', error);
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
        throw new Error('Ollama not detected. Please start Ollama on your local machine.');
      }

      // Use first available model if none specified
      const selectedModel = model || connection.models[0]?.name;
      if (!selectedModel) {
        throw new Error('No Ollama models found. Please install a model using: ollama pull llama2');
      }

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Model '${selectedModel}' not found. Available models: ${connection.models.map(m => m.name).join(', ')}`);
        }
        throw new Error(`Ollama API error: ${response.status}`);
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
      throw error;
    }
  }

  /**
   * Generate embeddings using Ollama
   */
  async generateEmbeddings(text: string, model: string = 'nomic-embed-text'): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt: text
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama embeddings error: ${response.status}`);
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: modelName
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }
    } catch (error) {
      console.error('Model pull error:', error);
      throw error;
    }
  }
}

export const ollamaService = OllamaService.getInstance();