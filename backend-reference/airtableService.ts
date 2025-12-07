import axios from 'axios';

const AIRTABLE_API_URL = 'https://api.airtable.com/v0';
const API_KEY = process.env.AIRTABLE_API_KEY; 

const airtable = axios.create({
  baseURL: AIRTABLE_API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

export const getAirtableBases = async () => {
  const response = await airtable.get('/meta/bases');
  return response.data.bases;
};

export const getAirtableSchema = async (baseId: string) => {
  const response = await airtable.get(`/meta/bases/${baseId}/tables`);
  return response.data.tables;
};

export const createAirtableRecord = async (baseId: string, tableId: string, fields: Record<string, any>) => {
  const response = await airtable.post(`/${baseId}/${tableId}`, {
    fields: fields
  });
  return response.data;
};