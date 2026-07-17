export type Role = 'secretary' | 'physio_andre' | 'physio_beatriz' | 'patient' | 'admin' | 'public_site';

export interface UserProfile {
  id: string;
  name: string;
  role: 'secretary' | 'physio' | 'patient' | 'admin';
  email: string;
  avatarUrl?: string;
  specialty?: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  covenant: string; // 'Particular' or name of insurance: 'Unimed', 'Amil', 'Bradesco', etc.
  birthDate: string;
  active: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  physioId: 'andre' | 'beatriz';
  physioName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'completed';
  covenant: string; // covenant used for this appt
  cost: number;
  googleSynced: boolean;
  notes?: string;
}

export interface ClinicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD HH:MM
  physioId: 'andre' | 'beatriz';
  physioName: string;
  subjective: string; // S: Queixas do paciente, dor, histórico recente
  objective: string;  // O: Testes físicos, amplitude de movimento, palpação
  assessment: string; // A: Evolução clínica, resposta ao tratamento
  plan: string;       // P: Exercícios realizados, conduta para as próximas sessões
  signature: string;
}

export interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  category: string; // 'Consulta', 'Mensalidade', 'Aluguel', 'Salários', 'Materiais', etc.
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  covenant?: string; // If related to insurance
  appointmentId?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string; // 'Secretária', 'Dr. André', 'Dra. Beatriz', 'Administrador'
  content: string;
  timestamp: string; // HH:MM
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'urgent' | 'info' | 'success';
  timestamp: string; // HH:MM
  read: boolean;
}

export interface WhatsAppLog {
  id: string;
  recipientName: string;
  phone: string;
  message: string;
  timestamp: string; // YYYY-MM-DD HH:MM
  status: 'sent' | 'pending';
  type: 'reminder' | 'confirmation' | 'alert';
}
