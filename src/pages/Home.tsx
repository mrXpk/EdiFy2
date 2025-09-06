import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, FileText, Video, Sparkles } from 'lucide-react';
import { useAPIKey } from '../contexts/APIKeyContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isConfigured } = useAPIKey();

  const handleGetStarted = () => {
    if (isConfigured) {
      navigate('/workspace');
    } else {
      navigate('/setup');
    }
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI analyzes your content to extract key insights and generate personalized learning materials.'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Smart Summaries',
      description: 'Get concise, intelligent summaries of videos and documents to grasp concepts quickly.'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Interactive Learning',
      description: 'Generate flashcards, quizzes, and chat with your content for deeper understanding.'
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Multi-Format Support',
      description: 'Upload videos, documents, or paste links. EdiFy works with various content formats.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        className="px-6 py-8 md:px-12"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="text-2xl font-light">EdiFy</span>
          </div>
          
          <motion.button
            onClick={handleGetStarted}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isConfigured ? 'Open Workspace' : 'Get Started'}
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="px-6 py-16 md:px-12 md:py-24"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
            Transform Your
            <br />
            <span className="font-normal">Learning</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light max-w-2xl mx-auto">
            Upload any video or document and let AI create personalized summaries, flashcards, and quizzes for enhanced learning.
          </p>
          
          <motion.button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-black text-white rounded-full text-lg hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isConfigured ? 'Continue Learning' : 'Start Learning'}
          </motion.button>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section 
        className="px-6 py-16 md:px-12 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-16">
            Intelligent Learning Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <div className="mb-4 flex justify-center text-black">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-gray-600 font-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="px-6 py-8 md:px-12 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 font-light">
            © 2025 EdiFy. Empowering learners with AI.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;
