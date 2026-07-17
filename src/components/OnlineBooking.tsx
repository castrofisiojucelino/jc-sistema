import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle2, ChevronRight, Share2, Shield, Send } from 'lucide-react';
import { Appointment, Patient, WhatsAppLog } from '../types';

interface OnlineBookingProps {
  patients: Patient[];
  appointments: Appointment[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Patient;
  onSendWhatsApp?: (recipientName: string, phone: string, message: string, type: WhatsAppLog['type']) => void;
}

export default function OnlineBooking({
  patients,
  appointments,
  onAddAppointment,
  onAddPatient,
  onSendWhatsApp
}: OnlineBookingProps) {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    covenant: 'Particular',
    physioId: 'andre' as 'andre' | 'beatriz',
    date: '2026-07-14',
    time: '10:00',
    googleSynced: true,
    notes: ''
  });

  const [bookingCompleted, setBookingCompleted] = useState<(Appointment & { phone: string }) | null>(null);

  // Free APIs settings (Google Calendar & WhatsApp)
  const [clinicPhone, setClinicPhone] = useState(() => localStorage.getItem('clinic_whatsapp') || '(11) 98765-4321');
  const [patientPhone, setPatientPhone] = useState('');

  const physios = {
    andre: { name: 'Dr. André Silva', specialty: 'Traumatologia, Ortopedia e Quiropraxia' },
    beatriz: { name: 'Dra. Beatriz Costa', specialty: 'Pilates Clínico, RPG e Reabilitação Esportiva' }
  };

  const allTimes = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const bookedTimesForSelected = appointments
    ? appointments
        .filter(appt => appt.date === formData.date && appt.physioId === formData.physioId && appt.status !== 'cancelled')
        .map(appt => appt.time)
    : [];

  // Auto-adjust time if current selected is already booked
  React.useEffect(() => {
    if (bookedTimesForSelected.includes(formData.time)) {
      const firstAvailable = allTimes.find(t => !bookedTimesForSelected.includes(t));
      if (firstAvailable) {
        setFormData(prev => ({ ...prev, time: firstAvailable }));
      }
    }
  }, [formData.date, formData.physioId, appointments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.cpf) {
      alert('Por favor, preencha todos os campos obrigatórios (Nome, CPF e Telefone).');
      return;
    }

    // Check if patient already exists by CPF, otherwise register them
    const normalizedCpf = formData.cpf.trim();
    let patient = patients.find(p => p.cpf === normalizedCpf);

    if (!patient) {
      patient = onAddPatient({
        name: formData.name,
        cpf: normalizedCpf,
        phone: formData.phone,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@exemplo.com`,
        covenant: formData.covenant,
        birthDate: '1990-01-01',
        active: true
      });
    }

    const newAppt: Omit<Appointment, 'id'> = {
      patientId: patient.id,
      patientName: patient.name,
      physioId: formData.physioId,
      physioName: physios[formData.physioId].name,
      date: formData.date,
      time: formData.time,
      status: 'pending', // Public bookings start as pending confirmation by default
      covenant: formData.covenant,
      cost: formData.physioId === 'andre' ? 150 : 200,
      googleSynced: formData.googleSynced,
      notes: formData.notes
    };

    // Create a temporary ID to display confirmation
    const savedAppt = {
      ...newAppt,
      id: `app-temp-${Date.now()}`,
      phone: formData.phone
    } as Appointment & { phone: string };

    onAddAppointment(newAppt);
    if (onSendWhatsApp) {
      const msg = `Olá! Nova solicitação de consulta de Fisioterapia recebida pelo portal de agendamento online para o dia ${formData.date.split('-').reverse().join('/')} às ${formData.time} com ${physios[formData.physioId].name}.`;
      onSendWhatsApp(patient.name, formData.phone, msg, 'confirmation');
    }
    
    setBookingCompleted(savedAppt);
    setPatientPhone(formData.phone);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cpf: '',
      phone: '',
      email: '',
      covenant: 'Particular',
      physioId: 'andre',
      date: '2026-07-14',
      time: '10:00',
      googleSynced: true,
      notes: ''
    });
    setBookingCompleted(null);
  };

  if (bookingCompleted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center" id="booking-success-view">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Solicitação Pré-Reservada!</h2>
        <p className="text-slate-600 text-xs mb-6">
          Seu agendamento foi registrado no sistema. Para garantir a sua vaga sem custo algum para a clínica, confirme por WhatsApp nos botões gratuitos abaixo!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
          {/* Card Detalhes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left space-y-3">
            <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide border-b border-slate-200 pb-1.5">Resumo da Consulta</h3>
            <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Paciente:</span>
              <span className="text-slate-900 font-semibold">{bookingCompleted.patientName}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Profissional:</span>
              <span className="text-slate-900 font-semibold">{bookingCompleted.physioName}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Especialidade:</span>
              <span className="text-slate-900">{physios[bookingCompleted.physioId].specialty}</span>
            </div>
            <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">Data e Hora:</span>
              <span className="text-slate-900 font-mono font-bold">
                {bookingCompleted.date.split('-').reverse().join('/')} às {bookingCompleted.time}
              </span>
            </div>
            <div className="flex justify-between text-xs pb-1">
              <span className="text-slate-500 font-medium">Modalidade:</span>
              <span className="text-slate-900 font-medium">
                {bookingCompleted.covenant === 'Particular' ? 'Particular' : `Convênio (${bookingCompleted.covenant})`}
              </span>
            </div>
          </div>

          {/* Card Google Calendar */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wide border-b border-blue-100 pb-1.5 mb-2">
                <span className="bg-blue-600 text-white rounded px-1 text-[10px] font-mono font-bold">GCal</span>
                Sincronização de Agenda
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Este agendamento foi programado para sincronização com a agenda da clínica.
              </p>
              <p className="text-[10px] text-blue-600/85 mt-1.5 leading-relaxed">
                Se você for o administrador da clínica, lembre-se de compartilhar sua agenda Google com o e-mail verde de nossa Conta de Serviço no painel <strong>APIs Gratuitas</strong> para registrar novos horários automaticamente!
              </p>
            </div>
            <div className="pt-3">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(
                    `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Fisioterapia com ${bookingCompleted.physioName}\nDTSTART:20260714T100000\nDESCRIPTION:Consulta na Clínica FisioFlow\nEND:VEVENT\nEND:VCALENDAR`
                  );
                  link.download = 'fisioterapia-consulta.ics';
                  link.click();
                }}
                className="w-full py-1.5 bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 font-bold text-[10px] rounded shadow-3xs cursor-pointer transition-colors flex items-center justify-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                Baixar Convite (ICS)
              </button>
            </div>
          </div>
        </div>

        {/* DUPLO DISPARO WHATSAPP (100% GRATUITO) */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-left space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
              <Phone className="w-4 h-4 animate-pulse text-emerald-600" />
            </span>
            <div>
              <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">🔔 Confirmação Ativa por WhatsApp (Grátis)</h3>
              <p className="text-[11px] text-emerald-800 leading-tight">Escolha as opções abaixo para disparar as mensagens oficiais de confirmação sem custos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* BUTTON FOR CLINIC */}
            <div className="bg-white border border-emerald-100/85 p-3.5 rounded-xl flex flex-col justify-between space-y-2.5 shadow-3xs">
              <div>
                <span className="text-[9px] bg-teal-50 text-teal-800 font-extrabold uppercase px-1.5 py-0.5 rounded">Opção A</span>
                <p className="text-xs font-bold text-slate-800 mt-1">Confirmar com a Clínica</p>
                <p className="text-[10px] text-slate-500 mt-1">Envia os dados do agendamento para o WhatsApp oficial da recepção da clínica para efetivar sua vaga.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">WhatsApp da Clínica</label>
                <input 
                  type="text" 
                  value={clinicPhone} 
                  onChange={(e) => {
                    setClinicPhone(e.target.value);
                    localStorage.setItem('clinic_whatsapp', e.target.value);
                  }}
                  placeholder="Ex: (11) 98765-4321" 
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                />
              </div>

              <a
                href={`https://wa.me/${clinicPhone.replace(/\D/g, '') || '5511987654321'}?text=${encodeURIComponent(
                  `Olá! Acabei de solicitar um agendamento online de Fisioterapia no portal:\n\n*Paciente:* ${bookingCompleted.patientName}\n*Celular:* ${bookingCompleted.phone}\n*Fisioterapeuta:* ${bookingCompleted.physioName}\n*Data/Hora:* ${bookingCompleted.date.split('-').reverse().join('/')} às ${bookingCompleted.time}\n*Plano:* ${bookingCompleted.covenant}\n*Queixa:* ${bookingCompleted.notes || 'Nenhuma'}\n\nPor favor, confirmem meu horário!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar para Clínica
              </a>
            </div>

            {/* BUTTON FOR PATIENT */}
            <div className="bg-white border border-emerald-100/85 p-3.5 rounded-xl flex flex-col justify-between space-y-2.5 shadow-3xs">
              <div>
                <span className="text-[9px] bg-teal-50 text-teal-800 font-extrabold uppercase px-1.5 py-0.5 rounded">Opção B</span>
                <p className="text-xs font-bold text-slate-800 mt-1">Salvar no seu WhatsApp</p>
                <p className="text-[10px] text-slate-500 mt-1">Envia o comprovante detalhado do horário reservado direto para você guardar no seu histórico.</p>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Seu WhatsApp (Paciente)</label>
                <input 
                  type="text" 
                  value={patientPhone} 
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Ex: (11) 99999-9999" 
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 font-mono focus:outline-none"
                />
              </div>

              <a
                href={`https://wa.me/${patientPhone.replace(/\D/g, '') || '5511999999999'}?text=${encodeURIComponent(
                  `*PhysioFlow - Solicitação de Agendamento Online*\n\nOlá ${bookingCompleted.patientName}! Seu agendamento de Fisioterapia foi solicitado com sucesso:\n\n📅 *Data:* ${bookingCompleted.date.split('-').reverse().join('/')} às ${bookingCompleted.time}\n🩺 *Profissional:* ${bookingCompleted.physioName}\n🏥 *Clínica:* PhysioFlow - Unidade Paulista\n📍 *Endereço:* Av. Paulista, 1000 - Cj 42 - São Paulo/SP\n\n_Sua solicitação está pendente de confirmação pela recepção da clínica._`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg text-center flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar para Mim (Paciente)
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetForm}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200 cursor-pointer"
            id="book-another-btn"
          >
            Novo Agendamento Online
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8" id="online-booking-portal">
      {/* Intro Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-2xl border border-teal-100">
          <span className="bg-teal-100 text-teal-800 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
            Portal de Agendamento Online
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-3 leading-tight">
            Agende sua consulta de fisioterapia em segundos
          </h1>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Escolha seu especialista, selecione a melhor data e receba os lembretes automáticos diretamente no seu WhatsApp. Prático, seguro e sem filas.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <span className="p-1.5 bg-teal-600/10 rounded-lg text-teal-700 mt-0.5">
                <User className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Equipe de Especialistas</p>
                <p className="text-[11px] text-slate-500">Dr. André (Ortopedia/Trauma) e Dra. Beatriz (Pilates/RPG).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-1.5 bg-teal-600/10 rounded-lg text-teal-700 mt-0.5">
                <Phone className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Lembretes por WhatsApp</p>
                <p className="text-[11px] text-slate-500">Notificações automáticas de confirmação de horários.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="p-1.5 bg-teal-600/10 rounded-lg text-teal-700 mt-0.5">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-800">Sincronização de Agenda</p>
                <p className="text-[11px] text-slate-500">Integração opcional com sua conta do Google Calendar.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Convênios Médicos Aceitos</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Atendemos particular e pelos principais planos: Unimed, Amil, Bradesco Saúde, SulAmérica e Cassi.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Unimed', 'Amil', 'Bradesco', 'SulAmérica', 'Cassi'].map((ins) => (
              <span key={ins} className="bg-white border border-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                {ins}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form Column */}
      <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4" id="booking-form">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Dados Cadastrais</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ex: João da Silva"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                id="booking-name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                required
                placeholder="Ex: 123.456.789-00"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                id="booking-cpf"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Celular / WhatsApp *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Ex: (11) 99999-9999"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                id="booking-phone"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">E-mail (Opcional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ex: joao@email.com"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
                id="booking-email"
              />
            </div>
          </div>

          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pt-3 pb-3">Agendamento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fisioterapeuta</label>
              <select
                name="physioId"
                value={formData.physioId}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50 cursor-pointer"
                id="booking-physio"
              >
                <option value="andre">Dr. André Silva (Ortopedia)</option>
                <option value="beatriz">Dra. Beatriz Costa (Pilates/RPG)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plano / Convênio</label>
              <select
                name="covenant"
                value={formData.covenant}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50 cursor-pointer"
                id="booking-covenant"
              >
                <option value="Particular">Particular</option>
                <option value="Unimed">Unimed</option>
                <option value="Amil">Amil</option>
                <option value="Bradesco Saúde">Bradesco Saúde</option>
                <option value="SulAmérica">SulAmérica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data Desejada</label>
              <input
                type="date"
                name="date"
                min="2026-07-13"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50 cursor-pointer"
                id="booking-date"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Horário Disponível</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50 cursor-pointer font-semibold"
                id="booking-time"
              >
                {allTimes.map((t) => {
                  const isBooked = bookedTimesForSelected.includes(t);
                  return (
                    <option key={t} value={t} disabled={isBooked}>
                      {t} {isBooked ? '🔴 (Horário Ocupado)' : '🟢 (Horário Livre)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observações ou Principais Queixas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Descreva brevemente sua dor ou queixa para ajudar o profissional..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
              id="booking-notes"
            />
          </div>

          {/* Sync Option */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="googleSynced"
                checked={formData.googleSynced}
                onChange={handleCheckboxChange}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 accent-teal-600 cursor-pointer"
                id="booking-google-sync"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800">Sincronizar com Google Calendar</span>
                <p className="text-[10px] text-slate-500">Adiciona este compromisso diretamente à sua conta Google após confirmação.</p>
              </div>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md mt-4 cursor-pointer flex items-center justify-center gap-1.5"
            id="booking-submit-btn"
          >
            Solicitar Consulta Online
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
