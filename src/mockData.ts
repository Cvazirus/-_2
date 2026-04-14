import { Part, Operation, Journal } from './types';

export const mockJournals: Journal[] = [
  { id: 'j1', name: 'Учёт деталей', type: 'parts', color: '#007AFF' },
  { id: 'j2', name: 'Журнал списаний', type: 'operations', color: '#FF9500' },
];

export const mockParts: Part[] = [
  {
    id: '1',
    journalId: 'j1',
    code: '4516.12.05.112',
    name: 'Балка',
    pricePerUnit: 51,
    currentQuantity: 256,
    operationNumbers: ['005', '015'],
    lastUpdate: '2026-02-24T13:07:00Z',
    history: [
      { id: 'h1', date: '2026-04-02T22:31:00Z', type: 'return', quantity: -3 },
      { id: 'h2', date: '2026-04-02T22:31:00Z', type: 'return', quantity: -4 },
      { id: 'h3', date: '2026-04-02T17:26:00Z', type: 'arrival', quantity: 4 },
      { id: 'h4', date: '2026-04-02T17:24:00Z', type: 'arrival', quantity: 3 },
    ]
  },
  {
    id: '2',
    journalId: 'j1',
    code: '4516.12.05.141',
    name: 'Балка',
    pricePerUnit: 87,
    currentQuantity: 146,
    operationNumbers: ['005', '015'],
    lastUpdate: '2026-02-24T13:07:00Z',
    history: []
  },
];

export const mockOperations: Operation[] = [
  {
    id: 'op1',
    journalId: 'j2',
    operationCode: '0409-0006',
    type: 'arrival',
    date: '2026-04-09T14:02:00Z',
    partId: '12',
    partCode: '4447.26.04.062',
    partName: 'Окантовка',
    operationNumbers: ['005', '015'],
    quantity: 8,
    pricePerUnit: 38,
    sum: 304,
    wasQuantity: 0,
    becameQuantity: 8
  },
];
