import { Patient, Appointment, ClinicalRecord, Transaction, ChatMessage, PushNotification, WhatsAppLog } from '../types';

// Seed data based on current date: 2026-07-13
const TODAY = '2026-07-13';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Lucas Lima',
    cpf: '123.456.789-00',
    phone: '(11) 98765-4321',
    email: 'lucas.lima@email.com',
    covenant: 'Unimed',
    birthDate: '1988-05-15',
    active: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'pat-2',
    name: 'Mariana Santos',
    cpf: '234.567.890-11',
    phone: '(11) 97654-3210',
    email: 'mariana.santos@email.com',
    covenant: 'Particular',
    birthDate: '1995-11-23',
    active: true,
    createdAt: '2026-02-14',
  },
  {
    id: 'pat-3',
    name: 'Rodrigo Souza',
    cpf: '345.678.901-22',
    phone: '(11) 96543-2109',
    email: 'rodrigo.souza@email.com',
    covenant: 'Amil',
    birthDate: '1975-08-04',
    active: true,
    createdAt: '2026-03-01',
  },
  {
    id: 'pat-4',
    name: 'Clara Oliveira',
    cpf: '456.789-012-33',
    phone: '(11) 95432-1098',
    email: 'clara.oliveira@email.com',
    covenant: 'Bradesco Saúde',
    birthDate: '2001-02-28',
    active: true,
    createdAt: '2026-05-20',
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    patientId: 'pat-1',
    patientName: 'Lucas Lima',
    physioId: 'andre',
    physioName: 'Dr. André Silva',
    date: TODAY,
    time: '09:00',
    status: 'completed',
    covenant: 'Unimed',
    cost: 150,
    googleSynced: true,
    notes: 'Sessão 5 do tratamento de hérnia de disco lombar.'
  },
  {
    id: 'app-2',
    patientId: 'pat-2',
    patientName: 'Mariana Santos',
    physioId: 'beatriz',
    physioName: 'Dra. Beatriz Costa',
    date: TODAY,
    time: '11:30',
    status: 'checked_in', // Arrived and checked in via QR Code
    covenant: 'Particular',
    cost: 200,
    googleSynced: true,
    notes: 'Pilates clínico para reabilitação postural.'
  },
  {
    id: 'app-3',
    patientId: 'pat-3',
    patientName: 'Rodrigo Souza',
    physioId: 'andre',
    physioName: 'Dr. André Silva',
    date: TODAY,
    time: '14:00',
    status: 'confirmed',
    covenant: 'Amil',
    cost: 150,
    googleSynced: true,
    notes: 'Recuperação pós-operatória de LCA joelho esquerdo.'
  },
  {
    id: 'app-4',
    patientId: 'pat-4',
    patientName: 'Clara Oliveira',
    physioId: 'beatriz',
    physioName: 'Dra. Beatriz Costa',
    date: TODAY,
    time: '16:00',
    status: 'pending',
    covenant: 'Bradesco Saúde',
    cost: 160,
    googleSynced: false,
    notes: 'Tratamento de tendinite patelar.'
  },
  {
    id: 'app-5',
    patientId: 'pat-1',
    patientName: 'Lucas Lima',
    physioId: 'andre',
    physioName: 'Dr. André Silva',
    date: '2026-07-15',
    time: '09:00',
    status: 'confirmed',
    covenant: 'Unimed',
    cost: 150,
    googleSynced: true,
    notes: 'Sessão 6 do tratamento de hérnia de disco lombar.'
  },
  {
    id: 'app-6',
    patientId: 'pat-3',
    patientName: 'Rodrigo Souza',
    physioId: 'andre',
    physioName: 'Dr. André Silva',
    date: '2026-07-16',
    time: '14:00',
    status: 'pending',
    covenant: 'Amil',
    cost: 150,
    googleSynced: false,
  }
];

