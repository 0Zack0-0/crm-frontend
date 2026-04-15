import { Client, Project, LedgerEntry } from './types';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Eleanor Vance',
    company: 'Hill House Architecture',
    email: 'eleanor@hillhouse.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    lastContact: '2026-03-15T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Theodora Crane',
    company: 'Crane Design Studio',
    email: 'theo@cranedesign.com',
    phone: '+1 (555) 987-6543',
    status: 'active',
    lastContact: '2026-04-01T14:30:00Z',
  },
  {
    id: 'c3',
    name: 'Luke Sanderson',
    company: 'Sanderson & Co',
    email: 'luke@sanderson.com',
    phone: '+1 (555) 456-7890',
    status: 'lead',
    lastContact: '2026-03-20T09:15:00Z',
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'The Blackwood Estate',
    clientId: 'c1',
    budget: 1250000,
    spent: 450000,
    status: 'in-progress',
    startDate: '2026-01-10',
    description: 'Restoration of a 19th-century manor with modern architectural elements.',
  },
  {
    id: 'p2',
    name: 'Glass Pavilion',
    clientId: 'c2',
    budget: 850000,
    spent: 120000,
    status: 'planning',
    startDate: '2026-05-01',
    description: 'Minimalist glass structure for a private art gallery.',
  },
  {
    id: 'p3',
    name: 'Urban Loft Conversion',
    clientId: 'c1',
    budget: 350000,
    spent: 345000,
    status: 'completed',
    startDate: '2025-08-15',
    endDate: '2026-02-28',
    description: 'Industrial loft conversion into a high-end residential space.',
  },
];

export const MOCK_LEDGER: LedgerEntry[] = [
  {
    id: 'l1',
    projectId: 'p1',
    date: '2026-03-10',
    description: 'Structural steel delivery',
    amount: 45000,
    type: 'expense',
    category: 'Materials',
  },
  {
    id: 'l2',
    projectId: 'p1',
    date: '2026-03-12',
    description: 'Architectural consulting fee',
    amount: 15000,
    type: 'expense',
    category: 'Consulting',
  },
  {
    id: 'l3',
    projectId: 'p1',
    date: '2026-03-25',
    description: 'Phase 2 milestone payment',
    amount: 200000,
    type: 'income',
    category: 'Milestone',
  },
];
