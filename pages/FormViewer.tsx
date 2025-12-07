import React, { useState, useEffect } from 'react';
import { getFormById, saveResponse, getTableFields } from '../services/storage';
import { FormDefinition, AirtableField } from '../types';
import { shouldShowQuestion } from '../utils/logicEngine';

interface FormViewerProps {
  formId: string;
  onClose: () => void;
}

export const FormViewer: React.FC<FormViewerProps> = ({ formId, onClose }) => {
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [originalFields, setOriginalFields] = useState<AirtableField[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const f = await getFormById(formId);
        if (f) {
          setForm(f);
          const fields = await getTableFields(f.baseId, f.tableId);
          setOriginalFields(fields);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [formId]);

  const handleChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validate = () => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};
    let isValid = true;

    form.fields.forEach(fieldConfig => {
      const isVisible = shouldShowQuestion(fieldConfig.rules, answers);
      
      if (isVisible && fieldConfig.required) {
        const val = answers[fieldConfig.airtableFieldId];
        const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
        
        if (isEmpty) {
          newErrors[fieldConfig.airtableFieldId] = 'This field is required.';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const cleanAnswers = { ...answers };
      await saveResponse(formId, cleanAnswers);
      setSubmitted(true);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading form...</div>;
  if (!form) return <div className="p-8 text-center text-red-500">Form not found.</div>;

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received</h2>
        <p className="text-gray-600 mb-8">Thank you! Your response has been recorded.</p>
        <button 
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">← Back</button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
          <p className="opacity-90">Please fill out the information below.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {form.fields.map(fieldConfig => {
            const isVisible = shouldShowQuestion(fieldConfig.rules, answers);
            if (!isVisible) return null;

            const originalField = originalFields.find(f => f.id === fieldConfig.airtableFieldId);
            if (!originalField) return null;

            const hasError = !!errors[fieldConfig.airtableFieldId];

            return (
              <div key={fieldConfig.airtableFieldId} className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {(originalField.type === 'singleLineText' || originalField.type === 'multilineText') && (
                   originalField.type === 'multilineText' ? (
                     <textarea
                       className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                       rows={4}
                       value={answers[fieldConfig.airtableFieldId] || ''}
                       onChange={e => handleChange(fieldConfig.airtableFieldId, e.target.value)}
                     />
                   ) : (
                     <input
                       type="text"
                       className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
                       value={answers[fieldConfig.airtableFieldId] || ''}
                       onChange={e => handleChange(fieldConfig.airtableFieldId, e.target.value)}
                     />
                   )
                )}

                {(originalField.type === 'singleSelect' || originalField.type === 'multipleSelects') && originalField.options && (
                  <div className="space-y-2">
                    {originalField.type === 'singleSelect' ? (
                      <select
                        className={`w-full border rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                        value={answers[fieldConfig.airtableFieldId] || ''}
                        onChange={e => handleChange(fieldConfig.airtableFieldId, e.target.value)}
                      >
                         <option value="">Select an option...</option>
                         {originalField.options.choices.map(opt => (
                           <option key={opt.id} value={opt.name}>{opt.name}</option>
                         ))}
                      </select>
                    ) : (
                      <div className={`grid grid-cols-2 gap-2 border p-4 rounded-lg ${hasError ? 'border-red-500' : 'border-gray-300'}`}>
                        {originalField.options.choices.map(opt => {
                          const currentVal = (answers[fieldConfig.airtableFieldId] as string[]) || [];
                          const isChecked = currentVal.includes(opt.name);
                          return (
                            <label key={opt.id} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newVal = e.target.checked 
                                    ? [...currentVal, opt.name]
                                    : currentVal.filter(v => v !== opt.name);
                                  handleChange(fieldConfig.airtableFieldId, newVal);
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{opt.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {originalField.type === 'multipleAttachments' && (
                  <div className={`border rounded-lg p-4 transition-colors ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                    <input 
                      type="file" 
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={() => {
                        handleChange(fieldConfig.airtableFieldId, 'file_attached');
                      }}
                    />
                  </div>
                )}

                {hasError && <p className="text-red-500 text-xs mt-1">{errors[fieldConfig.airtableFieldId]}</p>}
              </div>
            );
          })}

          <div className="pt-6 border-t">
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
            >
              Submit Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};