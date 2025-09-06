import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, FileText, Video, Sparkles, Brain } from 'lucide-react';

interface Resource {
  id: string;
  type: 'video' | 'document' | 'link';
  name: string;
  url?: string;
  content?: string;
}

interface UploadInterfaceProps {
  onResourceUpload: (resource: Resource) => void;
}

const UploadInterface: React.FC<UploadInterfaceProps> = ({ onResourceUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    const resource: Resource = {
      id: Date.now().toString(),
      type: file.type.startsWith('video/') ? 'video' : 'document',
      name: file.name,
      url: URL.createObjectURL(file),
    };
    onResourceUpload(resource);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      const resource: Resource = {
        id: Date.now().toString(),
        type: 'video',
        name: 'Video Link',
        url: linkUrl,
      };
      onResourceUpload(resource);
    }
  };

  const features = [
    { icon: <Brain className="w-6 h-6" />, text: 'AI Analysis' },
    { icon: <FileText className="w-6 h-6" />, text: 'Smart Summaries' },
    { icon: <Sparkles className="w-6 h-6" />, text: 'Interactive Quizzes' },
  ];

  return (
    <div className="px-6 py-16 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            Upload Your Content
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Drop a file or paste a video link to start learning
          </p>
        </motion.div>

        <motion.div
          className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all ${
            dragOver ? 'border-black bg-gray-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="mb-8">
            <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-light mb-2">Drop your files here</h3>
            <p className="text-gray-600">
              or click to browse your computer
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              accept="video/*,audio/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.label
                htmlFor="file-upload"
                className="px-8 py-3 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition-colors inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-5 h-5" />
                <span>Choose File</span>
              </motion.label>

              <motion.button
                onClick={() => setShowLinkInput(!showLinkInput)}
                className="px-8 py-3 border border-black text-black rounded-full hover:bg-black hover:text-white transition-colors inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LinkIcon className="w-5 h-5" />
                <span>Paste Link</span>
              </motion.button>
            </div>

            {showLinkInput && (
              <motion.form 
                onSubmit={handleLinkSubmit}
                className="mt-6 max-w-md mx-auto"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="Paste YouTube or video URL"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  />
                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add
                  </motion.button>
                </div>
              </motion.form>
            )}
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                {feature.icon}
              </div>
              <p className="text-gray-600 font-light">{feature.text}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default UploadInterface;
