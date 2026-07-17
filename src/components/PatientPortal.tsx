import React, { useState } from 'react';
import { FileText, Calendar, Clock, QrCode, Shield, CheckCircle2, Award, Printer, ArrowRight, Download } from 'lucide-react';
import { Appointment, ClinicalRecord, Patient } from '../types';

interface PatientPortalProps {
  patient: Patient;
  appointments: Appointment[];
  records: ClinicalRecord[];
  onCheckIn: (appointmentId: string) => void;
}

export default function PatientPortal({
  patient,
  appointments,
  records,
  onCheckIn
}: PatientPortalProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'records' | 'checkin'>('sessions');
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Filter schedules and records for current patient
  const myAppointments = appointments
    .filter(a => a.patientId === patient.id)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

  const myRecords = records.filter(r => r.patientId === patient.id);

  // Check if there is an appointment today that is eligible for check-in
  const todayAppointment = appointments.find(
    a => a.patientId === patient.id && a.date === '2026-07-13' && (a.status === 'confirmed' || a.status === 'pending')
  );

  const handleSimulateQRCheckIn = () => {
    if (!todayAppointment) return;
    setCheckingIn(true);
    setTimeout(() => {
      onCheckIn(todayAppointment.id);
      setCheckingIn(false);
      setCheckInSuccess(true);
    }, 1500);
  };

  const exportRecordToPDF = (rec: ClinicalRecord) => {
    // Beautiful client-side print view
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Prontuário Clínico - FisioFlow</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0d9488; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #f1f5f9; padding: 15px; rounded: 8px; }
            .soap-title { font-weight: bold; font-size: 13px; color: #1e293b; margin-top: 15px; margin-bottom: 5px; }
            .soap-text { font-size: 13px; background: #fafafa; padding: 10px; border-left: 3px solid #cbd5e1; margin: 0; }
            .signature { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 10px; font-style: italic; text-align: center; font-size: 13px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Clínica FisioFlow - Prontuário de Fisioterapia</div>
            <div class="subtitle">Laudo e Evolução Clínica de Reabilitação</div>
          </div>
          
          <div class="grid">
            <div class="card">
              <strong>PACIENTE:</strong> ${patient.name}<br/>
              <strong>CPF:</strong> ${patient.cpf}<br/>
              <strong>Data de Nascimento:</strong> ${patient.birthDate.split('-').reverse().join('/')}
            </div>
            <div class="card">
              <strong>FISIOTERAPEUTA:</strong> ${rec.physioName}<br/>
              <strong>Data da Sessão:</strong> ${rec.date}<br/>
              <strong>Convênio:</strong> ${patient.covenant}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Registro de Evolução Clínica (SOAP)</div>
            
            <div class="soap-title">Subjetivo (S)</div>
            <p class="soap-text">${rec.subjective}</p>
            
            <div class="soap-title">Objetivo (O)</div>
            <p class="soap-text">${rec.objective}</p>
            
            <div class="soap-title">Avaliação (A)</div>
            <p class="soap-text">${rec.assessment}</p>
            
            <div class="soap-title">Plano de Conduta (P)</div>
            <p class="soap-text">${rec.plan}</p>
          </div>

          <div class="signature">
            Assinado eletronicamente por:<br/>
            <strong>${rec.signature}</strong>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #0d9488; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Imprimir / Salvar em PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="patient-portal">
      {/* Patient welcome card */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-teal-500/30 border border-teal-500/40 text-teal-200 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
            Portal do Paciente
          </span>
          <h1 className="text-2xl font-bold mt-2">Olá, {patient.name}!</h1>
          <p className="text-xs text-teal-100/80 mt-1">Acompanhe seu progresso clínico, histórico de consultas e faça seu check-in.</p>
        </div>
        <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex items-center gap-3">
          <Award className="w-8 h-8 text-teal-300" />
          <div className="text-left">
            <p className="text-[10px] text-teal-200 font-semibold uppercase">Tratamento Ativo</p>
            <p className="text-xs font-bold">{patient.covenant} - Lâmina Ativa</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('sessions'); setSelectedRecord(null); }}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sessions' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-patient-sessions"
        >
          Minhas Consultas
        </button>
        <button
          onClick={() => { setActiveTab('records'); setSelectedRecord(null); }}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'records' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          id="tab-patient-records"
        >
          Prontuários e Histórico
        </button>
        {todayAppointment && (
          <button
            onClick={() => { setActiveTab('checkin'); setSelectedRecord(null); }}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checkin' ? 'border-teal-600 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
            id="tab-patient-checkin"
          >
            <QrCode className="w-4 h-4 text-rose-500 animate-pulse" />
            Check-In Presença (Hoje)
          </button>
        )}
      </div>

      {/* Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {activeTab === 'sessions' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Histórico de Agendamentos
              </h2>

              <div className="divide-y divide-slate-100">
                {myAppointments.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Nenhum agendamento encontrado.</p>
                ) : (
                  myAppointments.map((appt) => (
                    <div key={appt.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0" id={`pat-appt-${appt.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-slate-100 rounded-lg text-slate-600 shrink-0 mt-1">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{appt.physioName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {appt.date.split('-').reverse().join('/')} às {appt.time}
                          </p>
                          {appt.notes && <p className="text-[11px] text-slate-400 mt-1">Obs: {appt.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:self-center self-start pl-11 sm:pl-0">
                        {appt.status === 'completed' && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            Sessão Realizada
                          </span>
                        )}
                        {appt.status === 'confirmed' && (
                          <span className="bg-sky-100 text-sky-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            Confirmada
                          </span>
                        )}
                        {appt.status === 'checked_in' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            Presente na Recepção
                          </span>
                        )}
                        {appt.status === 'pending' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            Aguardando Confirmação
                          </span>
                        )}
                        {appt.status === 'cancelled' && (
                          <span className="bg-rose-100 text-rose-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
                            Cancelada
                          </span>
                        )}

                        {appt.googleSynced && (
                          <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-semibold" title="Sincronizado com Google Calendar">
                            GCal Sync
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Prontuários e Evoluções de Fisioterapia
                </h2>

                {myRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">Nenhum prontuário liberado ainda.</p>
                ) : (
                  <div className="space-y-3">
                    {myRecords.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRecord(rec)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          selectedRecord?.id === rec.id
                            ? 'border-teal-500 bg-teal-50/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        id={`record-card-${rec.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Evolução de Sessão - {rec.physioName}</p>
                            <p className="text-[10px] text-slate-500 font-mono">Assinado em {rec.date}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedRecord && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4" id="record-detail-panel">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Prontuário Médico Detalhado</h3>
                      <p className="text-[10px] text-slate-500 font-mono">ID Registro: {selectedRecord.id}</p>
                    </div>
                    <button
                      onClick={() => exportRecordToPDF(selectedRecord)}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs px-3 py-1.5 rounded-lg border border-teal-200/50 flex items-center gap-1.5 font-semibold cursor-pointer"
                      id="export-pdf-record"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Exportar PDF / Imprimir
                    </button>
                  </div>

                  {/* SOAP fields */}
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-slate-300">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">S - Subjetivo (Relato do Paciente)</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedRecord.subjective}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-slate-300">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">O - Objetivo (Avaliação Física)</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedRecord.objective}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-slate-300">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">A - Avaliação e Evolução Clínica</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedRecord.assessment}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-slate-300">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">P - Plano de Conduta e Exercícios</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedRecord.plan}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-[9px] text-slate-400 uppercase font-semibold">Garantia de Autenticidade</p>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Assinado Digitalmente
                      </p>
                    </div>
                    <div className="text-right text-[10px] font-semibold text-slate-500 font-mono italic">
                      {selectedRecord.signature}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checkin' && todayAppointment && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center space-y-6" id="qr-checkin-tab">
              <div className="max-w-md mx-auto space-y-4">
                <span className="bg-rose-100 text-rose-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  Check-In por QR Code Presencial
                </span>
                <h3 className="text-lg font-bold text-slate-800">Chegou para a sua consulta?</h3>
                <p className="text-xs text-slate-600">
                  Para confirmar sua presença automaticamente na recepção da clínica, simule a leitura do QR Code exibido na bancada da secretária ou abaixo.
                </p>

                {/* Simulated Scanner Graphic */}
                <div className="relative border-2 border-dashed border-teal-300 p-6 rounded-2xl bg-slate-50 inline-block w-48 h-48">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-600"></div>
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-600"></div>
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-600"></div>
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-600"></div>

                  <div className="flex flex-col items-center justify-center h-full w-full">
                    {checkingIn ? (
                      <div className="space-y-2">
                        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] font-mono text-teal-700">Lendo código...</p>
                      </div>
                    ) : checkInSuccess || todayAppointment.status === 'checked_in' ? (
                      <div className="text-emerald-600 space-y-1">
                        <CheckCircle2 className="w-12 h-12 mx-auto" />
                        <p className="text-xs font-bold">Presente Confirmado!</p>
                      </div>
                    ) : (
                      <div className="text-slate-400 space-y-1.5 cursor-pointer" onClick={handleSimulateQRCheckIn}>
                        <QrCode className="w-16 h-16 mx-auto text-slate-700 hover:scale-105 transition-transform" />
                        <p className="text-[9px] font-semibold text-teal-600 hover:underline">Simular Leitura</p>
                      </div>
                    )}
                  </div>
                </div>

                {!checkInSuccess && todayAppointment.status !== 'checked_in' && (
                  <div>
                    <button
                      onClick={handleSimulateQRCheckIn}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow transition-all"
                      id="simulate-qr-btn"
                    >
                      Simular Leitura de QR Code Recepção
                    </button>
                    <p className="text-[10px] text-slate-400 mt-2">Sua consulta de hoje está agendada para às {todayAppointment.time} com {todayAppointment.physioName}.</p>
                  </div>
                )}

                {(checkInSuccess || todayAppointment.status === 'checked_in') && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-left text-xs text-emerald-800 space-y-1">
                    <p className="font-bold">✓ Presença Confirmada no Painel da Recepção!</p>
                    <p className="text-[11px] text-emerald-700">A secretária e seu fisioterapeuta receberam um alerta push urgente de que você chegou.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Informational Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Orientações Gerais</h3>
            <div className="space-y-3.5">
              <div className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Chegue com 10 min de antecedência</strong> para realizar seu check-in e se alongar se necessário.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Vista roupas confortáveis</strong> que permitam amplitude de movimento e facilitem o acesso à área tratada.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Cancele com no mínimo 2 horas</strong> de antecedência pelo canal direto para liberar o horário para outros pacientes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-100 p-5 rounded-xl text-left space-y-2">
            <h4 className="font-bold text-teal-900 text-xs">Precisa de Suporte?</h4>
            <p className="text-[11px] text-teal-700 leading-relaxed">
              Deseja alterar seu horário ou tirar dúvidas sobre sua cobertura? Fale diretamente com nossa secretária Sandra pelo canal de atendimento.
            </p>
            <div className="pt-1.5 font-mono text-xs text-teal-800 font-bold">
              WhatsApp: (11) 98765-4321
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
