import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const Splash = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900 text-white"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-2xl border border-white/20">
          <Globe size={48} className="text-blue-300" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">{t('splash.title')}</h1>
        <p className="text-blue-200 text-lg font-light">{t('splash.subtitle')}</p>

        <div className="mt-12 flex space-x-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-2 h-2 bg-blue-300 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
            className="w-2 h-2 bg-blue-300 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
            className="w-2 h-2 bg-blue-300 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Splash;
