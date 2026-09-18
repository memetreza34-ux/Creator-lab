import React, { useState } from 'react';
import { 
  Beaker, TrendingUp, Users, ArrowRight, Plus, 
  CheckCircle2, Play, Pause, Trash2, Trophy, X, 
  Sparkles, Award, Clock, Image, Type, HelpCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Experiment, ExperimentType, ExperimentStatus } from '../types';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export function ExperimentLabPage() {
  const { state, dispatch } = useApp();
  
  // Workspace-scoped experiments
  const experiments = state.experiments.filter(
    exp => exp.workspaceId === state.activeWorkspaceId
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State for new experiment
  const [name, setName] = useState('');
  const [type, setType] = useState<ExperimentType>('hook');
  const [hypothesis, setHypothesis] = useState('');
  const [primaryMetric, setPrimaryMetric] = useState('Click-Through Rate (CTR)');
  const [variantALabel, setVariantALabel] = useState('');
  const [variantAContent, setVariantAContent] = useState('');
  const [variantBLabel, setVariantBLabel] = useState('');
  const [variantBContent, setVariantBContent] = useState('');
  const [status, setStatus] = useState<ExperimentStatus>('running');

  const filteredExperiments = experiments.filter(exp => {
    if (filterStatus === 'all') return true;
    return exp.status === filterStatus;
  });

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !variantALabel.trim() || !variantBLabel.trim()) {
      toast.error('Please fill in required experiment titles and variants');
      return;
    }

    const newExperiment: Experiment = {
      id: uuidv4(),
      workspaceId: state.activeWorkspaceId,
      name: name.trim(),
      type,
      hypothesis: hypothesis.trim(),
      primaryMetric,
      status,
      variantA: {
        label: variantALabel.trim(),
        content: variantAContent.trim(),
        metric: 0
      },
      variantB: {
        label: variantBLabel.trim(),
        content: variantBContent.trim(),
        metric: 0
      },
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_EXPERIMENT', payload: newExperiment });
    toast.success('Experiment initialized');
    setIsCreateOpen(false);

    // Reset fields
    setName('');
    setHypothesis('');
    setVariantALabel('');
    setVariantAContent('');
    setVariantBLabel('');
    setVariantBContent('');
  };

  const handleStatusChange = (experiment: Experiment, newStatus: ExperimentStatus) => {
    dispatch({
      type: 'UPDATE_EXPERIMENT',
      payload: { ...experiment, status: newStatus }
    });
    toast.success(`Experiment marked as ${newStatus}`);
  };

  const handleDeclareWinner = (experiment: Experiment, winner: 'A' | 'B') => {
    dispatch({
      type: 'UPDATE_EXPERIMENT',
      payload: { 
        ...experiment, 
        winner, 
        status: 'concluded',
        aiInterpretation: `Variant ${winner} was declared the winning creative based on higher ${experiment.primaryMetric}.`
      }
    });
    toast.success(`Variant ${winner} declared as winner!`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this experiment?')) {
      dispatch({ type: 'DELETE_EXPERIMENT', payload: id });
      toast.success('Experiment removed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6 h-full flex flex-col bg-white overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 pb-4 border-b border-[#EBEBE9]">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">
            Creator Experiment Lab
          </h1>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Statistical A/B testing for hooks, titles, thumbnails, and posting hours
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center bg-[#FAFAF9] border border-[#EBEBE9] rounded-lg p-0.5 text-[12px]">
            {(['all', 'running', 'concluded', 'draft'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                  filterStatus === tab 
                    ? 'bg-white text-zinc-900 shadow-2xs font-semibold' 
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 transition-all shadow-xs"
          >
            <Beaker className="w-4 h-4 mr-1.5" />
            New Experiment
          </button>
        </div>
      </div>

      {/* Experiments Grid */}
      {filteredExperiments.length === 0 ? (
        <div className="h-64 border border-dashed border-[#DCDCD8] rounded-2xl flex flex-col items-center justify-center p-6 text-center">
          <Beaker className="w-8 h-8 text-zinc-300 mb-2" />
          <h3 className="text-[14px] font-semibold text-zinc-800">No experiments found</h3>
          <p className="text-[12px] text-zinc-500 mt-1 max-w-sm">
            Launch an A/B test between two hooks, titles, or thumbnails to scientifically prove what resonates.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 px-4 py-1.5 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700"
          >
            Create Your First Experiment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 shrink-0 pb-8">
          {filteredExperiments.map((exp) => (
            <ExperimentCard 
              key={exp.id} 
              experiment={exp} 
              onStatusChange={handleStatusChange}
              onDeclareWinner={handleDeclareWinner}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Experiment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[#EBEBE9] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#EBEBE9] flex justify-between items-center bg-[#FAFAF9]">
              <div className="flex items-center space-x-2">
                <Beaker className="w-4 h-4 text-brand-600" />
                <h3 className="text-[15px] font-semibold text-zinc-900">Configure A/B Experiment</h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="p-1 hover:bg-zinc-200/60 rounded-md text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExperiment} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-[12px] font-medium text-zinc-700 mb-1">Experiment Name</label>
                <input 
                  autoFocus
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Opening Hook: Provocative vs Direct Promise"
                  className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-zinc-700 mb-1">Experiment Type</label>
                  <select 
                    value={type}
                    onChange={e => setType(e.target.value as ExperimentType)}
                    className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  >
                    <option value="hook">Opening Hook</option>
                    <option value="title">Title / Headline</option>
                    <option value="thumbnail">Thumbnail Visual</option>
                    <option value="caption">Caption & Hashtags</option>
                    <option value="posting_time">Posting Hour / Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-zinc-700 mb-1">Primary Success Metric</label>
                  <select 
                    value={primaryMetric}
                    onChange={e => setPrimaryMetric(e.target.value)}
                    className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                  >
                    <option value="Click-Through Rate (CTR)">Click-Through Rate (CTR)</option>
                    <option value="10-Second Retention Rate">10-Second Retention Rate</option>
                    <option value="Engagement Rate (%)">Engagement Rate (%)</option>
                    <option value="Comments / Conversation">Comments / Conversation</option>
                    <option value="Watch Time (seconds)">Watch Time (seconds)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-700 mb-1">Hypothesis</label>
                <input 
                  value={hypothesis}
                  onChange={e => setHypothesis(e.target.value)}
                  placeholder="e.g. Stating the negative consequence will increase CTR by 20%"
                  className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Variants Setup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-[#FAFAF9] rounded-xl border border-[#EBEBE9] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Variant A (Control)</span>
                  </div>
                  <input
                    required
                    placeholder="Short label (e.g. Standard Title)"
                    value={variantALabel}
                    onChange={e => setVariantALabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DCDCD8] rounded-md text-[12px]"
                  />
                  <textarea
                    rows={3}
                    placeholder="Content, copy, or visual description"
                    value={variantAContent}
                    onChange={e => setVariantAContent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DCDCD8] rounded-md text-[12px] resize-none"
                  />
                </div>

                <div className="p-3 bg-[#FAFAF9] rounded-xl border border-[#EBEBE9] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Variant B (Challenger)</span>
                  </div>
                  <input
                    required
                    placeholder="Short label (e.g. Provocative Question)"
                    value={variantBLabel}
                    onChange={e => setVariantBLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DCDCD8] rounded-md text-[12px]"
                  />
                  <textarea
                    rows={3}
                    placeholder="Content, copy, or visual description"
                    value={variantBContent}
                    onChange={e => setVariantBContent(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#DCDCD8] rounded-md text-[12px] resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2F2F0] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="text-[12px] font-medium text-zinc-600">Initial Status:</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ExperimentStatus)}
                    className="px-2 py-1 border border-[#DCDCD8] rounded-md text-[12px] bg-white"
                  >
                    <option value="running">Running immediately</option>
                    <option value="draft">Save as Draft</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateOpen(false)}
                    className="px-3.5 py-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-[12px] font-semibold hover:bg-brand-700 shadow-xs"
                  >
                    Launch Experiment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ExperimentCardProps {
  experiment: Experiment; 
  onStatusChange: (exp: Experiment, s: ExperimentStatus) => void;
  onDeclareWinner: (exp: Experiment, w: 'A' | 'B') => void;
  onDelete: (id: string) => void;
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({ 
  experiment, 
  onStatusChange, 
  onDeclareWinner, 
  onDelete 
}) => {
  const isRunning = experiment.status === 'running';
  const isConcluded = experiment.status === 'concluded';
  
  const metricA = experiment.variantA.metric || 0;
  const metricB = experiment.variantB.metric || 0;
  const totalMetric = metricA + metricB;
  const aPercent = totalMetric > 0 ? (metricA / totalMetric) * 100 : 50;
  const bPercent = totalMetric > 0 ? (metricB / totalMetric) * 100 : 50;

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#EBEBE9] shadow-xs flex flex-col group hover:border-brand-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
              {experiment.type} A/B
            </span>
            <span className="text-[11px] text-zinc-400">
              Metric: {experiment.primaryMetric}
            </span>
          </div>
          <h3 className="text-[15px] font-semibold text-zinc-900 leading-snug">
            {experiment.name}
          </h3>
          {experiment.hypothesis && (
            <p className="text-[11px] text-zinc-500 mt-1 italic">
              "{experiment.hypothesis}"
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isRunning
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : isConcluded
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {experiment.status}
          </span>
          <button
            onClick={() => onDelete(experiment.id)}
            className="p-1 text-zinc-400 hover:text-rose-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete experiment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-2 gap-3 flex-1 mb-4">
        {/* Variant A */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          experiment.winner === 'A'
            ? 'border-emerald-500 bg-emerald-50/30'
            : experiment.winner === 'B'
            ? 'border-[#EBEBE9] bg-[#FAFAF9] opacity-70'
            : 'border-[#EBEBE9] bg-white'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-100 px-1.5 py-0.5 rounded">
                Variant A
              </span>
              {experiment.winner === 'A' && (
                <span className="flex items-center text-[11px] font-bold text-emerald-700">
                  <Trophy className="w-3 h-3 mr-1" /> Winner
                </span>
              )}
            </div>
            <p className="text-[12px] font-semibold text-zinc-900 leading-snug">
              {experiment.variantA.label}
            </p>
            {experiment.variantA.content && (
              <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                {experiment.variantA.content}
              </p>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#F2F2F0] flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-900">
              {metricA > 0 ? `${metricA}%` : 'Pending'}
            </span>
            {!isConcluded && (
              <button
                onClick={() => onDeclareWinner(experiment, 'A')}
                className="text-[10px] font-semibold text-brand-600 hover:text-brand-800 hover:underline"
              >
                Declare Winner
              </button>
            )}
          </div>
        </div>

        {/* Variant B */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          experiment.winner === 'B'
            ? 'border-emerald-500 bg-emerald-50/30'
            : experiment.winner === 'A'
            ? 'border-[#EBEBE9] bg-[#FAFAF9] opacity-70'
            : 'border-[#EBEBE9] bg-white'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-1.5 py-0.5 rounded">
                Variant B
              </span>
              {experiment.winner === 'B' && (
                <span className="flex items-center text-[11px] font-bold text-emerald-700">
                  <Trophy className="w-3 h-3 mr-1" /> Winner
                </span>
              )}
            </div>
            <p className="text-[12px] font-semibold text-zinc-900 leading-snug">
              {experiment.variantB.label}
            </p>
            {experiment.variantB.content && (
              <p className="text-[11px] text-zinc-600 mt-1 line-clamp-2">
                {experiment.variantB.content}
              </p>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-[#F2F2F0] flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-900">
              {metricB > 0 ? `${metricB}%` : 'Pending'}
            </span>
            {!isConcluded && (
              <button
                onClick={() => onDeclareWinner(experiment, 'B')}
                className="text-[10px] font-semibold text-brand-600 hover:text-brand-800 hover:underline"
              >
                Declare Winner
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Ratio Bar */}
      {totalMetric > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-semibold text-zinc-500 mb-1">
            <span>A: {aPercent.toFixed(1)}%</span>
            <span>B: {bPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden flex">
            <div className="bg-brand-600 h-full transition-all duration-700" style={{ width: `${aPercent}%` }} />
            <div className="bg-indigo-400 h-full transition-all duration-700" style={{ width: `${bPercent}%` }} />
          </div>
        </div>
      )}

      {/* Interpretation or Status Controls */}
      {experiment.aiInterpretation && (
        <div className="p-2.5 bg-[#FAFAF9] rounded-lg border border-[#F2F2F0] text-[11px] text-zinc-600 flex items-start space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{experiment.aiInterpretation}</p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-[#F2F2F0] flex items-center justify-between text-[11px]">
        <div className="text-zinc-400">
          {experiment.createdAt ? new Date(experiment.createdAt).toLocaleDateString() : 'Active'}
        </div>

        <div className="flex items-center space-x-2">
          {isRunning ? (
            <button
              onClick={() => onStatusChange(experiment, 'concluded')}
              className="font-medium text-zinc-600 hover:text-zinc-900 flex items-center"
            >
              <Pause className="w-3 h-3 mr-1" /> Finish Test
            </button>
          ) : !isConcluded ? (
            <button
              onClick={() => onStatusChange(experiment, 'running')}
              className="font-semibold text-brand-700 hover:text-brand-900 flex items-center"
            >
              <Play className="w-3 h-3 mr-1" /> Start Test
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
