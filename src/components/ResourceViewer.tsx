import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, BookOpen, HelpCircle, Loader2, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAI } from '../hooks/useAI';
import { APIError } from '../services/aiService';

interface Resource {
  id: string;
  type: 'video' | 'document' | 'link';
  name: string;
  url?: string;
  content?: string;
}

interface ResourceViewerProps {
  resource: Resource;
  onNewResource: () => void;
}

interface ChatMessage {
  role: 'user' | 'ai';
  message: string;
}

interface FlashCard {
  question: string;
  answer: string;
  revealed?: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  selected?: number;
}

const ResourceViewer: React.FC<ResourceViewerProps> = ({ resource }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chat' | 'summary' | 'flashcards' | 'quiz'>('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', message: 'Hello! I\'ve analyzed your content and I\'m ready to help you learn. What would you like to know?' }
  ]);
  
  const [summary, setSummary] = useState<string>('');
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  const resourceContent = `Content from ${resource.name}. This is sample content that would be extracted from the uploaded video or document. In a production app, this would involve video transcription, document parsing, etc.`;
  
  const { 
    sendChatMessage, 
    generateSummary, 
    generateFlashcards, 
    generateQuiz, 
    loading, 
    error,
    isConfigured 
  } = useAI(resourceContent);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'summary', label: 'Summary', icon: <FileText className="w-5 h-5" /> },
    { id: 'flashcards', label: 'Flashcards', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (loadedTabs.has(activeTab)) return;

    const loadTabContent = async () => {
      try {
        setLoadedTabs(prev => new Set([...prev, activeTab]));
        
        switch (activeTab) {
          case 'summary':
            if (!summary) {
              const summaryText = await generateSummary();
              setSummary(summaryText);
            }
            break;
          case 'flashcards':
            if (flashcards.length === 0) {
              const cards = await generateFlashcards();
              setFlashcards(cards.map(card => ({ ...card, revealed: false })));
            }
            break;
          case 'quiz':
            if (quiz.length === 0) {
              const questions = await generateQuiz();
              setQuiz(questions.map(q => ({ ...q, selected: undefined })));
            }
            break;
        }
      } catch (err) {
        console.error(`Error loading ${activeTab}:`, err);
      }
    };

    loadTabContent();
  }, [activeTab, loadedTabs, summary, flashcards.length, quiz.length, generateSummary, generateFlashcards, generateQuiz]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !isConfigured) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    
    const newHistory = [...chatHistory, { role: 'user' as const, message: userMessage }];
    setChatHistory(newHistory);

    try {
      const aiResponse = await sendChatMessage(userMessage, chatHistory);
      setChatHistory(prev => [...prev, { role: 'ai', message: aiResponse }]);
    } catch (err) {
      const apiError = err as APIError;
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        message: `${apiError.message}. ${apiError.suggestion}` 
      }]);
    }
  };

  const retryContent = async () => {
    setLoadedTabs(prev => {
      const newSet = new Set(prev);
      newSet.delete(activeTab);
      return newSet;
    });

    switch (activeTab) {
      case 'summary': setSummary(''); break;
      case 'flashcards': setFlashcards([]); break;
      case 'quiz': setQuiz([]); break;
    }
  };

  const toggleFlashcard = (index: number) => {
    setFlashcards(prev => prev.map((card, i) => 
      i === index ? { ...card, revealed: !card.revealed } : card
    ));
  };

  const selectQuizAnswer = (questionIndex: number, optionIndex: number) => {
    setQuiz(prev => prev.map((q, i) => 
      i === questionIndex ? { ...q, selected: optionIndex } : q
    ));
  };

  const renderErrorCard = (error: APIError) => (
    <motion.div 
      className="bg-red-50 border border-red-200 rounded-2xl p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {error.type === 'quota' ? 'API Quota Exceeded' : 
             error.type === 'auth' ? 'Authentication Error' :
             error.type === 'network' ? 'Connection Error' : 'Error'}
          </h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          <p className="text-red-600 text-sm mb-4">{error.suggestion}</p>
          
          <div className="flex space-x-3">
            <motion.button
              onClick={retryContent}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm flex items-center space-x-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </motion.button>
            
            {(error.type === 'quota' || error.type === 'auth') && (
              <motion.button
                onClick={() => navigate('/setup')}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderResourceContent = () => {
    // Handle YouTube URLs
    if ((resource.type === 'link' || resource.type === 'video') && resource.url && (resource.url.includes('youtube.com') || resource.url.includes('youtu.be'))) {
      const videoIdMatch = resource.url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={resource.name}
          />
        );
      }
    }
    
    // Handle local video files
    if (resource.type === 'video' && resource.url) {
      return (
        <video 
          src={resource.url} 
          controls 
          className="w-full h-full object-contain bg-black"
        />
      );
    }
    
    // Handle PDF files
    if (resource.type === 'document' && resource.url && resource.name.toLowerCase().endsWith('.pdf')) {
      return (
        <iframe
          src={resource.url}
          className="w-full h-full"
          title={resource.name}
        />
      );
    }

    // Handle other documents or resources without a specific viewer
    return (
      <div className="w-full h-full bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800">{resource.name}</h3>
          <p className="text-gray-500 mt-2 max-w-sm">A preview for this file type is not available, but you can still use the AI tools to analyze its content.</p>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((chat, index) => (
                <motion.div
                  key={index}
                  className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`max-w-xs md:max-w-md p-4 rounded-2xl ${
                    chat.role === 'user' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {chat.message}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 p-4 rounded-2xl flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>{error.message}</strong>
                      <p className="mt-1 text-xs">{error.suggestion}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={isConfigured ? "Ask about the content..." : "Configure API key to chat"}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  disabled={loading || !isConfigured}
                />
                <motion.button
                  type="submit"
                  disabled={loading || !chatMessage.trim() || !isConfigured}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send'}
                </motion.button>
              </div>
            </form>
          </div>
        );
      
      case 'summary':
        return (
          <div className="p-6 overflow-y-auto h-full">
            {loading && !summary ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <span className="ml-2">Generating summary...</span>
              </div>
            ) : error && !summary ? (
              renderErrorCard(error)
            ) : summary ? (
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="text-xl font-medium mb-4">AI Summary</h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {summary}
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <strong>Note:</strong> This content was generated with fallback due to API issues.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        );
      
      case 'flashcards':
        return (
          <div className="p-6 overflow-y-auto h-full">
            {loading && flashcards.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <span className="ml-2">Generating flashcards...</span>
              </div>
            ) : error && flashcards.length === 0 ? (
              renderErrorCard(error)
            ) : flashcards.length > 0 ? (
              <div className="space-y-4">
                {error && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <strong>Note:</strong> Some flashcards may be fallback content due to API issues.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flashcards.map((card, index) => (
                    <motion.div
                      key={index}
                      className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => toggleFlashcard(index)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <h4 className="font-medium mb-2">
                        {card.revealed ? 'Answer:' : 'Question:'}
                      </h4>
                      <p className="text-gray-600">
                        {card.revealed ? card.answer : card.question}
                      </p>
                      <p className="text-xs text-gray-400 mt-3">
                        Click to {card.revealed ? 'hide' : 'reveal'} answer
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="p-6 overflow-y-auto h-full">
            {loading && quiz.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
                <span className="ml-2">Generating quiz...</span>
              </div>
            ) : error && quiz.length === 0 ? (
              renderErrorCard(error)
            ) : quiz.length > 0 ? (
              <div className="space-y-6">
                {error && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <strong>Note:</strong> This quiz may contain fallback content due to API issues.
                  </div>
                )}
                <div className="bg-green-50 rounded-2xl p-6">
                  <h3 className="text-xl font-medium mb-6">Generated Quiz</h3>
                  <div className="space-y-6">
                    {quiz.map((question, qIndex) => (
                      <div key={qIndex} className="bg-white rounded-xl p-6">
                        <h4 className="font-medium mb-4">
                          Question {qIndex + 1}: {question.question}
                        </h4>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <button
                              key={oIndex}
                              onClick={() => selectQuizAnswer(qIndex, oIndex)}
                              className={`w-full text-left p-3 border rounded-lg transition-colors ${
                                question.selected === oIndex
                                  ? question.selected === question.correct
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-red-500 bg-red-50'
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                        {question.selected !== undefined && (
                          <p className={`mt-3 text-sm ${
                            question.selected === question.correct ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {question.selected === question.correct ? 'Correct!' : 'Incorrect. Try again!'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Panel - Content Viewer */}
      <motion.div 
        className="w-1/2 p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="h-full bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
          {renderResourceContent()}
        </div>
      </motion.div>

      {/* Right Panel - AI Tools */}
      <motion.div 
        className="w-1/2 border-l border-gray-200 flex flex-col"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-center space-x-2">
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </motion.div>
    </div>
  );
};

export default ResourceViewer;
