import React from 'react';
import { Beaker, TrendingUp, Users } from 'lucide-react';
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
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">A/B Experiment Lab</h1>
          <p className="text-sm text-zinc-500 mt-1">Test variants and track statistical significance.</p>
        </div>
        <button 
          onClick={handleNewExperiment}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Beaker className="w-4 h-4 mr-2" />
          New Experiment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  const aPercent = (experiment.variantA.metric / totalMetric) * 100;
  const bPercent = (experiment.variantB.metric / totalMetric) * 100;

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">{experiment.name}</h3>
          <div className="flex items-center mt-2 space-x-4 text-sm text-zinc-500 font-medium">
            <span className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-zinc-400" />
              {experiment.metricName}
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-zinc-400" />
              1.2k participants
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isRunning
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {isRunning ? 'Running' : 'Concluded'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
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

      <div className="mt-6">
        <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-2">
          <span>Variant A ({aPercent.toFixed(1)}%)</span>
          <span>Variant B ({bPercent.toFixed(1)}%)</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden flex">
          <div className="bg-indigo-500 h-full" style={{ width: `${aPercent}%` }} />
          <div className="bg-emerald-500 h-full" style={{ width: `${bPercent}%` }} />
        </div>
      </div>
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
      className={`p-4 rounded-xl border-2 transition-colors ${
        isWinner
          ? 'border-emerald-500 bg-emerald-50/50'
          : isLoser
          ? 'border-zinc-100 bg-zinc-50 opacity-60'
          : 'border-zinc-100 bg-zinc-50'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-zinc-500 bg-zinc-200/60 px-2 py-0.5 rounded-md">
          Variant {letter}
        </span>
        {isWinner && (
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Winner
          </span>
        )}
      </div>
      <p className="font-semibold text-zinc-900 text-sm mb-4 leading-snug">
        {variant.label}
      </p>
      <div className="text-2xl font-bold text-zinc-900">
        {variant.metric}
      </div>
    </div>
  );
}
