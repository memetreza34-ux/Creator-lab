import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Calendar, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PipelineStage, ContentItem } from '../types';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const stages: { id: PipelineStage; label: string }[] = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'research', label: 'Research' },
  { id: 'script', label: 'Script' },
  { id: 'recording', label: 'Recording' },
  { id: 'editing', label: 'Editing' },
  { id: 'ready', label: 'Ready' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' }
];

const DroppableColumn: React.FC<{ id: string; label: string; children: React.ReactNode; count: number }> = ({ id, label, children, count }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`w-80 rounded-2xl border p-4 flex flex-col max-h-full transition-colors ${
        isOver ? 'bg-indigo-50 border-indigo-200' : 'bg-zinc-100/50 border-zinc-200/60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-700">{label}</h3>
        <span className="bg-white border border-zinc-200 text-zinc-600 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">
          {count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {children}
      </div>
    </div>
  );
};

const SortableCard: React.FC<{ item: ContentItem; onClick?: () => void }> = ({ item, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, data: { stage: item.stage } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`bg-white p-4 rounded-xl border ${isDragging ? 'border-indigo-400 shadow-lg' : 'border-zinc-200 shadow-sm'} hover:border-indigo-300 transition-colors group relative cursor-pointer`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-3 right-2 p-1 text-zinc-400 hover:text-zinc-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="pr-6">
        <div className="flex items-center space-x-2 mb-2">
          {item.platforms.map(p => (
            <span key={p} className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded">
              {p}
            </span>
          ))}
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">
            {item.format}
          </span>
        </div>
        
        <h4 className="font-medium text-zinc-900 leading-snug mb-3 line-clamp-2">
          {item.title}
        </h4>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3 text-xs text-zinc-500 font-medium">
            <div className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1" />
              {item.owner.split(' ')[0]}
            </div>
            {item.targetDate && (
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
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
    
    // Check if over is a stage container
    if (stages.some(s => s.id === overId)) {
      targetStage = overId as PipelineStage;
    } else {
      // Check if over is another item
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
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Content Pipeline</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage your content production workflow.</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Idea
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 h-full min-w-max items-start">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-zinc-900">{editingItem ? 'Edit Idea' : 'New Idea'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
                  <input 
                    name="title" 
                    defaultValue={editingItem?.title || ''} 
                    required
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
                  />
                </div>
              </div>
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">Cancel</button>
                {editingItem && (
                  <button type="button" 
                    onClick={() => {
                      if (window.confirm('Delete this item?')) {
                        dispatch({ type: 'DELETE_PIPELINE_ITEM', payload: editingItem.id });
                        setIsModalOpen(false);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mr-auto"
                  >Delete</button>
                )}
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 shadow-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
