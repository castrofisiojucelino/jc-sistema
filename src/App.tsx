import React, { useState, useEffect } from 'react';
import { 
  Role, Patient, Appointment, ClinicalRecord, 
  Transaction, ChatMessage, PushNotification, WhatsAppLog 
} from './types';
import { ClinicDatabase } from './db/mockDb';

// Icons
import { 
  Activity, Calendar, Users, DollarSign, MessageSquare, 
  Smartphone, QrCode, ClipboardList, ShieldAlert, 
  HelpCircle, RefreshCw, UserCheck, Heart, User, Sparkles
} from 'lucide-react';

// Components
import PushNotificationCenter from './components/PushNotificationCenter';
import OnlineBooking from './components/OnlineBooking';
import PatientPortal from './components/PatientPortal';
import SecretaryDashboard from './components/SecretaryDashboard';
import PhysioDashboard from './components/PhysioDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Active Simulated Role
  const [currentRole, setCurrentRole] = useState<Role>('secretary');

  // Database State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [whatsAppLogs, setWhatsAppLogs] = useState<WhatsAppLog[]>([]);

  // Load from database on startup
  useEffect(() => {
    setPatients(ClinicDatabase.getPatients());
    setAppointments(ClinicDatabase.getAppointments());
    setRecords(ClinicDatabase.getClinicalRecords());
    setTransactions(ClinicDatabase.getTransactions());
    setChatMessages(ClinicDatabase.getChatMessages());
    setNotifications(ClinicDatabase.getNotifications());
    setWhatsAppLogs(ClinicDatabase.getWhatsAppLogs());
  }, []);

  // Sync helpers with state
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [...patients, newPatient];
    setPatients(updated);
    ClinicDatabase.savePatients(updated);

    // Create a system alert (Push Notification)
    createPushNotification(
      'Novo Paciente Cadastrado',
      `Ficha de ${newPatient.name} foi registrada com sucesso no sistema.`,
      'success'
    );

    return newPatient;
  };

  const handleAddAppointment = (apptData: Omit<Appointment, 'id'>) => {
    const newAppt: Appointment = {
      ...apptData,
      id: `app-${Date.now()}`
    };
    const updated = [...appointments, newAppt];
    setAppointments(updated);
    ClinicDatabase.saveAppointments(updated);

    // Push notification for the team
    createPushNotification(
      'Agendamento Registrado',
      `${newAppt.patientName} agendou para dia ${newAppt.date.split('-').reverse().join('/')} às ${newAppt.time} com ${newAppt.physioName}.`,
      'info'
    );

    // If Google Calendar was checked, simulate sync log
    if (newAppt.googleSynced) {
      createPushNotification(
        'Google Calendar Sincronizado',
        `Consulta de ${newAppt.patientName} sincronizada com sucesso na agenda corporativa.`,
        'success'
      );
    }

    // Trigger simulated WhatsApp notification
    const waMessage = `Olá ${newAppt.patientName}! Sua consulta de Fisioterapia está confirmada para o dia ${newAppt.date.split('-').reverse().join('/')} às ${newAppt.time} com ${newAppt.physioName} na Clínica FisioFlow.`;
    handleSendWhatsApp(newAppt.patientName, '(11) 99999-9999', waMessage, 'confirmation');
  };

  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        // If status changes to checked_in, trigger receptionist and physio alerts
        if (status === 'checked_in') {
          createPushNotification(
            'Chegada de Paciente (QR Code)',
            `${appt.patientName} confirmou presença pelo QR Code da recepção para consulta de ${appt.time}.`,
            'urgent'
          );
        }
        return { ...appt, status };
      }
      return appt;
    });
    setAppointments(updated);
    ClinicDatabase.saveAppointments(updated);
  };

  const handleSendMessage = (content: string) => {
    // Determine sender based on role
    let senderId = 'admin';
    let senderName = 'Administrador';
    let senderRole = 'Administração';

    if (currentRole === 'secretary') {
      senderId = 'secretary';
      senderName = 'Sandra Souza';
      senderRole = 'Secretária';
    } else if (currentRole === 'physio_andre') {
      senderId = 'andre';
      senderName = 'Dr. André Silva';
      senderRole = 'Fisioterapeuta';
    } else if (currentRole === 'physio_beatriz') {
      senderId = 'beatriz';
      senderName = 'Dra. Beatriz Costa';
      senderRole = 'Fisioterapeuta';
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    ClinicDatabase.saveChatMessages(updated);
  };

  const handleAddClinicalRecord = (recordData: Omit<ClinicalRecord, 'id' | 'date' | 'physioId' | 'physioName' | 'signature'>) => {
    const physioId = currentRole === 'physio_andre' ? 'andre' : 'beatriz';
    const physioName = currentRole === 'physio_andre' ? 'Dr. André Silva' : 'Dra. Beatriz Costa';
    const credentials = currentRole === 'physio_andre' ? 'CREFITO-3/12345-F' : 'CREFITO-3/54321-F';

    const newRecord: ClinicalRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      date: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      physioId,
      physioName,
      signature: `${physioName} - ${credentials}`
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    ClinicDatabase.saveClinicalRecords(updatedRecords);

    // Register a financial entry (Revenue) automatically when the record is signed!
    const updatedTxs: Transaction[] = [
      ...transactions,
      {
        id: `tx-gen-${Date.now()}`,
        type: 'entrada',
        category: 'Consulta',
        description: `Sessão ${recordData.patientName} (${physioName})`,
        amount: physioId === 'andre' ? 150 : 200,
        date: new Date().toISOString().split('T')[0],
        covenant: patients.find(p => p.id === recordData.patientId)?.covenant || 'Particular'
      }
    ];
    setTransactions(updatedTxs);
    ClinicDatabase.saveTransactions(updatedTxs);

    // Generate push notification
    createPushNotification(
      'Sessão Concluída',
      `O prontuário de ${recordData.patientName} foi assinado eletronicamente por ${physioName}.`,
      'success'
    );
  };

  const handleAddTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`
    };
    const updated = [...transactions, newTx];
    setTransactions(updated);
    ClinicDatabase.saveTransactions(updated);
  };

  const handleSendWhatsApp = (recipientName: string, phone: string, message: string, type: WhatsAppLog['type']) => {
    const newLog: WhatsAppLog = {
      id: `wa-${Date.now()}`,
      recipientName,
      phone,
      message,
      timestamp: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'sent',
      type
    };
    const updated = [...whatsAppLogs, newLog];
    setWhatsAppLogs(updated);
    ClinicDatabase.saveWhatsAppLogs(updated);
  };

  // Push Notifications controllers
  const createPushNotification = (title: string, body: string, type: PushNotification['type']) => {
    const newNotif: PushNotification = {
      id: `not-${Date.now()}`,
      title,
      body,
      type,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    ClinicDatabase.saveNotifications(updated);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    ClinicDatabase.saveNotifications(updated);
  };

  const handleClearNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    ClinicDatabase.saveNotifications(updated);
  };

  const handleResetData = () => {
    if (confirm('Tem certeza que deseja redefinir os dados para o padrão de simulação?')) {
      ClinicDatabase.clearDatabase();
    }
  };

  // Get display details for logged in user badge
  const getUserBadge = () => {
    switch (currentRole) {
      case 'secretary':
        return { name: 'Sandra Souza', role: 'Secretária', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120' };
      case 'physio_andre':
        return { name: 'Dr. André Silva', role: 'Ortopedista', avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120' };
      case 'physio_beatriz':
        return { name: 'Dra. Beatriz Costa', role: 'Pilates / RPG', avatar: 'https://images.unsplash.com/photo-1594824813573-246434e33963?auto=format&fit=crop&q=80&w=120' };
      case 'patient':
        return { name: 'Lucas Lima (Paciente)', role: 'Convênio: Unimed', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' };
      case 'admin':
        return { name: 'Filipe Antunes', role: 'Administrador Geral', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120' };
      default:
        return { name: 'Público', role: 'Visitante', avatar: '' };
    }
  };

  const badge = getUserBadge();

  const headerInfo = (() => {
    switch (currentRole) {
      case 'public_site':
        return { title: 'Site Público & Recepção Virtual', badge: 'Recepção Livre', badgeBg: 'bg-emerald-50 text-emerald-600' };
      case 'secretary':
        return { title: 'Painel da Recepção', badge: 'Secretária: Sandra Souza', badgeBg: 'bg-teal-50 text-teal-600' };
      case 'physio_andre':
        return { title: 'Prontuários & Evolução', badge: 'Dr. André (Ortop.)', badgeBg: 'bg-teal-50 text-teal-600' };
      case 'physio_beatriz':
        return { title: 'Prontuários & Evolução', badge: 'Dra. Beatriz (Pilates)', badgeBg: 'bg-teal-50 text-teal-600' };
      case 'admin':
        return { title: 'Controle Financeiro & BI', badge: 'Admin Geral', badgeBg: 'bg-indigo-50 text-indigo-600' };
      case 'patient':
        return { title: 'Portal do Paciente', badge: 'Paciente: Lucas Lima', badgeBg: 'bg-amber-50 text-amber-600' };
      default:
        return { title: 'FisioFlow', badge: 'Geral', badgeBg: 'bg-slate-100 text-slate-500' };
    }
  })();

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] font-sans overflow-hidden text-slate-900 antialiased">
      {/* 
        SIDEBAR NAVIGATION (High Density Theme)
      */}
      <aside className="w-52 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800 hidden lg:flex">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-500 text-slate-900 rounded-lg shrink-0">
              <Activity className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <h1 className="text-teal-400 font-extrabold text-base tracking-tight font-display">PhysioFlow</h1>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold block">Sist. Integrado</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items serving as Simulator Role buttons */}
        <nav className="flex-1 py-4 space-y-1.5 px-3 overflow-y-auto">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-3 mb-2">
            Ambientes Simulados
          </div>

          <button
            onClick={() => setCurrentRole('public_site')}
            className={`flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-md transition-all text-left cursor-pointer ${
              currentRole === 'public_site' 
                ? 'bg-slate-800 text-white shadow-xs font-bold border-l-2 border-teal-400 rounded-l-none' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentRole === 'public_site' ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span>🌐 Site Público</span>
          </button>

          <button
            onClick={() => setCurrentRole('secretary')}
            className={`flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-md transition-all text-left cursor-pointer ${
              currentRole === 'secretary' 
                ? 'bg-slate-800 text-white shadow-xs font-bold border-l-2 border-teal-400 rounded-l-none' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentRole === 'secretary' ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span>💼 Secretária</span>
          </button>

          <button
            onClick={() => setCurrentRole('physio_andre')}
            className={`flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-md transition-all text-left cursor-pointer ${
              currentRole === 'physio_andre' 
                ? 'bg-slate-800 text-white shadow-xs font-bold border-l-2 border-teal-400 rounded-l-none' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentRole === 'physio_andre' ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span>🩺 Dr. André</span>
          </button>

          <button
            onClick={() => setCurrentRole('physio_beatriz')}
            className={`flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-md transition-all text-left cursor-pointer ${
              currentRole === 'physio_beatriz' 
                ? 'bg-slate-800 text-white shadow-xs font-bold border-l-2 border-teal-400 rounded-l-none' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentRole === 'physio_beatriz' ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span>🩺 Dra. Beatriz</span>
          </button>

          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-md transition-all text-left cursor-pointer ${
              currentRole === 'admin' 
                ? 'bg-slate-800 text-white shadow-xs font-bold border-l-2 border-teal-400 rounded-l-none' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentRole === 'admin' ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span>📊 Financeiro</span>
          </button>

          <button
            onClick={() => setCurrentRole('patient')}
            className={`flex items-center space-x-2.5 w-full px-3 py-2 text-xs font-semibold rounded-md transition-all text-left cursor-pointer ${
              currentRole === 'patient' 
                ? 'bg-slate-800 text-white shadow-xs font-bold border-l-2 border-teal-400 rounded-l-none' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentRole === 'patient' ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span>👤 Paciente</span>
          </button>
        </nav>

        {/* Connected API status block from Design HTML */}
        <div className="p-4 bg-slate-950 text-[10px] text-slate-500 border-t border-slate-800 space-y-2">
          <div className="flex justify-between">
            <span>WhatsApp API</span>
            <span className="text-emerald-500 font-bold">Conectado</span>
          </div>
          <div className="flex justify-between">
            <span>Google Cal</span>
            <span className="text-blue-500 font-bold">Sincronizado</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[9px]">
            <span>Base Simulação</span>
            <button
              onClick={handleResetData}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
              title="Restaurar Banco de Dados Simulado"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Resetar
            </button>
          </div>
        </div>
      </aside>

      {/* 
        MAIN CONTENT PANELS WRAPPER
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        {/* 
          PRIMARY HEADER (14-height / high density style)
        */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-30 sticky top-0">
          <div className="flex items-center space-x-4">
            <h2 className="font-bold text-slate-800 text-sm md:text-base font-display flex items-center gap-2">
              <span className="lg:hidden p-1 bg-teal-600 text-white rounded shrink-0">
                <Activity className="w-4 h-4 animate-pulse" />
              </span>
              <span>{headerInfo.title}</span>
            </h2>
            <div className="flex space-x-1.5 hidden sm:flex">
              <span className={`px-2 py-0.5 text-[9px] rounded uppercase font-bold tracking-wider ${headerInfo.badgeBg}`}>
                {headerInfo.badge}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded uppercase font-bold tracking-wider">
                Unidade: Central
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right text-[10px] hidden md:block">
              <span className="text-slate-400 font-bold uppercase tracking-wider block font-mono">Data do Sistema</span>
              <span className="text-slate-600 font-bold font-mono">13 Julho 2026 - 15:33</span>
            </div>

            {/* Simulated Live Alert Center */}
            {currentRole !== 'public_site' && (
              <PushNotificationCenter
                notifications={notifications}
                onMarkAllAsRead={handleMarkAllNotificationsRead}
                onClearNotification={handleClearNotification}
              />
            )}

            {/* Profile pill */}
            {currentRole !== 'public_site' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 p-1 pr-2.5 rounded-full shrink-0">
                {badge.avatar ? (
                  <img src={badge.avatar} alt={badge.name} className="w-6 h-6 rounded-full object-cover shadow-inner shrink-0" />
                ) : (
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0">
                    U
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="text-[9px] font-extrabold text-slate-800 leading-none">{badge.name}</p>
                  <p className="text-[8px] text-slate-500 font-bold leading-none mt-0.5">{badge.role}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* 
          MOBILE ROLE SWITCHER BANNER
          Only visible on small devices where left sidebar is hidden
        */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-1.5 lg:hidden shrink-0" id="role-simulator-banner">
          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-slate-300">Ambientes de Simulação</span>
            <button onClick={handleResetData} className="text-slate-400 hover:text-white flex items-center gap-0.5">
              <RefreshCw className="w-2 h-2" /> Resetar
            </button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setCurrentRole('public_site')}
              className={`px-2 py-1 text-[10px] font-bold rounded shrink-0 transition-all ${
                currentRole === 'public_site' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
              }`}
            >
              🌐 Site
            </button>
            <button
              onClick={() => setCurrentRole('secretary')}
              className={`px-2 py-1 text-[10px] font-bold rounded shrink-0 transition-all ${
                currentRole === 'secretary' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
              }`}
            >
              💼 Secretária
            </button>
            <button
              onClick={() => setCurrentRole('physio_andre')}
              className={`px-2 py-1 text-[10px] font-bold rounded shrink-0 transition-all ${
                currentRole === 'physio_andre' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
              }`}
            >
              🩺 André
            </button>
            <button
              onClick={() => setCurrentRole('physio_beatriz')}
              className={`px-2 py-1 text-[10px] font-bold rounded shrink-0 transition-all ${
                currentRole === 'physio_beatriz' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
              }`}
            >
              🩺 Beatriz
            </button>
            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-2 py-1 text-[10px] font-bold rounded shrink-0 transition-all ${
                currentRole === 'admin' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
              }`}
            >
              📊 Admin
            </button>
            <button
              onClick={() => setCurrentRole('patient')}
              className={`px-2 py-1 text-[10px] font-bold rounded shrink-0 transition-all ${
                currentRole === 'patient' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300'
              }`}
            >
              👤 Paciente
            </button>
          </div>
        </div>

        {/* 
          SCROLLABLE CONTENT AREA (Generates the high density layout look)
        */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-5 bg-[#F8FAFC]">
          <div className="max-w-[1300px] mx-auto animate-fade-in">
            {currentRole === 'public_site' && (
              <OnlineBooking
                patients={patients}
                appointments={appointments}
                onAddAppointment={handleAddAppointment}
                onAddPatient={handleAddPatient}
                onSendWhatsApp={handleSendWhatsApp}
              />
            )}

            {currentRole === 'secretary' && (
              <SecretaryDashboard
                patients={patients}
                appointments={appointments}
                chatMessages={chatMessages}
                whatsAppLogs={whatsAppLogs}
                currentUserId="secretary"
                currentUserName="Sandra Souza"
                currentUserRoleName="Secretária"
                onSendMessage={handleSendMessage}
                onAddPatient={handleAddPatient}
                onAddAppointment={handleAddAppointment}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onSendWhatsApp={handleSendWhatsApp}
              />
            )}

            {currentRole === 'physio_andre' && (
              <PhysioDashboard
                physioId="andre"
                physioName="Dr. André Silva"
                crefito="CREFITO-3/12345-F"
                patients={patients}
                appointments={appointments}
                records={records}
                chatMessages={chatMessages}
                currentUserId="andre"
                currentUserName="Dr. André Silva"
                currentUserRoleName="Fisioterapeuta"
                onSendMessage={handleSendMessage}
                onAddClinicalRecord={handleAddClinicalRecord}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              />
            )}

            {currentRole === 'physio_beatriz' && (
              <PhysioDashboard
                physioId="beatriz"
                physioName="Dra. Beatriz Costa"
                crefito="CREFITO-3/54321-F"
                patients={patients}
                appointments={appointments}
                records={records}
                chatMessages={chatMessages}
                currentUserId="beatriz"
                currentUserName="Dra. Beatriz Costa"
                currentUserRoleName="Fisioterapeuta"
                onSendMessage={handleSendMessage}
                onAddClinicalRecord={handleAddClinicalRecord}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              />
            )}

            {currentRole === 'admin' && (
              <AdminDashboard
                transactions={transactions}
                appointments={appointments}
                patients={patients}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {currentRole === 'patient' && (
              <PatientPortal
                patient={patients.find(p => p.id === 'pat-1') || patients[0]}
                appointments={appointments}
                records={records}
                onCheckIn={(apptId) => handleUpdateAppointmentStatus(apptId, 'checked_in')}
              />
            )}
          </div>
        </div>

        {/* 
          FOOTER STATUS BAR (High density theme)
        */}
        <footer className="h-8 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between shrink-0 text-[10px] text-slate-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-semibold text-slate-600">Sistemas operantes</span>
            </div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline font-mono">Último Backup: há 14 min</span>
          </div>
          <div className="text-[9px] text-slate-400 font-semibold tracking-wider font-sans uppercase">
            PhysioFlow Enterprise v2.4.0 • Vital Reabilitação
          </div>
        </footer>
      </div>
    </div>
  );
}
