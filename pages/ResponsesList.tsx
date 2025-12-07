import React, { useEffect, useState } from 'react';
import { getResponses } from '../services/storage';
import { FormResponse, FormDefinition } from '../types';

interface ResponsesListProps {
  form: FormDefinition;
  onBack: () => void;
}

export const ResponsesList: React.FC<ResponsesListProps> = ({ form, onBack }) => {
  const [responses, setResponses] = useState<FormResponse[]>([]);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const data = await getResponses(form.id);
        setResponses(data);
      } catch (err) {
        console.error("Failed to load responses", err);
      }
    };
    loadResponses();
  }, [form.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
           <button onClick={onBack} className="text-gray-500 hover:text-gray-900 font-medium">← Back</button>
           <h2 className="text-2xl font-bold text-gray-800">Responses: {form.title}</h2>
        </div>
        <div className="text-sm text-gray-500">
           Total: <span className="font-bold text-gray-900">{responses.length}</span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {responses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No responses yet. Share the form to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Airtable Status</th>
                  {form.fields.slice(0, 3).map(f => (
                    <th key={f.airtableFieldId} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider truncate max-w-[150px]">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map((resp) => (
                  <tr key={resp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(resp.syncedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Synced ({resp.airtableRecordId})
                      </span>
                    </td>
                    {form.fields.slice(0, 3).map(f => {
                      const val = resp.answers[f.airtableFieldId];
                      return (
                        <td key={f.airtableFieldId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate">
                          {Array.isArray(val) ? val.join(', ') : String(val || '-')}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};