import React from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Plus, X } from 'lucide-react';

export interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GlossaryEditorProps {
  glossary: GlossaryTerm[];
  onChange: (glossary: GlossaryTerm[]) => void;
}

export const GlossaryEditor = React.memo(({ glossary, onChange }: GlossaryEditorProps) => {
  const addTerm = () => {
    onChange([...glossary, { term: '', definition: '' }]);
  };

  const removeTerm = (index: number) => {
    const newGlossary = glossary.filter((_, i) => i !== index);
    onChange(newGlossary);
  };

  const updateTerm = (index: number, field: keyof GlossaryTerm, value: string) => {
    const newGlossary = glossary.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange(newGlossary);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Glossary Terms</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTerm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Term
        </Button>
      </div>
      
      {glossary.length === 0 ? (
        <p className="text-sm text-muted-foreground">No glossary terms. Click "Add Term" to get started.</p>
      ) : (
        <div className="space-y-3">
          {glossary.map((item, index) => (
            <div key={index} className="flex gap-2 p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Term (e.g., Flow)"
                  value={item.term}
                  onChange={(e) => updateTerm(index, 'term', e.target.value)}
                />
                <Textarea
                  placeholder="Definition (supports markdown)"
                  value={item.definition}
                  onChange={(e) => updateTerm(index, 'definition', e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTerm(index)}
                className="text-destructive hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});