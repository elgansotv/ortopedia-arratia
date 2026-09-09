export interface Appointment {
  id: string;
  name: string;
  phone: string;
  reason: string;
  date: string; // YYYY-MM-dd
  hour: string; // e.g. "10:30"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-dd
  hour: string;
  reason: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
}

