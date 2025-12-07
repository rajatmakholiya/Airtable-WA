// --- Airtable & Form Types ---

export type AirtableFieldType = 'singleLineText' | 'multilineText' | 'singleSelect' | 'multipleSelects' | 'multipleAttachments';

export interface AirtableSelectOption {
  id: string;
  name: string;
  color?: string;
}

export interface AirtableField {
  id: string;
  name: string;
  type: AirtableFieldType;
  options?: {
    choices: AirtableSelectOption[];
  };
}

export interface AirtableTable {
  id: string;
  name: string;
  fields: AirtableField[];
}

export interface AirtableBase {
  id: string;
  name: string;
  tables: AirtableTable[];
}

// --- Logic Engine Types ---

export type LogicOperator = 'equals' | 'notEquals' | 'contains';
export type LogicGate = 'AND' | 'OR';

export interface LogicCondition {
  id: string;
  fieldId: string; // The ID of the field to check against
  operator: LogicOperator;
  value: string | string[]; // The value to compare
}

export interface ConditionalRules {
  logic: LogicGate;
  conditions: LogicCondition[];
}

// --- Form Definition ---

export interface FormFieldConfig {
  airtableFieldId: string;
  label: string; // Custom label override
  required: boolean;
  rules: ConditionalRules | null; // Visibility rules
}

export interface FormDefinition {
  id: string;
  title: string;
  baseId: string;
  tableId: string;
  fields: FormFieldConfig[];
  createdAt: string;
}

// --- Responses ---

export interface FormResponse {
  id: string;
  formId: string;
  answers: Record<string, any>; // Key is airtableFieldId
  airtableRecordId?: string; // Mocked for demo
  syncedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}
