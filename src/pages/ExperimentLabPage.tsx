import React from 'react';
import { Beaker, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Experiment } from '../types';
import toast from 'react-hot-toast';

export function ExperimentLabPage() {
  const { state } = useApp();
  
  // We don't have workspace filtering for experiments in mock yet, but we'd normally filter here.
  const experiments = state.experiments;

  const handleNewExperiment = () => {
    toast.error('New experiments are not available in the demo');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 h-full flex flex-col bg-surface-bg overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">A/B Experiment Lab</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Test variants and track statistical significance.</p>
        </div>
        <button 
          onClick={handleNewExperiment}
          className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 transition-colors shadow-sm"
        >
          <Beaker className="w-4 h-4 mr-1.5" />
          New Experiment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0 pb-8">
        {experiments.map((exp) => (
          <ExperimentCard key={exp.id} experiment={exp} />
        ))}
      </div>
    </div>
  );
}

const ExperimentCard: React.FC<{ experiment: Experiment }> = ({ experiment }) => {
  const isRunning = experiment.status === 'running';
  const totalMetric = experiment.variantA.metric + experiment.variantB.metric;
  const aPercent = totalMetric > 0 ? (experiment.variantA.metric / totalMetric) * 100 : 50;
  const bPercent = totalMetric > 0 ? (experiment.variantB.metric / totalMetric) * 100 : 50;

  return (
    <div className="bg-white p-5 rounded-[12px] border border-border-subtle shadow-sm flex flex-col group hover:border-brand-200 transition-colors">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-[16px] font-semibold text-zinc-900">{experiment.name}</h3>
          <div className="flex items-center mt-1 space-x-4 text-[12px] text-zinc-500 font-medium">
            <span className="flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-zinc-400" />
              {experiment.metricName}
            </span>
            <span className="flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-zinc-400" />
              1.2k participants
            </span>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
            isRunning
              ? 'bg-amber-100/50 text-amber-700'
              : 'bg-status-success/10 text-status-success'
          }`}
        >
          {isRunning ? 'Running' : 'Concluded'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        <VariantColumn
          variant={experiment.variantA}
          isWinner={experiment.winner === 'A'}
          isLoser={experiment.winner === 'B'}
          letter="A"
        />
        <VariantColumn
          variant={experiment.variantB}
          isWinner={experiment.winner === 'B'}
          isLoser={experiment.winner === 'A'}
          letter="B"
        />
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-[11px] font-semibold text-zinc-500 mb-2">
          <span>Variant A ({aPercent.toFixed(1)}%)</span>
          <span>Variant B ({bPercent.toFixed(1)}%)</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden flex">
          <div className="bg-brand-500 h-full transition-all duration-1000" style={{ width: `${aPercent}%` }} />
          <div className="bg-zinc-300 h-full transition-all duration-1000" style={{ width: `${bPercent}%` }} />
        </div>
      </div>
      
      {!isRunning && (
        <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[12px] font-medium text-zinc-600">
            <span className="font-bold text-zinc-900">Variant {experiment.winner}</span> won with a {Math.abs(aPercent - bPercent).toFixed(1)}% margin.
          </span>
          <button className="text-[12px] font-semibold text-brand-600 flex items-center hover:text-brand-700 transition-colors">
            Apply Winner <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}

function VariantColumn({
  variant,
  isWinner,
  isLoser,
  letter,
}: {
  variant: { label: string; metric: number };
  isWinner: boolean;
  isLoser: boolean;
  letter: string;
}) {
  return (
    <div
      className={`p-4 rounded-[8px] border transition-colors ${
        isWinner
          ? 'border-brand-500 bg-brand-50/30'
          : isLoser
          ? 'border-zinc-100 bg-zinc-50/50 opacity-70'
          : 'border-zinc-200 bg-white'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-[4px]">
          Variant {letter}
        </span>
        {isWinner && (
          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
            Winner
          </span>
        )}
      </div>
      <p className="font-medium text-zinc-900 text-[13px] mb-3 leading-snug line-clamp-3">
        "{variant.label}"
      </p>
      <div className="text-[20px] font-bold text-zinc-900">
        {variant.metric.toLocaleString()}
      </div>
    </div>
  );
}
