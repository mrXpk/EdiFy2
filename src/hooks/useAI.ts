import { useState, useCallback } from 'react';
import { useAPIKey } from '../contexts/APIKeyContext';
import AIService, { APIError } from '../services/aiService';

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
}

interface FlashCard {
  question: string;
  answer: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const useAI = (resourceContent?: string) => {
  const { apiKey, provider } = useAPIKey();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<APIError | null>(null);

  const aiService = apiKey ? new AIService(apiKey, provider) : null;

  const handleError = (err: any): APIError => {
    if (err && typeof err === 'object' && 'type' in err) {
      return err as APIError;
    }
    
    return {
      type: 'unknown',
      message: err instanceof Error ? err.message : 'An unexpected error occurred',
      suggestion: 'Please try again or check your API configuration.'
    };
  };

  const sendChatMessage = useCallback(async (
    message: string,
    chatHistory: ChatMessage[]
  ): Promise<string> => {
    if (!aiService) {
      throw {
        type: 'auth',
        message: 'AI service not configured',
        suggestion: 'Please check your API key in Settings.'
      } as APIError;
    }

    setLoading(true);
    setError(null);

    try {
      const messages = chatHistory.map(chat => ({
        role: chat.role === 'ai' ? 'assistant' as const : 'user' as const,
        content: chat.message
      }));

      messages.push({ role: 'user', content: message });

      const response = await aiService.chat(messages, resourceContent);
      return response;
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [aiService, resourceContent]);

  const generateSummary = useCallback(async (): Promise<string> => {
    if (!aiService) {
      throw {
        type: 'auth',
        message: 'AI service not configured',
        suggestion: 'Please check your API key in Settings.'
      } as APIError;
    }

    if (!resourceContent) {
      return "This is a demo summary. Upload real content and configure your API key to generate AI-powered summaries of your videos and documents.";
    }

    setLoading(true);
    setError(null);

    try {
      const summary = await aiService.generateSummary(resourceContent);
      return summary;
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      
      // Return fallback content instead of throwing
      return `Unable to generate AI summary due to: ${apiError.message}. ${apiError.suggestion}\n\nFallback Summary:\nThis content contains educational material that can be used for learning purposes. Key concepts include understanding the main topics, extracting important information, and creating study materials for better comprehension.`;
    } finally {
      setLoading(false);
    }
  }, [aiService, resourceContent]);

  const generateFlashcards = useCallback(async (): Promise<FlashCard[]> => {
    if (!aiService) {
      return [
        { question: "Demo Question 1", answer: "Configure your API key to generate real flashcards" },
        { question: "Demo Question 2", answer: "Upload content and set up AI to create personalized study materials" }
      ];
    }

    if (!resourceContent) {
      return [
        { question: "What is EdiFy?", answer: "An AI-powered learning platform for creating study materials" },
        { question: "How does it work?", answer: "Upload content and let AI generate summaries, flashcards, and quizzes" }
      ];
    }

    setLoading(true);
    setError(null);

    try {
      const flashcards = await aiService.generateFlashcards(resourceContent);
      return flashcards;
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      
      // Return fallback flashcards
      return [
        { 
          question: "API Error Occurred", 
          answer: `${apiError.message}. ${apiError.suggestion}` 
        },
        { 
          question: "Fallback Content", 
          answer: "These are demo flashcards. Fix the API issue to generate real content." 
        }
      ];
    } finally {
      setLoading(false);
    }
  }, [aiService, resourceContent]);

  const generateQuiz = useCallback(async (): Promise<QuizQuestion[]> => {
    if (!aiService) {
      return [
        {
          question: "What do you need to generate real quizzes?",
          options: ["A valid API key", "Internet connection", "Uploaded content", "All of the above"],
          correct: 3
        }
      ];
    }

    if (!resourceContent) {
      return [
        {
          question: "What is the main purpose of EdiFy?",
          options: ["Entertainment", "AI-powered learning", "File storage", "Video streaming"],
          correct: 1
        }
      ];
    }

    setLoading(true);
    setError(null);

    try {
      const quiz = await aiService.generateQuiz(resourceContent);
      return quiz;
    } catch (err) {
      const apiError = handleError(err);
      setError(apiError);
      
      // Return fallback quiz
      return [
        {
          question: `API Error: ${apiError.message}`,
          options: [
            apiError.suggestion,
            "Try again later",
            "Check your API configuration",
            "All of the above"
          ],
          correct: 3
        }
      ];
    } finally {
      setLoading(false);
    }
  }, [aiService, resourceContent]);

  return {
    sendChatMessage,
    generateSummary,
    generateFlashcards,
    generateQuiz,
    loading,
    error,
    isConfigured: Boolean(aiService)
  };
};
