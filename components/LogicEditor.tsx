import React, { useState } from 'react';
import { ConditionalRules, AirtableField, LogicCondition, LogicOperator } from '../types';

interface LogicEditorProps {
  availableFields: AirtableField[];
  currentRules: ConditionalRules | null;
  onChange: (rules: ConditionalRules | null) => void;
}

export const LogicEditor: React.FC<LogicEditorProps> = ({ availableFields, currentRules, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddCondition = () => {
    const newCondition: LogicCondition = {
      id: crypto.randomUUID(),
      fieldId: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
    };
    
    const newRules: ConditionalRules = currentRules || { logic: 'AND', conditions: [] };
    
    onChange({
      ...newRules,
      conditions: [...newRules.conditions, newCondition],
    });
  };

  const handleRemoveCondition = (id: string) => {
    if (!currentRules) return;
    const newConditions = currentRules.conditions.filter((c) => c.id !== id);
    if (newConditions.length === 0) {
      onChange(null);
    } else {
      onChange({ ...currentRules, conditions: newConditions });
    }
  };

  const updateCondition = (id: string, updates: Partial<LogicCondition>) => {
    if (!currentRules) return;
    onChange({
      ...currentRules,
      conditions: currentRules.conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-blue-600 hover:underline mt-2 flex items-center"
      >
        + Add Logic
        {currentRules && currentRules.conditions.length > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">
            {currentRules.conditions.length} Active
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider">Display If...</span>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {(!currentRules || currentRules.conditions.length === 0) ? (
         <div className="text-gray-500 italic text-xs mb-2">No conditions set.</div>
      ) : (
        <div className="space-y-2 mb-3">
           {currentRules.conditions.length > 1 && (
             <div className="flex items-center space-x-2 mb-2">
               <span className="text-xs text-gray-500">Match</span>
               <select
                 className="text-xs border-gray-300 rounded bg-white"
                 value={currentRules.logic}
                 onChange={(e) => onChange({ ...currentRules, logic: e.target.value as 'AND' | 'OR' })}
               >
                 <option value="AND">ALL (AND)</option>
                 <option value="OR">ANY (OR)</option>
               </select>
               <span className="text-xs text-gray-500">conditions</span>
             </div>
           )}

           {currentRules.conditions.map((cond) => {
             const field = availableFields.find(f => f.id === cond.fieldId);
             
             return (
               <div key={cond.id} className="flex flex-wrap items-center gap-2 p-2 bg-white border rounded shadow-sm">
                  <select
                    className="flex-1 min-w-[120px] text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={cond.fieldId}
                    onChange={(e) => updateCondition(cond.id, { fieldId: e.target.value })}
                  >
                    {availableFields.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  
                  <select
                    className="w-24 text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={cond.operator}
                    onChange={(e) => updateCondition(cond.id, { operator: e.target.value as LogicOperator })}
                  >
                    <option value="equals">is</option>
                    <option value="notEquals">is not</option>
                    <option value="contains">contains</option>
                  </select>

                  {/* Render input based on field type if possible, simplified here to text/select */}
                   {field?.type === 'singleSelect' && field.options ? (
                      <select 
                        className="flex-1 min-w-[100px] text-xs border-gray-300 rounded bg-white"
                        value={cond.value as string}
                        onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                      >
                         <option value="">Select...</option>
                         {field.options.choices.map(opt => (
                           <option key={opt.id} value={opt.name}>{opt.name}</option>
                         ))}
                      </select>
                   ) : (
                     <input
                       type="text"
                       className="flex-1 min-w-[100px] text-xs border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 px-2 py-1 bg-white"
                       placeholder="Value"
                       value={cond.value as string}
                       onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
                     />
                   )}

                  <button 
                    onClick={() => handleRemoveCondition(cond.id)}
                    className="text-red-400 hover:text-red-600"
                    title="Remove condition"
                  >
                    ✕
                  </button>
               </div>
             );
           })}
        </div>
      )}

      <button
        onClick={handleAddCondition}
        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition-colors w-full border border-gray-300 border-dashed"
      >
        + Add Condition
      </button>
    </div>
  );
};