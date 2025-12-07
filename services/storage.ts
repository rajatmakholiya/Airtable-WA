import { FormDefinition, FormResponse, User, AirtableBase, AirtableField } from '../types';

const API_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000/api';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

export const login = (): User => {
  const user: User = {
    id: 'usr_real_123',
    name: 'Admin User',
    email: 'admin@airformsync.com',
    avatarUrl: 'https://ui-avatars.com/api/?name=Admin+User',
  };
  localStorage.setItem('airform_user', JSON.stringify(user));
  return user;
};

export const logout = () => {
  localStorage.removeItem('airform_user');
};

export const getUser = (): User | null => {
  const u = localStorage.getItem('airform_user');
  return u ? JSON.parse(u) : null;
};

export const getBases = async (): Promise<AirtableBase[]> => {
  return fetchJson<AirtableBase[]>('/forms/airtable/bases');
};

export const getTableFields = async (baseId: string, tableId: string): Promise<AirtableField[]> => {
  const tables = await fetchJson<any[]>(`/forms/airtable/bases/${baseId}/tables`);
  const table = tables.find((t: any) => t.id === tableId);
  return table ? table.fields : [];
};

export const saveForm = async (form: FormDefinition): Promise<void> => {
  await fetchJson('/forms', {
    method: 'POST',
    body: JSON.stringify(form),
  });
};

export const getForms = async (): Promise<FormDefinition[]> => {
  return fetchJson<FormDefinition[]>('/forms');
};

export const getFormById = async (id: string): Promise<FormDefinition | undefined> => {
  const forms = await getForms();
  return forms.find(f => f.id === id);
};

export const saveResponse = async (formId: string, answers: Record<string, any>): Promise<FormResponse> => {
  return fetchJson<FormResponse>(`/forms/${formId}/responses`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
};

export const getResponses = async (formId: string): Promise<FormResponse[]> => {
  return fetchJson<FormResponse[]>(`/forms/${formId}/responses`);
};