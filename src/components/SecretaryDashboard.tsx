import React, { useState } from 'react';
import { Calendar, Users, PhoneCall, QrCode, Plus, Check, X, Search, Clock, FileText, Send, Smartphone, Settings, Copy, ExternalLink, ShieldAlert, CheckSquare } from 'lucide-react';
import { Appointment, Patient, ChatMessage, WhatsAppLog } from '../types';
import InternalChat from './InternalChat';

interface SecretaryDashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  chatMessages: ChatMessage[];
  whatsAppLogs: WhatsAppLog[];
  currentUserId: string;
  currentUserName: string;
  currentUserRoleName: string;
  onSendMessage: (content: string) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onSendWhatsApp: (recipientName: string, phone: string, message: string, type: WhatsAppLog['type']) => void;
}

export default function SecretaryDashboard({
  patients,
  appointments,
  chatMessages,
  whatsAppLogs,
  currentUserId,
  currentUserName,
  currentUserRoleName,
  onSendMessage,
  onAddPatient,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onSendWhatsApp
}: SecretaryDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'appointments' | 'patients' | 'whatsapp' | 'reception' | 'integrations'>('appointments');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Free APIs settings (Google Calendar & WhatsApp)
  const [googleCalendarId, setGoogleCalendarId] = useState(() => localStorage.getItem('google_calendar_id') || 'primary');
  const [whatsappMethod, setWhatsappMethod] = useState<'simulation' | 'direct_link'>(() => (localStorage.getItem('whatsapp_method') as any) || 'direct_link');
  const [copied, setCopied] = useState(false);

  // Modal for Direct WhatsApp Dispatch helper (100% Free)
  const [whatsappDispatchData, setWhatsappDispatchData] = useState<{
    phone: string;
    recipientName: string;
    message: string;
    visible: boolean;
  } | null>(null);

  // Helper to format WhatsApp Link
  const getWhatsAppLink = (phone: string, text: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const standardPhone = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
    return `https://wa.me/${standardPhone}?text=${encodeURIComponent(text)}`;
  };

  // Helper to trigger WhatsApp notification and handle free direct link if configured
  const triggerWhatsAppMessage = (recipientName: string, phone: string, message: string, type: WhatsAppLog['type']) => {
    // 1. Log to simulated database
    onSendWhatsApp(recipientName, phone, message, type);

    // 2. If direct link is active, open helper modal
    if (whatsappMethod === 'direct_link') {
      setWhatsappDispatchData({
        phone,
        recipientName,
        message,
        visible: true
      });
    }
  };

  // States for new appointment
  const [showAddApptModal, setShowAddApptModal] = useState(false);
  const [newApptData, setNewApptData] = useState({
    patientId: '',
    physioId: 'andre' as 'andre' | 'beatriz',
    date: '2026-07-13',
    time: '14:00',
    covenant: 'Particular',
    notes: ''
  });

  // States for new patient
  const [showAddPatModal, setShowAddPatModal] = useState(false);
  const [newPatData, setNewPatData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    covenant: 'Particular',
    birthDate: '1990-01-01'
  });

  // Filtered Patients
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm)
  );

  // Filtered Appointments
  const filteredAppointments = appointments.filter(a =>
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.physioName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.time.localeCompare(b.time));

  // Handle appointment scheduling from administrative dashboard
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApptData.patientId) {
      alert('Selecione um paciente!');
      return;
    }
    const selectedPatient = patients.find(p => p.id === newApptData.patientId);
    if (!selectedPatient) return;

    onAddAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      physioId: newApptData.physioId,
      physioName: newApptData.physioId === 'andre' ? 'Dr. André Silva' : 'Dra. Beatriz Costa',
      date: newApptData.date,
      time: newApptData.time,
      status: 'confirmed',
      covenant: newApptData.covenant || selectedPatient.covenant,
      cost: newApptData.physioId === 'andre' ? 150 : 200,
      googleSynced: true,
      notes: newApptData.notes
    });

    // Trigger WhatsApp via free handler
    const msg = `Olá ${selectedPatient.name}! Sua consulta de Fisioterapia está confirmada para dia ${newApptData.date.split('-').reverse().join('/')} às ${newApptData.time} com ${newApptData.physioId === 'andre' ? 'Dr. André Silva' : 'Dra. Beatriz Costa'}.`;
    triggerWhatsAppMessage(selectedPatient.name, selectedPatient.phone, msg, 'confirmation');

    setShowAddApptModal(false);
    setNewApptData({
      patientId: '',
      physioId: 'andre',
      date: '2026-07-13',
      time: '14:00',
      covenant: 'Particular',
      notes: ''
    });
  };

  // Handle manual patient registering
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatData.name || !newPatData.cpf || !newPatData.phone) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    onAddPatient({
      name: newPatData.name,
      cpf: newPatData.cpf,
      phone: newPatData.phone,
      email: newPatData.email || `${newPatData.name.toLowerCase().replace(/\s+/g, '')}@exemplo.com`,
      covenant: newPatData.covenant,
      birthDate: newPatData.birthDate,
      active: true
    });
    setShowAddPatModal(false);
    setNewPatData({
      name: '',
      cpf: '',
      phone: '',
      email: '',
      covenant: 'Particular',
      birthDate: '1990-01-01'
    });
  };

  const triggerManualWhatsAppReminder = (appt: Appointment) => {
    const patientObj = patients.find(p => p.id === appt.patientId);
    if (!patientObj) return;

    const msg = `Olá ${appt.patientName}! Passando para lembrar da sua consulta com ${appt.physioName} amanhã, dia ${appt.date.split('-').reverse().join('/')} às ${appt.time}. Responda SIM para confirmar.`;
    triggerWhatsAppMessage(appt.patientName, patientObj.phone, msg, 'reminder');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="secretary-dashboard">
      {/* Primary Workspace */}
      <div className="xl:col-span-8 space-y-6">
        {/* Navigation Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 shadow-sm shrink-0">
          <button
            onClick={() => setActiveSubTab('appointments')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'appointments' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="subtab-appointments"
          >
            <Calendar className="w-4 h-4 inline-block mr-1.5" />
            Agenda Geral
          </button>
          <button
            onClick={() => setActiveSubTab('patients')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'patients' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="subtab-patients"
          >
            <Users className="w-4 h-4 inline-block mr-1.5" />
            Pacientes
          </button>
          <button
            onClick={() => setActiveSubTab('whatsapp')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'whatsapp' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="subtab-whatsapp"
          >
            <Smartphone className="w-4 h-4 inline-block mr-1.5" />
            WhatsApp Disparos
          </button>
          <button
            onClick={() => setActiveSubTab('reception')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'reception' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="subtab-reception"
          >
            <QrCode className="w-4 h-4 inline-block mr-1.5 animate-pulse text-rose-500" />
            Display Recepção
          </button>
          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'integrations' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="subtab-integrations"
          >
            <Settings className="w-4 h-4 inline-block mr-1.5" />
            APIs Gratuitas
          </button>
        </div>

        {/* Dynamic Inner Panel */}
        {activeSubTab === 'appointments' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">Controle Diário de Consultas</h2>
                <p className="text-xs text-slate-500">Monitore e confirme o fluxo de atendimento da clínica em tempo real.</p>
              </div>
              <button
                onClick={() => setShowAddApptModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                id="open-new-appt-modal"
              >
                <Plus className="w-4 h-4" />
                Agendar Consulta
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por paciente ou fisioterapeuta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                id="search-appointments"
              />
            </div>

            {/* List */}
            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center bg-slate-50/50">Nenhum compromisso encontrado.</p>
              ) : (
                filteredAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors" id={`sec-appt-${appt.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 text-slate-600 rounded-lg shrink-0 font-mono text-xs font-bold flex flex-col items-center">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span className="mt-0.5">{appt.time}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{appt.patientName}</p>
                        <p className="text-[11px] text-slate-500">
                          Fisio: <strong className="text-slate-700">{appt.physioName}</strong> | Data: {appt.date.split('-').reverse().join('/')}
                        </p>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] text-slate-400 font-medium">Convênio: {appt.covenant}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">R$ {appt.cost}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-11 md:pl-0">
                      {/* Status badge */}
                      {appt.status === 'pending' && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Pendente</span>
                      )}
                      {appt.status === 'confirmed' && (
                        <span className="bg-sky-100 text-sky-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Confirmada</span>
                      )}
                      {appt.status === 'checked_in' && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold animate-pulse">Presente (QR Code)</span>
                      )}
                      {appt.status === 'completed' && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Realizada</span>
                      )}
                      {appt.status === 'cancelled' && (
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-0.5 rounded-full font-bold">Cancelada</span>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1">
                        {appt.status === 'pending' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'confirmed')}
                            className="p-1 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 rounded cursor-pointer"
                            title="Confirmar Horário"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(appt.status === 'confirmed' || appt.status === 'pending') && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'checked_in')}
                            className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded cursor-pointer"
                            title="Confirmar Presença (QR)"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'cancelled')}
                            className="p-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded cursor-pointer"
                            title="Cancelar Horário"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                          <button
                            onClick={() => triggerManualWhatsAppReminder(appt)}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-semibold rounded border border-teal-200/50 cursor-pointer flex items-center gap-1"
                          >
                            <Smartphone className="w-3 h-3 text-teal-600" />
                            Cobrar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'patients' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">Cadastro de Pacientes</h2>
                <p className="text-xs text-slate-500">Pesquise, edite ou cadastre novos pacientes de forma centralizada.</p>
              </div>
              <button
                onClick={() => setShowAddPatModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                id="open-new-patient-modal"
              >
                <Plus className="w-4 h-4" />
                Novo Paciente
              </button>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                id="search-patients"
              />
            </div>

            {/* Table */}
            <div className="border border-slate-100 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Nome</th>
                    <th className="p-3">CPF</th>
                    <th className="p-3">Celular</th>
                    <th className="p-3">Convênio</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Nenhum paciente cadastrado.</td>
                    </tr>
                  ) : (
                    filteredPatients.map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-50/50 transition-colors" id={`sec-pat-${pat.id}`}>
                        <td className="p-3 font-semibold text-slate-800">{pat.name}</td>
                        <td className="p-3 font-mono text-slate-500">{pat.cpf}</td>
                        <td className="p-3 text-slate-600">{pat.phone}</td>
                        <td className="p-3 text-slate-600">{pat.covenant}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">
                            Ativo
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'whatsapp' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Lembretes e Disparos Automáticos de WhatsApp</h2>
              <p className="text-xs text-slate-500">Acompanhe as notificações ativas que o sistema envia para os pacientes.</p>
            </div>

            {/* logs */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {whatsAppLogs.map((log) => (
                <div key={log.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-3" id={`wa-log-${log.id}`}>
                  <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                    <Smartphone className="w-4.5 h-4.5" />
                  </span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-800">{log.recipientName} ({log.phone})</p>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg italic">
                      "{log.message}"
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        ✓ Enviado
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">Tipo: {log.type === 'confirmation' ? 'Confirmação' : 'Lembrete'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'reception' && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center space-y-6">
            <div className="max-w-md mx-auto space-y-4" id="secretary-reception-portal">
              <span className="bg-rose-100 text-rose-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Display Fixo da Recepção (Totem QR)
              </span>
              <h3 className="text-lg font-bold text-slate-800">Check-In por Smartphone na Entrada</h3>
              <p className="text-xs text-slate-600">
                Este QR Code deve ficar impresso ou visível em um tablet na recepção da clínica para que os pacientes confirmem presença sozinhos ao chegar.
              </p>

              {/* Decorative QR Code block */}
              <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl inline-block shadow-inner relative">
                <QrCode className="w-48 h-48 mx-auto text-slate-800" />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[9px] px-2.5 py-0.5 rounded-full font-bold">
                  FISIOFLOW_RECEPCAO_804
                </span>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl text-left text-xs text-slate-600 space-y-2">
                <p className="font-bold text-teal-900">Como funciona para o paciente?</p>
                <ol className="list-decimal list-inside space-y-1 text-teal-800">
                  <li>O paciente chega à recepção e acessa o Portal do Paciente.</li>
                  <li>Clica na aba "Check-In" e lê este código com a câmera.</li>
                  <li>A consulta muda instantaneamente para "Presente" no seu painel!</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'integrations' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-600" />
                Configurações de APIs Gratuitas & Autohospedadas
              </h2>
              <p className="text-xs text-slate-500">
                Configure as integrações oficiais da sua clínica sem pagar intermediários ou taxas mensais.
              </p>
            </div>

            {/* GOOGLE CALENDAR CARD */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4.5 h-4.5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-xs">1. Sincronização Nativa com Google Calendar (Sem Custos)</h3>
                </div>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-bold uppercase px-2 py-0.5 rounded border border-blue-100">
                  Cota Gratuita Gigante
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  Para sincronizar suas consultas com o Google Calendar da clínica sem intermediários pagos, usamos uma <strong>Conta de Serviço (Service Account)</strong> do seu próprio Google Cloud Platform.
                </p>

                {/* Service Account Email Display */}
                <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg border border-slate-800 font-mono text-[11px] space-y-1.5 relative">
                  <span className="text-[9px] text-slate-400 font-sans uppercase font-bold block">E-mail da Conta de Serviço Detectado:</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-teal-400 break-all select-all">calendario-jcfisio@physioflow-502702.iam.gserviceaccount.com</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('calendario-jcfisio@physioflow-502702.iam.gserviceaccount.com');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="shrink-0 p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Copiar e-mail"
                    >
                      {copied ? <span className="text-[10px] text-emerald-400 font-bold px-1">Copiado!</span> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Google Calendar ID Config */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">ID da Agenda Google do Consultório</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={googleCalendarId}
                      onChange={(e) => {
                        setGoogleCalendarId(e.target.value);
                        localStorage.setItem('google_calendar_id', e.target.value);
                      }}
                      placeholder="Ex: consultorio@gmail.com ou ID longo do Google Agenda"
                      className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono shadow-3xs"
                    />
                    <button
                      onClick={() => alert(`ID da Agenda salva como: "${googleCalendarId}". O sistema usará essa agenda para sincronizar novos atendimentos automaticamente!`)}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      Salvar ID
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Use <code className="font-mono bg-slate-100 text-[9px] px-1 py-0.5 rounded">primary</code> para o calendário padrão da conta conectada ou insira o ID de uma agenda compartilhada.
                  </span>
                </div>

                {/* Step-by-Step Interactive Guide */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    Como concluir a integração em 2 minutos:
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-600 pl-1">
                    <li>
                      Copie o e-mail verde acima: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-teal-600 text-[9px]">calendario-jcfisio@physioflow-502702.iam.gserviceaccount.com</span>
                    </li>
                    <li>
                      Abra o seu <strong>Google Agenda</strong> pessoal ou do consultório no computador.
                    </li>
                    <li>
                      No menu lateral esquerdo, clique nos <strong className="text-slate-800">três pontinhos (...)</strong> ao lado da sua agenda e escolha <strong className="text-slate-800">"Configurações e Compartilhamento"</strong>.
                    </li>
                    <li>
                      Role até a seção <strong className="text-slate-800">"Compartilhar com pessoas ou grupos específicos"</strong> e clique em <strong className="text-slate-800">"Adicionar pessoas"</strong>.
                    </li>
                    <li>
                      Cole o e-mail copiado e, no campo de permissão, selecione <strong>"Fazer alterações em eventos"</strong> (necessário para que a API possa cadastrar e editar as consultas). Clique em Enviar.
                    </li>
                  </ol>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1 pl-1">
                    <span>✓ Pronto!</span> A sincronização já está ativa no back-end. Qualquer agendamento criado se refletirá instantaneamente na sua agenda Google.
                  </p>
                </div>
              </div>
            </div>

            {/* WHATSAPP CARD */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4.5 h-4.5 text-emerald-600" />
                  <h3 className="font-bold text-slate-800 text-xs">2. Disparos Gratuitos via Link Direto (Sem Custos)</h3>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold uppercase px-2 py-0.5 rounded border border-emerald-100">
                  100% Gratuito & Oficial
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <p>
                  Elimine gateways de WhatsApp pagos (Z-API, Evolution, etc.) e utilize o protocolo nativo de <strong>Link Direto</strong>. Quando uma consulta for agendada ou cobrada, o sistema gera o texto e prepara o redirecionamento imediato sem taxas.
                </p>

                {/* Method selector toggle */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => {
                      setWhatsappMethod('direct_link');
                      localStorage.setItem('whatsapp_method', 'direct_link');
                    }}
                    className={`py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      whatsappMethod === 'direct_link' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Link Direto Oficial (wa.me)
                  </button>
                  <button
                    onClick={() => {
                      setWhatsappMethod('simulation');
                      localStorage.setItem('whatsapp_method', 'simulation');
                    }}
                    className={`py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      whatsappMethod === 'simulation' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Simulador Interno de Painel
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <p className="font-bold text-slate-800 text-[11px]">Por que usar o Link Direto oficial?</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                    <li><strong>Sem banimentos:</strong> Utiliza o próprio app ou WhatsApp Web oficial do consultório.</li>
                    <li><strong>Sem taxas mensais:</strong> Não necessita de intermediários ou servidores dedicados.</li>
                    <li><strong>Responsivo:</strong> Funciona perfeitamente no celular, tablet ou computador da recepção.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* TISS CARD */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex items-start gap-3.5">
              <span className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs">Faturamento Local XML TISS 4.01</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  O módulo de faturamento em conformidade com o padrão ANS 4.01 está integrado no <strong>Painel Financeiro (Admin)</strong>. Ele lê os dados dos atendimentos e gera os arquivos XML de lote localmente, sem enviar dados para APIs de terceiros.
                </p>
                <div className="pt-1.5">
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold uppercase px-2 py-0.5 rounded border border-indigo-100">
                    Faturamento Seguro e Offline
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Internal Chat Sidebar */}
      <div className="xl:col-span-4">
        <InternalChat
          messages={chatMessages}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserRoleName={currentUserRoleName}
          onSendMessage={onSendMessage}
        />
      </div>

      {/* ADD APPOINTMENT MODAL */}
      {showAddApptModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Novo Agendamento Administrativo</h3>
              <button onClick={() => setShowAddApptModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Selecionar Paciente</label>
                <select
                  value={newApptData.patientId}
                  onChange={(e) => setNewApptData(prev => ({ ...prev, patientId: e.target.value }))}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  id="modal-appt-patient"
                >
                  <option value="">-- Escolha um paciente cadastrado --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.cpf})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fisioterapeuta</label>
                  <select
                    value={newApptData.physioId}
                    onChange={(e) => setNewApptData(prev => ({ ...prev, physioId: e.target.value as 'andre' | 'beatriz' }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    id="modal-appt-physio"
                  >
                    <option value="andre">Dr. André Silva (Ortopedia)</option>
                    <option value="beatriz">Dra. Beatriz Costa (Pilates)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Convênio Aplicado</label>
                  <select
                    value={newApptData.covenant}
                    onChange={(e) => setNewApptData(prev => ({ ...prev, covenant: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    id="modal-appt-covenant"
                  >
                    <option value="Particular">Particular</option>
                    <option value="Unimed">Unimed</option>
                    <option value="Amil">Amil</option>
                    <option value="Bradesco Saúde">Bradesco Saúde</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Data</label>
                  <input
                    type="date"
                    value={newApptData.date}
                    onChange={(e) => setNewApptData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                    id="modal-appt-date"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Horário</label>
                  <select
                    value={newApptData.time}
                    onChange={(e) => setNewApptData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                    id="modal-appt-time"
                  >
                    <option value="08:00">08:00</option>
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:30">11:30</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas Internas</label>
                <textarea
                  value={newApptData.notes}
                  onChange={(e) => setNewApptData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                  id="modal-appt-notes"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-md transition-all"
                id="modal-appt-submit"
              >
                Salvar Agendamento & Avisar Cliente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD PATIENT MODAL */}
      {showAddPatModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Cadastrar Novo Paciente</h3>
              <button onClick={() => setShowAddPatModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newPatData.name}
                  onChange={(e) => setNewPatData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                  id="modal-pat-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="123.456.789-00"
                    value={newPatData.cpf}
                    onChange={(e) => setNewPatData(prev => ({ ...prev, cpf: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                    id="modal-pat-cpf"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Celular *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={newPatData.phone}
                    onChange={(e) => setNewPatData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                    id="modal-pat-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nascimento</label>
                  <input
                    type="date"
                    value={newPatData.birthDate}
                    onChange={(e) => setNewPatData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                    id="modal-pat-birth"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Convênio Principal</label>
                  <select
                    value={newPatData.covenant}
                    onChange={(e) => setNewPatData(prev => ({ ...prev, covenant: e.target.value }))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                    id="modal-pat-covenant"
                  >
                    <option value="Particular">Particular</option>
                    <option value="Unimed">Unimed</option>
                    <option value="Amil">Amil</option>
                    <option value="Bradesco Saúde">Bradesco Saúde</option>
                    <option value="SulAmérica">SulAmérica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">E-mail</label>
                <input
                  type="email"
                  value={newPatData.email}
                  onChange={(e) => setNewPatData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                  id="modal-pat-email"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-md transition-all pt-2"
                id="modal-pat-submit"
              >
                Cadastrar Paciente
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Direct Dispatch Modal (100% Free wa.me) */}
      {whatsappDispatchData?.visible && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl p-5 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                Disparar WhatsApp (100% Gratuito)
              </h3>
              <button
                onClick={() => setWhatsappDispatchData(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div>
                <p className="font-bold text-slate-500 text-[10px] uppercase">Paciente</p>
                <p className="font-semibold text-slate-800">{whatsappDispatchData.recipientName} ({whatsappDispatchData.phone})</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mensagem de Envio</label>
                <textarea
                  value={whatsappDispatchData.message}
                  onChange={(e) => setWhatsappDispatchData(prev => prev ? { ...prev, message: e.target.value } : null)}
                  rows={4}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-start gap-2 text-[11px] text-emerald-800 leading-relaxed">
                <ShieldAlert className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  Ao clicar abaixo, uma nova aba se abrirá com o link oficial <strong>wa.me</strong>. Você poderá enviar a mensagem diretamente do seu celular ou WhatsApp Web sem pagar nenhuma taxa!
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setWhatsappDispatchData(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] cursor-pointer"
                >
                  Cancelar
                </button>
                <a
                  href={getWhatsAppLink(whatsappDispatchData.phone, whatsappDispatchData.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWhatsappDispatchData(null)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg text-center cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Disparar WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
