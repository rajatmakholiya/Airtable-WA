import React, { useState, useEffect } from 'react';
import { getForms } from '../services/storage';
import { FormDefinition } from '../types';

interface DashboardProps {
  onCreateClick: () => void;
  onViewForm: (id: string) => void;
  onViewResponses: (form: FormDefinition) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onCreateClick, onViewForm, onViewResponses }) => {
  const [forms, setForms] = useState<FormDefinition[]>([]);

  useEffect(() => {
    const loadForms = async () => {
      try {
        const data = await getForms();
        setForms(data);
      } catch (err) {
        console.error("Failed to load forms", err);
      }
    };
    loadForms();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Forms</h1>
          <p className="text-gray-500 mt-1">Manage integration and view responses</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm transition-all flex items-center"
        >
          <span className="text-xl mr-2 pb-1 leading-none">+</span> Create Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">📝</div>
          <h3 className="text-lg font-medium text-gray-900">No forms created yet</h3>
          <p className="text-gray-500 mt-1 mb-6 max-w-sm mx-auto">Connect your Airtable base and start collecting data with conditional logic.</p>
          <button 
            onClick={onCreateClick}
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first form
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <div key={form.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
               <div className="flex-grow">
                 <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{form.title}</h3>
                 <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                   <span className="bg-gray-100 px-2 py-0.5 rounded">Base: {form.baseId.substring(0,8)}...</span>
                   <span>•</span>
                   <span>{form.fields.length} Fields</span>
                 </div>
               </div>
               
               <div className="border-t pt-4 flex items-center justify-between mt-4">
                  <button 
                    onClick={() => onViewResponses(form)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    View Responses
                  </button>
                  <button 
                    onClick={() => onViewForm(form.id)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Open Form →
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};