export const INITIAL_CLINICAL_RECORDS: ClinicalRecord[] = [
  {
    id: 'rec-1',
    patientId: 'pat-1',
    patientName: 'Lucas Lima',
    date: '2026-07-06 09:00',
    physioId: 'andre',
    physioName: 'Dr. André Silva',
    subjective: 'Paciente relata dor lombar de intensidade 5/10, com leve irradiação para a coxa direita ao acordar. Refere melhora após exercícios prescritos para casa.',
    objective: 'Amplitude de movimento em flexão de tronco limitada a 60 graus por dor. Teste de Lasègue positivo a 45 graus na perna direita. Hipertonia muscular em paravertebrais lombares.',
    assessment: 'Melhora progressiva da mobilidade neural e redução da dor de irradiação em comparação à sessão anterior (dor era 7/10). Resposta positiva à tração manual e mobilização articular.',
    plan: 'Manter tração lombar manual, mobilização grau II de Maitland, fortalecimento isométrico de transverso abdominal e multífidos. Prescrever exercícios de mobilidade de quadril para casa.',
    signature: 'Dr. André Silva - CREFITO-3/12345-F'
  },
  {
    id: 'rec-2',
    patientId: 'pat-1',
    patientName: 'Lucas Lima',
    date: '2026-07-13 09:00', // Today's session
    physioId: 'andre',
    physioName: 'Dr. André Silva',
    subjective: 'Relata excelente melhora. Dor atual 2/10, sem irradiação nas últimas 48h. Conseguiu caminhar 30 minutos sem desconforto.',
    objective: 'Flexão de tronco sem dor até 85 graus. Lasègue negativo bilateralmente. Melhora no controle motor lombopélvico durante a ponte pélvica.',
    assessment: 'Fase de estabilização progredindo com sucesso. Hérnia de disco em processo de reabsorção e controle inflamatório completo.',
    plan: 'Progredir para exercícios de fortalecimento excêntrico leve, estabilização dinâmica com bola suíça e agachamento funcional livre guiado.',
    signature: 'Dr. André Silva - CREFITO-3/12345-F'
  },
  {
    id: 'rec-3',
    patientId: 'pat-2',
    patientName: 'Mariana Santos',
    date: '2026-07-10 11:30',
    physioId: 'beatriz',
    physioName: 'Dra. Beatriz Costa',
    subjective: 'Queixa-se de dores cervicais frequentes associadas ao estresse no trabalho e má postura no computador. Sensação de peso nos ombros.',
    objective: 'Presença de pontos-gatilho ativos em trapézio superior bilateralmente e elevador da escápula. Restrição de rotação cervical bilateral (65 graus).',
    assessment: 'Cervicalgia tensional decorrente de sobrecarga ergonômica e estresse muscular. Boa resposta inicial ao agulhamento a seco (dry needling) e liberação miofascial.',
    plan: 'Liberação miofascial manual, alongamentos cervicais ativos e passivos, exercícios de mobilidade torácica no reformer e orientações ergonômicas para home-office.',
    signature: 'Dra. Beatriz Costa - CREFITO-3/54321-F'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Entradas de Julho (consultas pagas)
  {
    id: 'tx-1',
    type: 'entrada',
    category: 'Consulta',
    description: 'Sessão Lucas Lima (Unimed)',
    amount: 150,
    date: '2026-07-06',
    covenant: 'Unimed',
    appointmentId: 'app-1'
  },
  {
    id: 'tx-2',
    type: 'entrada',
    category: 'Consulta',
    description: 'Sessão Mariana Santos (Particular)',
    amount: 200,
    date: '2026-07-10',
    covenant: 'Particular',
    appointmentId: 'rec-3'
  },
  {
    id: 'tx-3',
    type: 'entrada',
    category: 'Repasse Convenio',
    description: 'Repasse mensal Amil - Junho',
    amount: 4500,
    date: '2026-07-02',
    covenant: 'Amil'
  },
  {
    id: 'tx-4',
    type: 'entrada',
    category: 'Repasse Convenio',
    description: 'Repasse Bradesco Saúde - Lote 12',
    amount: 5800,
    date: '2026-07-05',
    covenant: 'Bradesco Saúde'
  },
  {
    id: 'tx-5',
    type: 'entrada',
    category: 'Consulta',
    description: 'Mensalidade Pacote Pilates - Clara O.',
    amount: 600,
    date: '2026-07-08',
    covenant: 'Particular'
  },
  // Saídas de Julho
  {
    id: 'tx-6',
    type: 'saida',
    category: 'Aluguel',
    description: 'Aluguel da sala comercial 804',
    amount: 2500,
    date: '2026-07-01'
  },
  {
    id: 'tx-7',
    type: 'saida',
    category: 'Salários',
    description: 'Salário secretária Sandra Souza',
    amount: 1800,
    date: '2026-07-05'
  },
  {
    id: 'tx-8',
    type: 'saida',
    category: 'Materiais',
    description: 'Compra de agulhas Dry Needling e faixas elásticas',
    amount: 320,
    date: '2026-07-07'
  },
  {
    id: 'tx-9',
    type: 'saida',
    category: 'Utilidades',
    description: 'Conta de Energia Elétrica Enel',
    amount: 480,
    date: '2026-07-10'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'secretary',
    senderName: 'Sandra Souza',
    senderRole: 'Secretária',
    content: 'Olá doutores, bom dia! O primeiro paciente (Lucas Lima) acabou de chegar para o Dr. André.',
    timestamp: '08:55'
  },
  {
    id: 'msg-2',
    senderId: 'andre',
    senderName: 'Dr. André Silva',
    senderRole: 'Fisioterapeuta',
    content: 'Bom dia Sandra, ótimo! Já estou chamando ele em 2 minutos.',
    timestamp: '08:56'
  },
  {
    id: 'msg-3',
    senderId: 'beatriz',
    senderName: 'Dra. Beatriz Costa',
    senderRole: 'Fisioterapeuta',
    content: 'Bom dia a todos! Sandra, a Mariana Santos confirmou o horário dela das 11:30?',
    timestamp: '09:12'
  },
  {
    id: 'msg-4',
    senderId: 'secretary',
    senderName: 'Sandra Souza',
    senderRole: 'Secretária',
    content: 'Sim Dra. Beatriz! Ela acabou de confirmar via WhatsApp e disse que já está a caminho.',
    timestamp: '09:15'
  }
];

export const INITIAL_NOTIFICATIONS: PushNotification[] = [
  {
    id: 'not-1',
    title: 'Check-in via QR Code',
    body: 'Mariana Santos chegou à clínica e confirmou sua presença usando o QR Code da recepção!',
    type: 'success',
    timestamp: '11:15',
    read: false
  },
  {
    id: 'not-2',
    title: 'Novo Agendamento Online',
    body: 'Lucas Lima agendou uma nova consulta para dia 15/07 às 09:00 pelo site.',
    type: 'info',
    timestamp: '10:30',
    read: false
  },
  {
    id: 'not-3',
    title: 'Lembrete Urgente',
    body: 'Faturamento de convênios fecha amanhã. Favor conferir guias pendentes.',
    type: 'urgent',
    timestamp: '08:00',
    read: true
  }
];

export const INITIAL_WHATSAPP_LOGS: WhatsAppLog[] = [
  {
    id: 'wa-1',
    recipientName: 'Lucas Lima',
    phone: '(11) 98765-4321',
    message: 'Olá Lucas! Lembrete da sua consulta com Dr. André Silva hoje, 13/07, às 09:00 na Clínica FisioFlow. Responda SIM para confirmar.',
    timestamp: '2026-07-13 07:30',
    status: 'sent',
    type: 'reminder'
  },
  {
    id: 'wa-2',
    recipientName: 'Mariana Santos',
    phone: '(11) 97654-3210',
    message: 'Olá Mariana! Lembrete da sua consulta com Dra. Beatriz Costa hoje, 13/07, às 11:30. Responda SIM para confirmar.',
    timestamp: '2026-07-13 07:35',
    status: 'sent',
    type: 'reminder'
  }
];

// Database operations with localStorage fallback to make changes persistent
export class ClinicDatabase {
  private static get<T>(key: string, initial: T): T {
    try {
      const data = localStorage.getItem(`fisio_clinic_${key}`);
      return data ? JSON.parse(data) : initial;
    } catch (e) {
      return initial;
    }
  }

  private static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`fisio_clinic_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  static getPatients(): Patient[] {
    return this.get<Patient[]>('patients', INITIAL_PATIENTS);
  }

  static savePatients(patients: Patient[]): void {
    this.set<Patient[]>('patients', patients);
  }

  static getAppointments(): Appointment[] {
    return this.get<Appointment[]>('appointments', INITIAL_APPOINTMENTS);
  }

  static saveAppointments(appointments: Appointment[]): void {
    this.set<Appointment[]>('appointments', appointments);
  }

  static getClinicalRecords(): ClinicalRecord[] {
    return this.get<ClinicalRecord[]>('clinical_records', INITIAL_CLINICAL_RECORDS);
  }

  static saveClinicalRecords(records: ClinicalRecord[]): void {
    this.set<ClinicalRecord[]>('clinical_records', records);
  }

  static getTransactions(): Transaction[] {
    return this.get<Transaction[]>('transactions', INITIAL_TRANSACTIONS);
  }

  static saveTransactions(transactions: Transaction[]): void {
    this.set<Transaction[]>('transactions', transactions);
  }

  static getChatMessages(): ChatMessage[] {
    return this.get<ChatMessage[]>('chat_messages', INITIAL_CHAT_MESSAGES);
  }

  static saveChatMessages(messages: ChatMessage[]): void {
    this.set<ChatMessage[]>('chat_messages', messages);
  }

  static getNotifications(): PushNotification[] {
    return this.get<PushNotification[]>('notifications', INITIAL_NOTIFICATIONS);
  }

  static saveNotifications(notifications: PushNotification[]): void {
    this.set<PushNotification[]>('notifications', notifications);
  }

  static getWhatsAppLogs(): WhatsAppLog[] {
    return this.get<WhatsAppLog[]>('whatsapp_logs', INITIAL_WHATSAPP_LOGS);
  }

  static saveWhatsAppLogs(logs: WhatsAppLog[]): void {
    this.set<WhatsAppLog[]>('whatsapp_logs', logs);
  }

  static clearDatabase(): void {
    try {
      localStorage.removeItem('fisio_clinic_patients');
      localStorage.removeItem('fisio_clinic_appointments');
      localStorage.removeItem('fisio_clinic_clinical_records');
      localStorage.removeItem('fisio_clinic_transactions');
      localStorage.removeItem('fisio_clinic_chat_messages');
      localStorage.removeItem('fisio_clinic_notifications');
      localStorage.removeItem('fisio_clinic_whatsapp_logs');
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  }
}
