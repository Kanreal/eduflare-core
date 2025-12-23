import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Star, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface University {
  id: string;
  name: string;
  country: string;
  program?: string;
}

interface BatchSelectorProps {
  universities: University[];
  selectedBatch1: string[]; // First 2 universities
  selectedBatch2: string[]; // Next 3 universities
  onBatch1Change: (ids: string[]) => void;
  onBatch2Change: (ids: string[]) => void;
  maxBatch1?: number;
  maxBatch2?: number;
  className?: string;
}

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  universities,
  selectedBatch1,
  selectedBatch2,
  onBatch1Change,
  onBatch2Change,
  maxBatch1 = 2,
  maxBatch2 = 3,
  className,
}) => {
  const handleToggleBatch1 = (id: string) => {
    if (selectedBatch1.includes(id)) {
      onBatch1Change(selectedBatch1.filter(u => u !== id));
    } else if (selectedBatch1.length < maxBatch1) {
      // Remove from batch 2 if present
      if (selectedBatch2.includes(id)) {
        onBatch2Change(selectedBatch2.filter(u => u !== id));
      }
      onBatch1Change([...selectedBatch1, id]);
    }
  };

  const handleToggleBatch2 = (id: string) => {
    if (selectedBatch2.includes(id)) {
      onBatch2Change(selectedBatch2.filter(u => u !== id));
    } else if (selectedBatch2.length < maxBatch2) {
      // Remove from batch 1 if present
      if (selectedBatch1.includes(id)) {
        onBatch1Change(selectedBatch1.filter(u => u !== id));
      }
      onBatch2Change([...selectedBatch2, id]);
    }
  };

  const getSelectionState = (id: string): 'batch1' | 'batch2' | 'none' => {
    if (selectedBatch1.includes(id)) return 'batch1';
    if (selectedBatch2.includes(id)) return 'batch2';
    return 'none';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Strategy Explanation */}
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-gold" />
          2+3 Application Strategy
        </h4>
        <p className="text-sm text-muted-foreground">
          Select <strong>2 primary universities</strong> for the first batch submission, 
          then <strong>3 backup universities</strong> for the second batch.
        </p>
      </div>

      {/* Batch Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          'rounded-lg border p-4',
          selectedBatch1.length === maxBatch1 
            ? 'border-success/30 bg-success/5' 
            : 'border-primary/30 bg-primary/5'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">Batch 1 (Primary)</span>
            <span className="text-sm text-muted-foreground">
              {selectedBatch1.length}/{maxBatch1}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(selectedBatch1.length / maxBatch1) * 100}%` }}
            />
          </div>
        </div>

        <div className={cn(
          'rounded-lg border p-4',
          selectedBatch2.length === maxBatch2 
            ? 'border-success/30 bg-success/5' 
            : 'border-muted bg-muted/30'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-foreground">Batch 2 (Backup)</span>
            <span className="text-sm text-muted-foreground">
              {selectedBatch2.length}/{maxBatch2}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-muted-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${(selectedBatch2.length / maxBatch2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* University List */}
      <div className="space-y-2">
        {universities.map((uni) => {
          const state = getSelectionState(uni.id);
          const canAddToBatch1 = state !== 'batch1' && selectedBatch1.length < maxBatch1;
          const canAddToBatch2 = state !== 'batch2' && selectedBatch2.length < maxBatch2;

          return (
            <div
              key={uni.id}
              className={cn(
                'rounded-lg border p-4 transition-all',
                state === 'batch1' && 'border-primary bg-primary/5',
                state === 'batch2' && 'border-muted-foreground bg-muted/50',
                state === 'none' && 'border-border hover:border-muted-foreground'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    state === 'batch1' ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    <Building2 className={cn(
                      'w-5 h-5',
                      state === 'batch1' ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{uni.name}</p>
                    <p className="text-sm text-muted-foreground">{uni.country}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Batch 1 Button */}
                  <button
                    onClick={() => handleToggleBatch1(uni.id)}
                    disabled={!canAddToBatch1 && state !== 'batch1'}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      state === 'batch1'
                        ? 'bg-primary text-primary-foreground'
                        : canAddToBatch1
                          ? 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                          : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                    )}
                  >
                    {state === 'batch1' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Batch 1
                      </span>
                    ) : (
                      '+ Batch 1'
                    )}
                  </button>

                  {/* Batch 2 Button */}
                  <button
                    onClick={() => handleToggleBatch2(uni.id)}
                    disabled={!canAddToBatch2 && state !== 'batch2'}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      state === 'batch2'
                        ? 'bg-muted-foreground text-white'
                        : canAddToBatch2
                          ? 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
                          : 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                    )}
                  >
                    {state === 'batch2' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Batch 2
                      </span>
                    ) : (
                      '+ Batch 2'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
