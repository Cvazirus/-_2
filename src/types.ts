export type OperationType = 'arrival' | 'write-off' | 'return';

export interface HistoryEntry {
  id: string;
  date: string;
  type: OperationType;
  quantity: number;
}

export interface Part {
  id: string;
  journalId: string;
  code: string;
  name: string;
  pricePerUnit: number;
  currentQuantity: number;
  operationNumbers: string[];
  notes?: string;
  history: HistoryEntry[];
  lastUpdate: string;
}

export interface Operation {
  id: string;
  journalId: string;
  operationCode: string;
  type: OperationType;
  date: string;
  partId: string;
  partCode: string;
  partName: string;
  operationNumbers: string[];
  quantity: number;
  pricePerUnit: number;
  sum: number;
  wasQuantity: number;
  becameQuantity: number;
}

export interface Journal {
  id: string;
  name: string;
  type: 'parts' | 'operations';
  color: string;
}
