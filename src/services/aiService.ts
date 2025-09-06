interface AIProvider {
  name: string;
  baseUrl: string;
  model: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface APIError {
  type: 'quota' | 'auth' | 'network' | 'unknown';
  message: string;
  suggestion: string;
}

class AIService {
  private apiKey: string;
  private provider: AIProvider;

  constructor(apiKey: string, providerType: string = 'openai') {
    this.apiKey = apiKey;
    this.provider = this.getProvider(providerType);
  }

  private getProvider(type: string): AIProvider {
    const providers: Record<string, AIProvider> = {
      openai: {
        name: 'OpenAI',
        baseUrl: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo'
      },
      anthropic: {
        name: 'Anthropic',
        baseUrl: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229'
      },
      google: {
        name: 'Google',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro'
      }
    };
    return providers[type] || providers.openai;
  }

  private parseError(response: Response, errorData: any): APIError {
    const status = response.status;
    const errorMessage = errorData.error?.message || errorData.message || 'Unknown error';
    
    switch (status) {
      case 401:
        return {
          type: 'auth',
          message: 'Invalid API key',
          suggestion: 'Please check your API key in Settings and make sure it\'s correct.'
        };
      case 429:
        if (errorMessage.includes('quota') || errorMessage.includes('billing')) {
          return {
            type: 'quota',
            message: 'API quota exceeded',
            suggestion: 'Please check your billing details or try a different API provider.'
          };
        }
        return {
          type: 'quota',
          message: 'Rate limit exceeded',
          suggestion: 'Please wait a moment and try again.'
        };
      case 500:
      case 502:
      case 503:
        return {
          type: 'network',
          message: 'Service temporarily unavailable',
          suggestion: 'Please try again in a few moments.'
        };
      default:
        return {
          type: 'unknown',
          message: errorMessage,
          suggestion: 'Please try again or contact support if the issue persists.'
        };
    }
  }

  async chat(messages: ChatMessage[], resourceContext?: string): Promise<string> {
    try {
      const systemMessage = resourceContext 
        ? `You are an AI learning assistant. Help the user understand and learn from this content: ${resourceContext.substring(0, 1000)}...`
        : 'You are an AI learning assistant. Help the user with their questions.';

      const response = await fetch(this.provider.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.provider.name === 'Anthropic' && {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          })
        },
        body: JSON.stringify(this.buildRequestBody(messages, systemMessage))
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response' } }));
        const apiError = this.parseError(response, errorData);
        throw apiError;
      }

      const data = await response.json();
      return this.extractResponse(data);
    } catch (error) {
      if (error && typeof error === 'object' && 'type' in error) {
        throw error; // Re-throw our custom APIError
      }
      
      // Handle network errors and other exceptions
      throw {
        type: 'network',
        message: 'Connection failed',
        suggestion: 'Please check your internet connection and try again.'
      } as APIError;
    }
  }

  private buildRequestBody(messages: ChatMessage[], systemMessage: string) {
    const userMessages = messages.filter(m => m.role !== 'system');
    
    switch (this.provider.name) {
      case 'OpenAI':
        return {
          model: this.provider.model,
          messages: [
            { role: 'system', content: systemMessage },
            ...userMessages
          ],
          max_tokens: 1000,
          temperature: 0.7
        };
      
      case 'Anthropic':
        return {
          model: this.provider.model,
          max_tokens: 1000,
          system: systemMessage,
          messages: userMessages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          }))
        };
      
      case 'Google':
        return {
          contents: [
            {
              parts: [{ text: systemMessage }]
            },
            ...userMessages.map(m => ({
              parts: [{ text: m.content }],
              role: m.role === 'assistant' ? 'model' : 'user'
            }))
          ],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        };
      
      default:
        throw new Error('Unsupported AI provider');
    }
  }

  private extractResponse(data: any): string {
    switch (this.provider.name) {
      case 'OpenAI':
        return data.choices?.[0]?.message?.content || 'No response received';
      
      case 'Anthropic':
        return data.content?.[0]?.text || 'No response received';
      
      case 'Google':
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
      
      default:
        return 'No response received';
    }
  }

  async generateSummary(content: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Please provide a comprehensive summary of this content, highlighting the key points, main themes, and important takeaways:\n\n${content.substring(0, 3000)}`
      }
    ];

    return this.chat(messages);
  }

  async generateFlashcards(content: string): Promise<Array<{question: string, answer: string}>> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Create 6 flashcards from this content. Return them as a JSON array with 'question' and 'answer' fields. Format: [{"question": "...", "answer": "..."}]\n\n${content.substring(0, 3000)}`
      }
    ];

    try {
      const response = await this.chat(messages);
      // Try to parse JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create structured flashcards from text response
      return this.createFallbackFlashcards(content);
    } catch (error) {
      return this.createFallbackFlashcards(content);
    }
  }

  async generateQuiz(content: string): Promise<Array<{question: string, options: string[], correct: number}>> {
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: `Create a 4-question multiple choice quiz from this content. Return as JSON array with 'question', 'options' (array of 4 choices), and 'correct' (index of correct answer). Format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0}]\n\n${content.substring(0, 3000)}`
      }
    ];

    try {
      const response = await this.chat(messages);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.createFallbackQuiz(content);
    } catch (error) {
      return this.createFallbackQuiz(content);
    }
  }

  private createFallbackFlashcards(content: string): Array<{question: string, answer: string}> {
    return [
      { 
        question: "What is the main topic of this content?", 
        answer: "The content focuses on learning and understanding key concepts from the uploaded material." 
      },
      { 
        question: "What are the key learning objectives?", 
        answer: "To extract important information and create study materials for better comprehension." 
      },
      { 
        question: "How can this content be applied?", 
        answer: "The concepts can be used to enhance understanding and retention of the subject matter." 
      }
    ];
  }

  private createFallbackQuiz(content: string): Array<{question: string, options: string[], correct: number}> {
    return [
      {
        question: "What type of content are you studying?",
        options: ["Educational material", "Entertainment", "News article", "Technical documentation"],
        correct: 0
      },
      {
        question: "What is the purpose of creating study materials?",
        options: ["To pass time", "To enhance learning", "To create complexity", "To avoid studying"],
        correct: 1
      }
    ];
  }
}

export default AIService;
