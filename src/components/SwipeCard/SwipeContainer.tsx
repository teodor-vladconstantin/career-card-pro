import { useState, useRef, useEffect } from 'react';
import { Job } from '@/types/database';
import { JobCard } from './JobCard';
import { Button } from '@/components/ui/button';
import { X, Heart, RotateCcw } from 'lucide-react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeContainerProps {
  jobs: Job[];
  onSwipe: (jobId: string, direction: 'left' | 'right') => void;
  onLoadMore?: () => void;
}

export const SwipeContainer = ({ jobs, onSwipe, onLoadMore }: SwipeContainerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.5, 1, 1, 1, 0.5]);

  const currentJob = jobs[currentIndex];


  const handleDragEnd = (event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      setExitX(direction === 'right' ? 1000 : -1000);
      handleSwipe(direction);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentJob) {
      onSwipe(currentJob.id, direction);
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setExitX(0);
        x.set(0);
      }, 300);
    }
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    setExitX(direction === 'right' ? 1000 : -1000);
    handleSwipe(direction);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentJob) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">No more jobs!</h3>
          <p className="text-muted-foreground">
            Check back later for new opportunities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Card Stack Container */}
      <div className="relative w-full max-w-md h-[600px]">
        {/* Next card preview */}
        {jobs[currentIndex + 1] && (
          <div className="absolute w-full h-full" style={{ transform: 'scale(0.95)', zIndex: 0 }}>
            <JobCard job={jobs[currentIndex + 1]} />
          </div>
        )}

        {/* Current card */}
        <motion.div
          className="absolute w-full h-full"
          style={{ x, rotate, opacity, zIndex: 1 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{ x: exitX }}
          transition={{ duration: 0.3 }}
        >
          <JobCard job={currentJob} isDragging={true} />
        </motion.div>

        {/* Swipe Indicators */}
        <motion.div
          className="absolute top-8 left-8 pointer-events-none z-10"
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
        >
          <div className="bg-destructive/90 text-white px-6 py-3 rounded-full font-bold text-lg border-4 border-white shadow-lg rotate-[-15deg]">
            PASS
          </div>
        </motion.div>

        <motion.div
          className="absolute top-8 right-8 pointer-events-none z-10"
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
        >
          <div className="bg-success/90 text-white px-6 py-3 rounded-full font-bold text-lg border-4 border-white shadow-lg rotate-[15deg]">
            APPLY
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className={cn(
            "w-16 h-16 rounded-full border-2 hover:bg-destructive/10 hover:border-destructive hover:scale-110 transition-all",
            "shadow-lg"
          )}
          onClick={() => handleButtonSwipe('left')}
        >
          <X className="h-6 w-6 text-destructive" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          className={cn(
            "w-12 h-12 rounded-full border-2 hover:scale-110 transition-all",
            "shadow-lg"
          )}
          onClick={handleUndo}
          disabled={currentIndex === 0}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          className={cn(
            "w-16 h-16 rounded-full gradient-primary hover:shadow-glow hover:scale-110 transition-all",
            "shadow-lg"
          )}
          onClick={() => handleButtonSwipe('right')}
        >
          <Heart className="h-6 w-6 fill-white" />
        </Button>
      </div>

      {/* Progress */}
      <div className="text-center text-sm text-muted-foreground">
        {currentIndex + 1} / {jobs.length} jobs
      </div>
    </div>
  );
};
