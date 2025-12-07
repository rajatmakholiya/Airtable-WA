import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  airtableId: String,
  name: String,
  email: String,
  accessToken: String,
  refreshToken: String,
  tokenExpiresAt: Date
});

const FormSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  baseId: String,
  tableId: String,
  fields: [{
    airtableFieldId: String,
    label: String,
    required: Boolean,
    rules: {
      logic: { type: String, enum: ['AND', 'OR'] },
      conditions: [{
        fieldId: String,
        operator: String,
        value: mongoose.Schema.Types.Mixed
      }]
    }
  }],
  createdAt: { type: Date, default: Date.now }
});

const FormResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  airtableRecordId: { type: String, index: true },
  answers: mongoose.Schema.Types.Mixed, // Storing Raw JSON
  deletedInAirtable: { type: Boolean, default: false },
  syncedAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model('User', UserSchema);
export const FormModel = mongoose.model('Form', FormSchema);
export const FormResponseModel = mongoose.model('FormResponse', FormResponseSchema);
