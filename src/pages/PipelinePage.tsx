import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Calendar, User } from 'lucide-react';
import { mockPipelineItems } from '../data/mockData';
import { PipelineStage, ContentItem } from '../types';
import { format } from 'date-fns';

const stages: { id: PipelineStage; label: string }[] = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'research', label: 'Research' },
  { id: 'script', label: 'Script' },
  { id: 'recording', label: 'Recording' },
  { id: 'editing', label: 'Editing' },
  { id: 'ready', label: 'Ready' }
];

export function PipelinePage() {
  const [items, setItems] = useState<ContentItem[]>(mockPipelineItems);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Moving between columns logic (simplified for mockup: we just drop onto a column or item)
    // For a robust Kanban, we'd handle moving between different SortableContexts.
    // To keep it simple in this iteration, we'll just implement basic state updates.
    
    // Find the item being dragged
    const itemToMove = items.find(i => i.id === activeId);
    if (!itemToMove) return;

    // Determine target stage
    let targetStage: PipelineStage | null = null;
    
    if (stages.some(s => s.id === overId)) {
      // Dropped directly onto a column container
      targetStage = overId as PipelineStage;
    } else {
      // Dropped onto another item
      const overItem = items.find(i => i.id === overId);
      if (overItem) targetStage = overItem.stage;
    }

    if (targetStage && itemToMove.stage !== targetStage) {
      setItems(prev => prev.map(item => 
        item.id === activeId ? { ...item, stage: targetStage! } : item
      ));
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Content Pipeline</h2>
          <p className="text-sm text-zinc-500 mt-1">Manage your content production workflow.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Idea
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 h-full min-w-max items-start">
            {stages.map(stage => {
              const columnItems = items.filter(item => item.stage === stage.id);
              return (
                <div key={stage.id} id={stage.id} className="w-80 bg-zinc-100/50 rounded-2xl border border-zinc-200/60 p-4 flex flex-col max-h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-700">{stage.label}</h3>
                    <span className="bg-white border border-zinc-200 text-zinc-600 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                      {columnItems.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    <SortableContext items={columnItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                      {columnItems.map(item => (
                        <SortableCard key={item.id} item={item} />
                      ))}
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
}

const SortableCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-xl border ${isDragging ? 'border-indigo-400 shadow-lg' : 'border-zinc-200 shadow-sm'} hover:border-indigo-300 transition-colors group relative`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-4 right-3 text-zinc-400 hover:text-zinc-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
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
        
        <h4 className="font-medium text-zinc-900 leading-snug mb-3">
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
                {format(new Date(item.targetDate), 'MMM d')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
