import type { Request, Response } from 'express';
import { FormResponseModel } from './models';

export const webhookHandler = async (req: Request, res: Response) => {
  const { payloads, cursor } = req.body;
  
  if (!payloads || payloads.length === 0) {
    return res.status(200).send('Ping');
  }

  try {
    for (const payload of payloads) {
      if (payload.changedTablesById) {
        for (const tableId in payload.changedTablesById) {
          const changes = payload.changedTablesById[tableId];

          if (changes.changedRecordsById) {
            for (const recordId in changes.changedRecordsById) {
              await FormResponseModel.findOneAndUpdate(
                { airtableRecordId: recordId },
                { $set: { lastSyncedAt: new Date() } }
              );
            }
          }

          if (changes.destroyedRecordIds) {
            for (const recordId of changes.destroyedRecordIds) {
              await FormResponseModel.findOneAndUpdate(
                { airtableRecordId: recordId },
                { deletedInAirtable: true }
              );
            }
          }
        }
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
};