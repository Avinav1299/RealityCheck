import OpenAI from 'openai';
import { useApiKeys } from '../../contexts/ApiKeyContext';

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

class AIService {
  private static instance: AIService;
  private apiKeys: any;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  setApiKeys(apiKeys: any) {
    this.apiKeys = apiKeys;
  }

  async chat(messages: ChatMessage[], model: string = 'gpt-4'): Promise<ChatResponse> {
    try {
      if (model.startsWith('gpt-')) {
        return await this.chatOpenAI(messages, model);
      } else if (model.startsWith('claude-')) {
        return await this.chatClaude(messages, model);
      } else if (model.startsWith('mistral-')) {
        return await this.chatMistral(messages, model);
      } else if (model.startsWith('command-')) {
        return await this.chatCohere(messages, model);
      } else if (model.includes('llama') || model.includes('mistral-7b') || model.includes('codellama')) {
        return await this.chatOllama(messages, model);
      } else {
        throw new Error(`Unsupported model: ${model}`);
      }
    } catch (error) {
      console.error('AI Service error:', error);
      return this.generateMockResponse(messages, model);
    }
  }

  private async chatOpenAI(messages: ChatMessage[], model: string): Promise<ChatResponse> {
    const apiKey = this.apiKeys?.getActiveKey('openai');
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    return {
      content: completion.choices[0]?.message?.content || 'No response generated',
      model,
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      } : undefined
    };
  }

  private async chatClaude(messages: ChatMessage[], model: string): Promise<ChatResponse> {
    const apiKey = this.apiKeys?.getActiveKey('claude');
    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    // Convert messages to Claude format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0]?.text || 'No response generated',
      model,
      usage: data.usage ? {
        prompt_tokens: data.usage.input_tokens,
        completion_tokens: data.usage.output_tokens,
        total_tokens: data.usage.input_tokens + data.usage.output_tokens
      } : undefined
    };
  }

  private async chatMistral(messages: ChatMessage[], model: string): Promise<ChatResponse> {
    const apiKey = this.apiKeys?.getActiveKey('mistral');
    if (!apiKey) {
      throw new Error('Mistral API key not configured');
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || 'No response generated',
      model,
      usage: data.usage
    };
  }

  private async chatCohere(messages: ChatMessage[], model: string): Promise<ChatResponse> {
    const apiKey = this.apiKeys?.getActiveKey('cohere');
    if (!apiKey) {
      throw new Error('Cohere API key not configured');
    }

    // Convert messages to Cohere format
    const lastMessage = messages[messages.length - 1];
    const chatHistory = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: m.content
    }));

    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
      throw new Error(`Cohere API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.text || 'No response generated',
      model
    };
  }

  private async chatOllama(messages: ChatMessage[], model: string): Promise<ChatResponse> {
    const endpoint = this.apiKeys?.apiKeys?.ollama || 'http://localhost:11434';

    const response = await fetch(`${endpoint}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      content: data.message?.content || 'No response generated',
      model
    };
  }

  private generateMockResponse(messages: ChatMessage[], model: string): ChatResponse {
    const responses = [
      "I understand your question and I'm here to help. Based on the context you've provided, this is a complex topic that requires careful analysis.",
      "Thank you for your inquiry. Let me provide you with a comprehensive response based on the available information and current best practices.",
      "This is an interesting question that touches on several important aspects. I'll break down my analysis for you systematically.",
      "I appreciate you bringing this to my attention. Here's my detailed analysis of the situation and potential recommendations."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: `${randomResponse} (Note: This is a mock response as the ${model} API is not configured. Please add your API key in settings to enable real AI responses.)`,
      model: `${model} (mock)`
    };
  }
}

export const aiService = AIService.getInstance();