import { useState } from 'react';
import { Lightbulb, Search, Heart, Sparkles, Shield } from 'lucide-react';
import { CapabilityType, CAPABILITY_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CapabilitySelectorProps {
  mode: 'single' | 'dual' | 'multi';
  selected: CapabilityType | CapabilityType[] | null;
  onSelect: (value: CapabilityType | CapabilityType[]) => void;
  prompt?: string;
  className?: string;
  minSelections?: number;
  exclude?: CapabilityType[];
}

const CAPABILITY_ICONS: Record<CapabilityType, React.ReactNode> = {
  imagination: <Lightbulb className="w-5 h-5" />,
  curiosity: <Search className="w-5 h-5" />,
  caring: <Heart className="w-5 h-5" />,
  creativity: <Sparkles className="w-5 h-5" />,
  courage: <Shield className="w-5 h-5" />,
};

const CAPABILITIES: CapabilityType[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

export function CapabilitySelector({
  mode,
  selected,
  onSelect,
  prompt,
  className,
  minSelections,
  exclude = [],
}: CapabilitySelectorProps) {
  // Track selection order for dual mode (oldest first)
  const [selectionOrder, setSelectionOrder] = useState<CapabilityType[]>([]);

  const defaultPrompt = mode === 'single'
    ? 'Which capability felt most present?'
    : mode === 'dual'
    ? 'Which two capabilities felt strongest?'
    : `Which capabilities would you bring? Pick at least ${minSelections ?? 2}.`;

  const isSelected = (cap: CapabilityType): boolean => {
    if (!selected) return false;
    if (Array.isArray(selected)) return selected.includes(cap);
    return selected === cap;
  };

  const handleClick = (cap: CapabilityType) => {
    if (mode === 'single') {
      onSelect(isSelected(cap) ? (null as unknown as CapabilityType) : cap);
    } else if (mode === 'multi') {
      const currentSelected = Array.isArray(selected) ? selected : selected ? [selected] : [];
      const isCurrentlySelected = currentSelected.includes(cap);
      if (isCurrentlySelected) {
        onSelect(currentSelected.filter(c => c !== cap));
      } else {
        onSelect([...currentSelected, cap]);
      }
    } else {
      // dual mode
      const currentSelected = Array.isArray(selected) ? selected : selected ? [selected] : [];
      const isCurrentlySelected = currentSelected.includes(cap);

      if (isCurrentlySelected) {
        // deselect
        const next = currentSelected.filter(c => c !== cap);
        setSelectionOrder(prev => prev.filter(c => c !== cap));
        onSelect(next);
      } else {
        let next: CapabilityType[];
        let nextOrder: CapabilityType[];
        if (currentSelected.length < 2) {
          next = [...currentSelected, cap];
          nextOrder = [...selectionOrder, cap];
        } else {
          // drop oldest selection
          const oldest = selectionOrder[0];
          next = [...currentSelected.filter(c => c !== oldest), cap];
          nextOrder = [...selectionOrder.slice(1), cap];
        }
        setSelectionOrder(nextOrder);
        onSelect(next);
      }
    }
  };

  return (
    <div className={cn('rounded-lg border border-gray-200 border-t-4 border-t-purple-500 bg-white p-4 shadow-sm', className)}>
      <p className="mb-3 text-sm font-medium text-gray-700">
        {prompt ?? defaultPrompt}
      </p>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
        {CAPABILITIES.filter(cap => !exclude.includes(cap)).map(cap => {
          const selected_ = isSelected(cap);
          return (
            <button
              key={cap}
              type="button"
              onClick={() => handleClick(cap)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs font-medium transition-all duration-150',
                selected_
                  ? 'scale-105 border-purple-600 bg-purple-600 text-white shadow-md'
                  : 'border-gray-300 bg-white text-gray-500 hover:border-purple-400 hover:text-purple-600',
              )}
            >
              {CAPABILITY_ICONS[cap]}
              <span>{CAPABILITY_LABELS[cap]}</span>
            </button>
          );
        })}
      </div>
      {mode === 'multi' && (
        <p className="mt-2 text-xs text-gray-500">
          {Array.isArray(selected) && selected.length > 0
            ? `${selected.length} selected${selected.length < (minSelections ?? 2) ? ` — pick at least ${minSelections ?? 2}` : ''}`
            : `Pick at least ${minSelections ?? 2}`}
        </p>
      )}
    </div>
  );
}

export default CapabilitySelector;
