import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Key, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { useAPIKey } from '../contexts/APIKeyContext';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const { apiKey, provider, setApiKey, setProvider } = useAPIKey();
  const [inputKey, setInputKey] = useState(apiKey);
  const [selectedProvider, setSelectedProvider] = useState(provider);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const providers = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 Turbo', website: 'https://platform.openai.com' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude AI models', website: 'https://console.anthropic.com' },
    { id: 'google', name: 'Google', description: 'Gemini models', website: 'https://ai.google.dev' },
  ];

  const testConnection = async () => {
    if (!inputKey.trim()) return;
    
    setTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Test with a simple API call
      const testUrl = selectedProvider === 'openai' 
        ? 'https://api.openai.com/v1/models'
        : selectedProvider === 'anthropic'
        ? 'https://api.anthropic.com/v1/messages'
        : 'https://generativelanguage.googleapis.com/v1beta/models';

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${inputKey.trim()}`
      };

      if (selectedProvider === 'anthropic') {
        headers['x-api-key'] = inputKey.trim();
        headers['anthropic-version'] = '2023-06-01';
        delete headers['Authorization'];
      }

      const response = await fetch(testUrl, {
        method: 'GET',
        headers
      });

      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
      setProvider(selectedProvider);
      navigate('/workspace');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        className="px-6 py-8 md:px-12 bg-white border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto flex items-center">
          <motion.button
            onClick={() => navigate('/')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
            <span className="text-xl font-light">EdiFy</span>
          </div>
        </div>
      </motion.header>

      {/* Setup Content */}
      <motion.div 
        className="px-6 py-16 md:px-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-light mb-4">API Configuration</h1>
            <p className="text-gray-600 font-light text-lg">
              Choose your AI provider and enter your API key to get started with EdiFy.
            </p>
          </div>

          <motion.div 
            className="bg-white rounded-3xl p-8 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-medium mb-4">
                  Select AI Provider
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {providers.map((prov) => (
                    <motion.button
                      key={prov.id}
                      type="button"
                      onClick={() => setSelectedProvider(prov.id)}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        selectedProvider === prov.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{prov.name}</h3>
                          <p className="text-sm text-gray-600">{prov.description}</p>
                        </div>
                        {selectedProvider === prov.id && (
                          <Check className="w-5 h-5 text-black" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <div className="space-y-2">
                  <input
                    type="password"
                    id="apiKey"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    required
                  />
                  
                  {/* Test Connection Button */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      type="button"
                      onClick={testConnection}
                      disabled={!inputKey.trim() || testingConnection}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {testingConnection ? 'Testing...' : 'Test Connection'}
                    </motion.button>
                    
                    {connectionStatus === 'success' && (
                      <div className="flex items-center text-green-600 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        Connected
                      </div>
                    )}
                    
                    {connectionStatus === 'error' && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Connection failed
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Your API key is stored locally and never shared.
                </p>
              </div>

              <motion.button
                type="submit"
                className="w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                disabled={!inputKey.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue to EdiFy
              </motion.button>
            </form>
          </motion.div>

          <motion.div 
            className="mt-8 p-6 bg-blue-50 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="font-medium mb-2">Need an API key?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Visit your chosen provider's website to create an account and generate an API key.
            </p>
            <div className="flex flex-wrap gap-2">
              {providers.map((prov) => (
                <a
                  key={prov.id}
                  href={prov.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Get {prov.name} API Key
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Setup;
