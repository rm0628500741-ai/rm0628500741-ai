import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F172A]/80 backdrop-blur-md"
        >
          <div className="relative">
             <div className="w-24 h-24 rounded-full border-4 border-blue-500/20" />
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
               className="absolute inset-0 w-24 h-24 rounded-full border-t-4 border-blue-500"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="text-blue-500 animate-pulse" size={32} />
             </div>
          </div>
          {message && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-white font-black tracking-widest uppercase text-xs"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
