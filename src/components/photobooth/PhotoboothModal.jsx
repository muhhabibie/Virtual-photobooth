import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import StepFrames from './StepFrames';
import StepCamera from './StepCamera';
import StepReview from './StepReview';
import StepVoice from './StepVoice';
import StepResult from './StepResult';

export default function PhotoboothModal() {
  const { boothOpen, currentStep } = useBooth();

  // Prevent background scroll when photobooth is active
  useEffect(() => {
    document.body.style.overflow = boothOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [boothOpen]);

  const StepComponent = {
    frames: StepFrames,
    camera: StepCamera,
    review: StepReview,
    voice: StepVoice,
    result: StepResult,
  }[currentStep] || StepFrames;

  return (
    <AnimatePresence>
      {boothOpen && (
        <motion.div
          key="fullpage-photobooth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] w-full h-[100dvh] max-h-[100dvh] bg-black overflow-hidden flex flex-col p-0 m-0"
        >
          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}