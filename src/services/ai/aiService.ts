/**
 * Unified AI Service
 * Handles multiple AI providers including Ollama and cloud services
 */

import { ollamaService } from './ollamaService';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
  provider: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AIService {
  private static instance: AIService;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Chat with selected AI model
   */
  async chat(messages: ChatMessage[], modelId: string, apiKeys: any): Promise<ChatResponse> {
    try {
      // Handle Ollama models
      if (modelId.startsWith('ollama-')) {
        const ollamaModel = modelId.replace('ollama-', '');
        const response = await ollamaService.chat(messages, ollamaModel);
        return {
          ...response,
          provider: 'Ollama'
        };
      }

      // Handle OpenAI models
      if (modelId.startsWith('gpt-')) {
        return await this.chatWithOpenAI(messages, modelId, apiKeys.openai);
      }

      // Handle Claude models
      if (modelId.startsWith('claude-')) {
        return await this.chatWithClaude(messages, modelId, apiKeys.claude);
      }

      // Handle Mistral models
      if (modelId.startsWith('mistral-')) {
        return await this.chatWithMistral(messages, modelId, apiKeys.mistral);
      }

      // Handle Cohere models
      if (modelId.startsWith('command-')) {
        return await this.chatWithCohere(messages, modelId, apiKeys.cohere);
      }

      throw new Error(`Unsupported model: ${modelId}`);
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  /**
   * Chat with OpenAI
   */
  private async chatWithOpenAI(messages: ChatMessage[], model: string, apiKey: string): Promise<ChatResponse> {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        let errorMessage = `OpenAI API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        model,
        provider: 'OpenAI',
        usage: data.usage
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to OpenAI API. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Chat with Claude
   */
  private async chatWithClaude(messages: ChatMessage[], model: string, apiKey: string): Promise<ChatResponse> {
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    // Convert messages format for Claude
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          system: systemMessage,
          messages: conversationMessages
        })
      });

      if (!response.ok) {
        let errorMessage = `Claude API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      return {
        content: data.content[0]?.text || 'No response generated',
        model,
        provider: 'Anthropic',
        usage: data.usage
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Claude API. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Chat with Mistral
   */
  private async chatWithMistral(messages: ChatMessage[], model: string, apiKey: string): Promise<ChatResponse> {
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        let errorMessage = `Mistral API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        model,
        provider: 'Mistral AI',
        usage: data.usage
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Mistral API. Please check your internet connection.');
      }
      throw error;
    }
  }

  /**
   * Chat with Cohere
   */
  private async chatWithCohere(messages: ChatMessage[], model: string, apiKey: string): Promise<ChatResponse> {
    if (!apiKey) {
      throw new Error('Cohere API key not configured');
    }

    // Convert messages to Cohere format
    const lastMessage = messages[messages.length - 1];
    const chatHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: msg.content
    }));

    try {
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          message: lastMessage.content,
          chat_history: chatHistory,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        let errorMessage = `Cohere API error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      return {
        content: data.text || 'No response generated',
        model,
        provider: 'Cohere',
        usage: {
          prompt_tokens: data.meta?.tokens?.input_tokens || 0,
          completion_tokens: data.meta?.tokens?.output_tokens || 0,
          total_tokens: (data.meta?.tokens?.input_tokens || 0) + (data.meta?.tokens?.output_tokens || 0)
        }
      };
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Cohere API. Please check your internet connection.');
      }
      throw error;
    }
  }
}

export const aiService = AIService.getInstance();