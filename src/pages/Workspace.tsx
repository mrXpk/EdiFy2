import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, Upload } from 'lucide-react';
import { useAPIKey } from '../contexts/APIKeyContext';
import UploadInterface from '../components/UploadInterface';
import ResourceViewer from '../components/ResourceViewer';

interface Resource {
  id: string;
  type: 'video' | 'document' | 'link';
  name: string;
  url?: string;
  content?: string;
}

const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const { isConfigured } = useAPIKey();
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [showUpload, setShowUpload] = useState(true);

  React.useEffect(() => {
    if (!isConfigured) {
      navigate('/setup');
    }
  }, [isConfigured, navigate]);

  const handleResourceUpload = (resource: Resource) => {
    setCurrentResource(resource);
    setShowUpload(false);
  };

  const handleNewResource = () => {
    setCurrentResource(null);
    setShowUpload(true);
  };

  if (!isConfigured) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        className="px-6 py-4 bg-white border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <span className="text-2xl font-light">EdiFy</span>
            </motion.button>

            {currentResource && (
              <motion.button
                onClick={handleNewResource}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                <Upload className="w-4 h-4" />
                <span>New Resource</span>
              </motion.button>
            )}
          </div>

          <motion.button
            onClick={() => navigate('/setup')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {showUpload && !currentResource ? (
          <UploadInterface onResourceUpload={handleResourceUpload} />
        ) : (
          currentResource && (
            <ResourceViewer 
              resource={currentResource} 
              onNewResource={handleNewResource}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Workspace;
