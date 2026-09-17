import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../context/AppContext';
import { ContentItem, PipelineStage } from '../types';
import { Plus, GripVertical, Calendar, User, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { PlatformIcon } from '../components/ui/PlatformIcon';

const stages: { id: PipelineStage; label: string }[] = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'script', label: 'Scripting' },
  { id: 'recording', label: 'Production' },
  { id: 'editing', label: 'Editing' },
  { id: 'research', label: 'Review' },
  { id: 'ready', label: 'Ready' }
];

const DroppableColumn: React.FC<{ id: string, label: string, children: React.ReactNode, count: number }> = ({ id, label, children, count }) => {
  return (
    <div className="w-[280px] shrink-0 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[14px] font-semibold text-zinc-900">{label}</h3>
        <span className="bg-zinc-200 text-zinc-600 text-[11px] font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="bg-white border border-border-subtle rounded-[12px] p-2 min-h-[500px] shadow-sm flex-1">
        <div className="space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const SortableCard: React.FC<{ item: ContentItem, onClick?: () => void }> = ({ item, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`bg-white p-3 rounded-[8px] border ${isDragging ? 'border-brand-400 shadow-lg' : 'border-zinc-200 shadow-sm'} hover:border-brand-300 transition-colors group relative cursor-pointer`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <div className="pr-6">
        <div className="flex items-center space-x-1.5 mb-2">
          <div className="flex -space-x-1 mr-1">
            {item.platforms.map(p => (
              <div key={p} className="w-4 h-4 rounded-full bg-zinc-100 border border-white flex items-center justify-center text-zinc-600">
                <PlatformIcon platform={p} className="w-2.5 h-2.5" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-semibold tracking-wide px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">
            {item.format}
          </span>
        </div>
        
        <h4 className="text-[13px] font-medium text-zinc-900 leading-snug mb-3 line-clamp-2">
          {item.title}
        </h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-[11px] text-zinc-500 font-medium">
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              {item.owner.split(' ')[0]}
            </div>
            {item.targetDate && (
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {format(parseISO(item.targetDate), 'MMM d')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function PipelinePage() {
  const { state, dispatch } = useApp();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
  const items = state.pipelineItems.filter(i => i.workspaceId === state.activeWorkspaceId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const itemToMove = items.find(i => i.id === activeId);
    if (!itemToMove) return;

    let targetStage: PipelineStage | null = null;
    
    if (stages.some(s => s.id === overId)) {
      targetStage = overId as PipelineStage;
    } else {
      const overItem = items.find(i => i.id === overId);
      if (overItem) targetStage = overItem.stage;
    }

    if (targetStage && itemToMove.stage !== targetStage) {
      dispatch({ 
        type: 'UPDATE_PIPELINE_ITEM', 
        payload: { ...itemToMove, stage: targetStage } 
      });
      toast.success(`Moved to ${stages.find(s => s.id === targetStage)?.label}`);
    }
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    
    if (editingItem) {
      dispatch({ type: 'UPDATE_PIPELINE_ITEM', payload: { ...editingItem, title } });
      toast.success('Idea updated');
    } else {
      dispatch({ 
        type: 'ADD_PIPELINE_ITEM', 
        payload: {
          id: uuidv4(),
          workspaceId: state.activeWorkspaceId,
          title,
          stage: 'ideas',
          platforms: ['instagram'],
          format: 'short',
          owner: 'Creator Lab',
          tags: []
        }
      });
      toast.success('Idea created');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 h-full flex flex-col bg-surface-bg">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900 tracking-tight">Content Pipeline</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Manage your content production workflow.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-brand-600 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Idea
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 h-full min-w-max items-start">
            {stages.map(stage => {
              const columnItems = items.filter(item => item.stage === stage.id);
              return (
                <DroppableColumn key={stage.id} id={stage.id} label={stage.label} count={columnItems.length}>
                  <SortableContext items={columnItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {columnItems.map(item => (
                      <SortableCard 
                        key={item.id} 
                        item={item} 
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>
          <DragOverlay>
            {activeItem ? <SortableCard item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-[16px] font-semibold text-zinc-900 leading-tight">{editingItem ? 'Edit Idea' : 'New Idea'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-zinc-200/60 rounded-md text-zinc-400 hover:text-zinc-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-zinc-700 mb-1.5">Title</label>
                  <input 
                    name="title" 
                    defaultValue={editingItem?.title || ''} 
                    required
                    className="w-full px-3 py-2 border border-zinc-200 rounded-[8px] focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px]" 
                  />
                </div>
              </div>
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Cancel</button>
                {editingItem && (
                  <button type="button" 
                    onClick={() => {
                      if (window.confirm('Delete this item?')) {
                        dispatch({ type: 'DELETE_PIPELINE_ITEM', payload: editingItem.id });
                        setIsModalOpen(false);
                      }
                    }}
                    className="px-4 py-2 text-[13px] font-medium text-status-danger hover:bg-status-danger/10 rounded-[8px] transition-colors mr-auto"
                  >Delete</button>
                )}
                <button type="submit" className="px-4 py-2 text-[13px] font-medium bg-zinc-900 text-white rounded-[8px] hover:bg-zinc-800 shadow-sm transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
