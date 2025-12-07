import React, { useState, useEffect } from 'react';
import { getBases, getTableFields, saveForm } from '../services/storage';
import { AirtableBase, AirtableTable, AirtableField, FormFieldConfig, FormDefinition } from '../types';
import { LogicEditor } from '../components/LogicEditor';

interface FormBuilderProps {
  onCancel: () => void;
  onSave: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ onCancel, onSave }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bases, setBases] = useState<AirtableBase[]>([]);
  
  const [selectedBaseId, setSelectedBaseId] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [tableFields, setTableFields] = useState<AirtableField[]>([]);
  
  const [formTitle, setFormTitle] = useState('New Form');
  const [selectedFields, setSelectedFields] = useState<FormFieldConfig[]>([]);

  useEffect(() => {
    getBases().then(setBases);
  }, []);

  useEffect(() => {
    if (selectedBaseId && selectedTableId) {
      getTableFields(selectedBaseId, selectedTableId).then(setTableFields);
    }
  }, [selectedBaseId, selectedTableId]);

  const handleAddField = (field: AirtableField) => {
    if (selectedFields.find(f => f.airtableFieldId === field.id)) return;
    
    setSelectedFields([
      ...selectedFields,
      {
        airtableFieldId: field.id,
        label: field.name,
        required: false,
        rules: null
      }
    ]);
  };

  const removeField = (index: number) => {
    const next = [...selectedFields];
    next.splice(index, 1);
    setSelectedFields(next);
  };

  const updateFieldConfig = (index: number, updates: Partial<FormFieldConfig>) => {
    const next = [...selectedFields];
    next[index] = { ...next[index], ...updates };
    setSelectedFields(next);
  };

  const handlePublish = () => {
    if (!formTitle || selectedFields.length === 0) return;
    
    const newForm: FormDefinition = {
      id: `form_${Date.now()}`,
      title: formTitle,
      baseId: selectedBaseId,
      tableId: selectedTableId,
      fields: selectedFields,
      createdAt: new Date().toISOString()
    };
    
    saveForm(newForm);
    onSave();
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-2xl font-bold text-gray-800">Select Source</h2>
      <div className="grid gap-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Airtable Base</label>
          <select 
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
            value={selectedBaseId}
            onChange={e => setSelectedBaseId(e.target.value)}
          >
            <option value="">Select a Base...</option>
            {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {selectedBaseId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
            <select 
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
              value={selectedTableId}
              onChange={e => setSelectedTableId(e.target.value)}
            >
              <option value="">Select a Table...</option>
              {bases.find(b => b.id === selectedBaseId)?.tables.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
        
        <div className="pt-4 flex justify-end">
           <button 
             disabled={!selectedTableId}
             onClick={() => setStep(2)}
             className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
           >
             Next: Select Fields
           </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex gap-8 h-[calc(100vh-200px)]">
      <div className="w-1/3 border-r pr-6 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Available Fields</h3>
        <div className="space-y-2">
          {tableFields.map(field => {
             const isSelected = selectedFields.some(f => f.airtableFieldId === field.id);
             return (
               <button
                 key={field.id}
                 onClick={() => handleAddField(field)}
                 disabled={isSelected}
                 className={`w-full text-left p-3 rounded-lg border transition-all ${
                   isSelected 
                     ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                     : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'
                 }`}
               >
                 <div className="font-medium">{field.name}</div>
                 <div className="text-xs text-gray-500 mt-0.5 capitalize">{field.type.replace(/([A-Z])/g, ' $1').trim()}</div>
               </button>
             );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pl-2">
         <div className="mb-6">
           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Form Title</label>
           <input 
             type="text" 
             value={formTitle}
             onChange={e => setFormTitle(e.target.value)}
             className="text-3xl font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none w-full bg-transparent placeholder-gray-300"
             placeholder="Untitled Form"
           />
         </div>

         {selectedFields.length === 0 ? (
           <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
             Select fields from the left to add them to your form.
           </div>
         ) : (
           <div className="space-y-6">
             {selectedFields.map((fieldConfig, idx) => {
               const originalField = tableFields.find(f => f.id === fieldConfig.airtableFieldId)!;
               const previousFields = selectedFields
                  .slice(0, idx)
                  .map(sf => tableFields.find(tf => tf.id === sf.airtableFieldId)!)
                  .filter(Boolean);

               return (
                 <div key={fieldConfig.airtableFieldId} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm group hover:border-blue-300 transition-colors relative">
                    <button 
                       onClick={() => removeField(idx)}
                       className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>

                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Label</label>
                      <input 
                        type="text" 
                        value={fieldConfig.label}
                        onChange={(e) => updateFieldConfig(idx, { label: e.target.value })}
                        className="font-medium text-gray-800 w-full border-b border-gray-200 focus:border-blue-500 focus:outline-none pb-1 bg-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={fieldConfig.required}
                          onChange={(e) => updateFieldConfig(idx, { required: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" 
                        />
                        <span className="text-sm text-gray-600">Required</span>
                      </label>
                      
                      <div className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500 capitalize">
                        {originalField.type.replace(/([A-Z])/g, ' $1')}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                       {idx > 0 ? (
                         <LogicEditor 
                           availableFields={previousFields}
                           currentRules={fieldConfig.rules}
                           onChange={(rules) => updateFieldConfig(idx, { rules })}
                         />
                       ) : (
                         <span className="text-xs text-gray-400">Conditional logic cannot be applied to the first question.</span>
                       )}
                    </div>
                 </div>
               );
             })}
           </div>
         )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center z-20">
         <div className="max-w-5xl mx-auto w-full flex justify-between">
            <button onClick={() => setStep(1)} className="text-gray-600 font-medium hover:text-gray-900">Back</button>
            <div className="space-x-4">
              <button onClick={onCancel} className="text-gray-600 font-medium hover:text-gray-900">Cancel</button>
              <button 
                onClick={handlePublish}
                disabled={selectedFields.length === 0}
                className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-md hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Publish Form
              </button>
            </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
    </div>
  );
};