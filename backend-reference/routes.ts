import express from 'express';
import type { Request, Response } from 'express';
import { FormModel, FormResponseModel } from './models';
import { getAirtableBases, getAirtableSchema, createAirtableRecord } from './airtableService';

export const formRouter = express.Router();

formRouter.get('/airtable/bases', async (req: Request, res: Response) => {
  try {
    const bases = await getAirtableBases();
    res.json(bases);
  } catch (error: any) {
    console.error('Airtable Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch bases' });
  }
});

formRouter.get('/airtable/bases/:baseId/tables', async (req: Request, res: Response) => {
  try {
    const tables = await getAirtableSchema(req.params.baseId);
    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

formRouter.get('/', async (req: Request, res: Response) => {
  try {
    const forms = await FormModel.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

formRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const form = await FormModel.findOne({ id: req.params.id });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

formRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newForm = new FormModel(req.body);
    await newForm.save();
    res.status(201).json(newForm);
  } catch (error) {
    res.status(400).json({ error: 'Failed to save form' });
  }
});

formRouter.post('/:formId/responses', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;
    
    const form = await FormModel.findOne({ id: formId });
    if (!form) return res.status(404).json({ error: 'Form not found' });

    let airtableRecordId = 'sync_failed';
    try {
        if (form.baseId && form.tableId) {
            const atResponse = await createAirtableRecord(form.baseId, form.tableId, answers);
            airtableRecordId = atResponse.id;
        }
    } catch (atError) {
        console.error('Airtable Sync Failed:', atError);
    }

    const response = new FormResponseModel({
      formId: form._id,
      airtableRecordId,
      answers,
      syncedAt: new Date()
    });
    
    await response.save();
    res.status(201).json(response);

  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

formRouter.get('/:formId/responses', async (req: Request, res: Response) => {
    const form = await FormModel.findOne({ id: req.params.formId });
    if(!form) return res.status(404).json({error: "Form not found"});

    const responses = await FormResponseModel.find({ formId: form._id }).sort({ syncedAt: -1 });
    res.json(responses);
});