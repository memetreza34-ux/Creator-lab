import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../context/AppContext';
import {
  ContentFormat,
  ContentItem,
  PipelineStage,
  Platform,
} from '../types';
import { 
  Plus, GripVertical, Calendar, User, X, Send, 
  Trash2, Edit3, Sparkles, MoreHorizontal, ArrowRight 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { PlatformIcon } from '../components/ui/PlatformIcon';
import { ALL_PLATFORMS } from '../config/platformConfig';
import { movePipelineItem } from '../utils/contentOperations';

const stages: { id: PipelineStage; label: string; description: string }[] = [
  { id: 'ideas', label: 'Ideas', description: 'Brainstorms & concepts' },
  { id: 'research', label: 'Research', description: 'Outlines & references' },
  { id: 'script', label: 'Scripting', description: 'Writing & hook testing' },
  { id: 'recording', label: 'Production', description: 'Filming or creating' },
  { id: 'editing', label: 'Editing', description: 'Post-production & review' },
  { id: 'ready', label: 'Ready', description: 'Approved for publishing' },
  { id: 'scheduled', label: 'Scheduled', description: 'Queued on calendar' },
  { id: 'published', label: 'Published', description: 'Live on channels' }
];

interface DroppableColumnProps {
  id: PipelineStage;
  label: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  id, label, count, onAdd, children 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="w-[290px] shrink-0 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center space-x-2">
          <h3 className="text-[13px] font-semibold text-zinc-900">{label}</h3>
          <span className="bg-[#EBEBE9] text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>

        <button 
          onClick={onAdd}
          className="p-1 hover:bg-[#EBEBE9] text-zinc-500 hover:text-zinc-800 rounded-md transition-colors"
          title={`Add item to ${label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className={`bg-[#FAFAF9] border rounded-xl p-2 min-h-[500px] flex-1 flex flex-col transition-colors ${
          isOver ? 'border-brand-400 bg-brand-50/30' : 'border-[#EBEBE9]'
        }`}
      >
        <div className="space-y-2 flex-1">
          {children}

          {count === 0 && (
            <div className="h-40 border border-dashed border-[#DCDCD8] rounded-lg flex flex-col items-center justify-center p-4 text-center">
              <span className="text-[11px] text-zinc-400 mb-2">No items in {label}</span>
              <button
                onClick={onAdd}
                className="text-[11px] font-semibold text-brand-700 hover:text-brand-900 bg-white hover:bg-zinc-50 border border-[#DCDCD8] px-2.5 py-1 rounded-md shadow-2xs flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add {label.slice(0, -1) || 'Item'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SortableCardProps {
  item: ContentItem;
  onClick?: () => void;
  onCreatePost: (item: ContentItem) => void;
}

const SortableCard: React.FC<SortableCardProps> = ({ 
  item, onClick, onCreatePost 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { item } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`bg-white p-3.5 rounded-xl border ${
        isDragging 
          ? 'border-brand-500 shadow-md ring-2 ring-brand-300 opacity-70' 
          : 'border-[#EBEBE9] shadow-2xs hover:border-brand-300 hover:shadow-xs'
      } transition-all group relative cursor-pointer select-none`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-1.5">
          <div className="flex -space-x-1 mr-1">
            {item.platforms.map(p => (
              <div key={p} className="w-4 h-4 rounded-full bg-white border border-[#EBEBE9] flex items-center justify-center text-zinc-600 p-0.5">
                <PlatformIcon platform={p} className="w-2.5 h-2.5" />
              </div>
            ))}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 bg-[#F2F2F0] text-zinc-600 rounded">
            {item.format}
          </span>
        </div>

        <div 
          {...attributes} 
          {...listeners}
          className="p-1 text-zinc-400 hover:text-zinc-700 cursor-grab active:cursor-grabbing rounded hover:bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
          title="Drag to reorder"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>
      
      <h4 className="text-[13px] font-semibold text-zinc-900 leading-snug mb-2.5 line-clamp-2">
        {item.title}
      </h4>

      {item.notes && (
        <p className="text-[11px] text-zinc-500 line-clamp-2 mb-3 bg-[#FAFAF9] p-1.5 rounded border border-[#F2F2F0]">
          {item.notes}
        </p>
      )}
      
      <div className="flex items-center justify-between pt-2 border-t border-[#F2F2F0]">
        <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-medium">
          <div className="flex items-center">
            <User className="w-2.5 h-2.5 mr-1 text-zinc-400" />
            {item.owner ? item.owner.split(' ')[0] : 'Creator'}
          </div>
          {item.targetDate && (
            <div className="flex items-center">
              <Calendar className="w-2.5 h-2.5 mr-1 text-zinc-400" />
              {format(parseISO(item.targetDate), 'MMM d')}
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreatePost(item);
          }}
          className="text-[11px] font-medium text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100/80 px-2 py-0.5 rounded-md flex items-center space-x-1 transition-colors"
          title="Send to Composer to write & schedule"
        >
          <span>Create Post</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};

export function PipelinePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  
  // Workspace items sorted by order
  const items = state.pipelineItems
    .filter(i => i.workspaceId === state.activeWorkspaceId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const activeItemId = String(active.id);
    const overId = String(over.id);

    if (activeItemId === overId) return;

    const draggedItem = items.find((item) => item.id === activeItemId);
    if (!draggedItem) return;

    const isOverColumn = stages.some((stage) => stage.id === overId);
    let targetStage: PipelineStage;
    let targetIndex: number;

    if (isOverColumn) {
      targetStage = overId as PipelineStage;
      targetIndex = items.filter(
        (item) =>
          item.stage === targetStage &&
          item.id !== activeItemId,
      ).length;
    } else {
      const overItem = items.find((item) => item.id === overId);
      if (!overItem) return;

      targetStage = overItem.stage;
      const targetItems = items
        .filter(
          (item) =>
            item.stage === targetStage &&
            item.id !== activeItemId,
        )
        .sort((a, b) => a.order - b.order);
      targetIndex = targetItems.findIndex((item) => item.id === overId);
      if (targetIndex < 0) targetIndex = targetItems.length;
    }

    const nextItems = movePipelineItem(
      items,
      activeItemId,
      targetStage,
      targetIndex,
    );

    if (nextItems === items) return;

    const changedItems = nextItems.filter((nextItem) => {
      const previous = items.find((item) => item.id === nextItem.id);
      return Boolean(
        previous &&
        (previous.stage !== nextItem.stage ||
          previous.order !== nextItem.order),
      );
    });

    if (changedItems.length === 0) return;

    dispatch({
      type: 'BATCH_UPDATE_PIPELINE_ITEMS',
      payload: changedItems,
    });

    const stageLabel =
      stages.find((stage) => stage.id === targetStage)?.label ||
      targetStage;
    toast.success(
      draggedItem.stage === targetStage
        ? 'Card reordered'
        : `Moved to ${stageLabel}`,
      { duration: 1500 },
    );
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  // Seamless pipeline -> composer flow
  const handleCreatePost = (item: ContentItem) => {
    const platformsParam = item.platforms.join(',');
    const dateParam = item.targetDate ? item.targetDate.split('T')[0] : '';
    const titleParam = encodeURIComponent(item.title);
    
    navigate(`/create?fromPipeline=${item.id}&title=${titleParam}&platforms=${platformsParam}${dateParam ? `&date=${dateParam}` : ''}`);
  };

  const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const stage = (formData.get('stage') as PipelineStage) || 'ideas';
    const rawFormat = String(formData.get('format') || 'short');
    const validFormats: ContentFormat[] = [
      'short',
      'long',
      'image',
      'carousel',
      'text',
    ];
    const format: ContentFormat = validFormats.includes(
      rawFormat as ContentFormat,
    )
      ? rawFormat as ContentFormat
      : 'short';
    const targetDate = formData.get('targetDate') as string;
    const owner = (formData.get('owner') as string) || 'Creator';
    const platformsRaw = formData.get('platforms') as string;
    const notes = formData.get('notes') as string;
    
    const platforms = platformsRaw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter((value): value is Platform =>
        ALL_PLATFORMS.includes(value as Platform),
      );
    
    if (editingItem) {
      dispatch({ 
        type: 'UPDATE_PIPELINE_ITEM', 
        payload: { 
          ...editingItem, 
          title, 
          stage, 
          format, 
          targetDate: targetDate ? new Date(targetDate).toISOString() : undefined, 
          owner, 
          platforms: platforms.length > 0 ? platforms : ['instagram'], 
          notes 
        } 
      });
      toast.success('Item updated');
    } else {
      const columnItems = items.filter(i => i.stage === stage);
      dispatch({ 
        type: 'ADD_PIPELINE_ITEM', 
        payload: {
          id: uuidv4(),
          workspaceId: state.activeWorkspaceId,
          title,
          stage,
          platforms: platforms.length > 0 ? platforms : ['instagram'],
          format,
          owner,
          targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
          tags: [],
          notes,
          order: columnItems.length
        } 
      });
      toast.success('Item created');
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (itemToDelete: ContentItem) => {
    dispatch({ type: 'DELETE_PIPELINE_ITEM', payload: itemToDelete.id });
    setIsModalOpen(false);
    toast((t) => (
      <div className="flex items-center space-x-2 text-[12px]">
        <span>Deleted "{itemToDelete.title.slice(0, 20)}..."</span>
        <button
          onClick={() => {
            dispatch({ type: 'ADD_PIPELINE_ITEM', payload: itemToDelete });
            toast.dismiss(t.id);
            toast.success('Restored item');
          }}
          className="font-bold text-brand-600 hover:underline"
        >
          Undo
        </button>
      </div>
    ), { duration: 5000 });
  };

  const openNewItemModalForStage = (stageId: PipelineStage) => {
    setEditingItem({
      id: '',
      workspaceId: state.activeWorkspaceId,
      title: '',
      stage: stageId,
      platforms: ['instagram'],
      format: 'short',
      owner: 'Creator',
      tags: [],
      notes: '',
      order: items.filter((item) => item.stage === stageId).length,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 h-full flex flex-col bg-white overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-[22px] font-semibold text-zinc-900 tracking-tight">Content Pipeline</h1>
          <p className="text-[12px] text-zinc-500 mt-0.5">
            Track ideation, production stages, and convert concepts straight into scheduled posts
          </p>
        </div>

        <button 
          onClick={() => { 
            setEditingItem(null); 
            setIsModalOpen(true); 
          }}
          className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-semibold hover:bg-brand-700 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Idea
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 scrollbar-hide">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-3.5 h-full min-w-max items-start">
            {stages.map(stage => {
              const columnItems = items.filter(item => item.stage === stage.id);
              return (
                <DroppableColumn 
                  key={stage.id} 
                  id={stage.id} 
                  label={stage.label} 
                  count={columnItems.length}
                  onAdd={() => openNewItemModalForStage(stage.id)}
                >
                  <SortableContext 
                    items={columnItems.map(i => i.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {columnItems.map(item => (
                      <SortableCard 
                        key={item.id} 
                        item={item} 
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        onCreatePost={handleCreatePost}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeItem ? (
              <SortableCard 
                item={activeItem} 
                onCreatePost={handleCreatePost} 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Edit / Create Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-[#EBEBE9] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EBEBE9] flex justify-between items-center bg-[#FAFAF9] shrink-0">
              <h3 className="text-[15px] font-semibold text-zinc-900 leading-tight">
                {editingItem?.id ? 'Edit Content Item' : 'New Content Item'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 hover:bg-zinc-200/60 rounded-md text-zinc-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveItem} className="flex flex-col overflow-hidden min-h-0">
              <div className="p-5 space-y-3.5 overflow-y-auto">
                <div>
                  <label className="block text-[12px] font-medium text-zinc-700 mb-1">Title</label>
                  <input 
                    name="title" 
                    defaultValue={editingItem?.title || ''} 
                    required
                    placeholder="e.g. 5 Productivity Hacks for Creators"
                    className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px]" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-700 mb-1">Stage</label>
                    <select 
                      name="stage" 
                      defaultValue={editingItem?.stage || 'ideas'} 
                      className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px] bg-white"
                    >
                      {stages.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-700 mb-1">Format</label>
                    <select 
                      name="format" 
                      defaultValue={editingItem?.format || 'short'} 
                      className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px] bg-white"
                    >
                      <option value="short">Short Video</option>
                      <option value="long">Long Video</option>
                      <option value="image">Image</option>
                      <option value="carousel">Carousel</option>
                      <option value="text">Text / Thread</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-700 mb-1">Target Date</label>
                    <input 
                      type="date"
                      name="targetDate"
                      defaultValue={editingItem?.targetDate ? editingItem.targetDate.split('T')[0] : ''}
                      className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-700 mb-1">Owner</label>
                    <input 
                      name="owner"
                      defaultValue={editingItem?.owner || 'Creator'}
                      className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px]" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[12px] font-medium text-zinc-700 mb-1">Target Platforms (comma separated)</label>
                  <input 
                    name="platforms"
                    defaultValue={editingItem?.platforms?.join(', ') || 'instagram, tiktok'}
                    className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px]" 
                    placeholder="e.g. instagram, tiktok, youtube"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-zinc-700 mb-1">Notes & Research Links</label>
                  <textarea 
                    name="notes"
                    defaultValue={editingItem?.notes || ''}
                    rows={3}
                    placeholder="Key talking points, audio tracks, hook drafts, etc."
                    className="w-full px-3 py-2 border border-[#DCDCD8] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 text-[13px] resize-none" 
                  />
                </div>
              </div>

              <div className="p-4 bg-[#FAFAF9] border-t border-[#EBEBE9] flex justify-between items-center shrink-0">
                {editingItem?.id ? (
                  <button 
                    type="button" 
                    onClick={() => handleDeleteItem(editingItem)}
                    className="px-3 py-1.5 text-[12px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : <div />}
                
                <div className="flex items-center space-x-2">
                  {editingItem?.id && (
                    <button 
                      type="button" 
                      onClick={() => handleCreatePost(editingItem)}
                      className="px-3 py-1.5 text-[12px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors flex items-center space-x-1"
                    >
                      <span>Send to Composer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-3.5 py-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 text-[12px] font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 shadow-2xs transition-colors"
                  >
                    Save
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
