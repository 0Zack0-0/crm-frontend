export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  lastContact: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  budget: number;
  spent: number;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  description: string;
}

export interface LedgerEntry {
  id: string;
  projectId: string;
  date: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
}
