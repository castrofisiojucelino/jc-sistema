import React, { useState } from 'react';
import { Calendar, FileText, Plus, Check, Clock, Shield, Search, Printer, MessageSquare, Clipboard, UserCheck } from 'lucide-react';
import { Appointment, Patient, ClinicalRecord, ChatMessage } from '../types';
import InternalChat from './InternalChat';

interface PhysioDashboardProps {
  physioId: 'andre' | 'beatriz';
  physioName: string;
  crefito: string;
  patients: Patient[];
  appointments: Appointment[];
  records: ClinicalRecord[];
  chatMessages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserRoleName: string;
  onSendMessage: (content: string) => void;
  onAddClinicalRecord: (record: Omit<ClinicalRecord, 'id' | 'date' | 'physioId' | 'physioName' | 'signature'>) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
}

export default function PhysioDashboard({
  physioId,
  physioName,
  crefito,
  patients,
  appointments,
  records,
  chatMessages,
  currentUserId,
  currentUserName,
  currentUserRoleName,
  onSendMessage,
  onAddClinicalRecord,
  onUpdateAppointmentStatus
}: PhysioDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'records' | 'soap'>('schedule');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [searchHistoryTerm, setSearchHistoryTerm] = useState('');
  const [activeHistoryPatient, setActiveHistoryPatient] = useState<Patient | null>(null);

  // SOAP State
  const [soapData, setSoapData] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Filter schedules for THIS physio today
  const myAppointments = appointments
    .filter(a => a.physioId === physioId)
    .sort((a, b) => a.time.localeCompare(b.time));

  // Filter records related to this physio
  const myRecords = records.filter(r => r.physioId === physioId);

  // Filtered patients for general search
  const filteredHistoryPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchHistoryTerm.toLowerCase()) ||
    p.cpf.includes(searchHistoryTerm)
  );

  const startSoapForAppointment = (appt: Appointment) => {
    setSelectedAppointmentId(appt.id);
    setSelectedPatientId(appt.patientId);
    
    // Seed default template based on specialist to save time
    if (physioId === 'andre') {
      setSoapData({
        subjective: 'Paciente queixa-se de dor localizada na região afetada, intensidade /10. Refere rigidez matinal leve.',
        objective: 'Grau de mobilidade articular reduzido. Força muscular grau 4/5. Palpação revela espasmo e trigger points ativos.',
        assessment: 'Paciente evoluindo com bom prognóstico de reabilitação cinético-funcional.',
        plan: 'Cinesioterapia clássica, mobilização passiva, analgesia física e exercícios de estabilização articular.'
      });
    } else {
      setSoapData({
        subjective: 'Queixas posturais generalizadas, estresse e dores na coluna torácica / cervical secundárias a longos períodos sentado.',
        objective: 'Desvios posturais visíveis. Encurtamento de cadeia posterior. Padrão respiratório superficial.',
        assessment: 'Reabilitação postural progredindo bem. Melhora de consciência corporal e flexibilidade global.',
        plan: 'Pilates clínico no Reformer/Cadillac, exercícios de mobilidade de coluna, reeducação respiratória e RPG.'
      });
    }
    setActiveSubTab('soap');
  };

  const handleSaveSoap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Selecione um paciente!');
      return;
    }
    const patientObj = patients.find(p => p.id === selectedPatientId);
    if (!patientObj) return;

    onAddClinicalRecord({
      patientId: selectedPatientId,
      patientName: patientObj.name,
      subjective: soapData.subjective,
      objective: soapData.objective,
      assessment: soapData.assessment,
      plan: soapData.plan
    });

    // Mark current appointment as completed if it was started from the schedule
    if (selectedAppointmentId) {
      onUpdateAppointmentStatus(selectedAppointmentId, 'completed');
    }

    alert('Prontuário assinado eletronicamente e salvo com sucesso!');
    setSoapData({ subjective: '', objective: '', assessment: '', plan: '' });
    setSelectedPatientId('');
    setSelectedAppointmentId('');
    setActiveSubTab('schedule');
  };

  const printRecord = (rec: ClinicalRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const pat = patients.find(p => p.id === rec.patientId) || { name: rec.patientName, cpf: '', birthDate: '', covenant: '' };
    printWindow.document.write(`
      <html>
        <head>
          <title>Evolução Clínico - Fisioterapia</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; line-height: 1.5; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 22px; font-weight: bold; color: #1e293b; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #0d9488; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 8px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px; }
            .soap-title { font-weight: bold; font-size: 12px; margin-top: 10px; }
            .soap-text { background: #fdfdfd; padding: 8px; border-left: 3px solid #94a3b8; font-size: 12px; margin: 4px 0; }
            .signature { margin-top: 40px; border-top: 1px solid #94a3b8; padding-top: 8px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Evolução de Sessão de Fisioterapia</div>
            <div style="font-size: 12px; color: #64748b;">Clínica FisioFlow - Registro Médico Oficial</div>
          </div>
          <div class="grid">
            <div class="card">
              <strong>Paciente:</strong> ${pat.name}<br/>
              <strong>CPF:</strong> ${pat.cpf}<br/>
              <strong>Nascimento:</strong> ${pat.birthDate}
            </div>
            <div class="card">
              <strong>Fisioterapeuta:</strong> ${rec.physioName}<br/>
              <strong>Registro de Sessão:</strong> ${rec.date}<br/>
              <strong>Regime:</strong> ${pat.covenant}
            </div>
          </div>
          <div class="section">
            <div class="section-title">Anotações Clínicas (SOAP)</div>
            <div class="soap-title">S - Subjetivo</div><p class="soap-text">${rec.subjective}</p>
            <div class="soap-title">O - Objetivo</div><p class="soap-text">${rec.objective}</p>
            <div class="soap-title">A - Avaliação</div><p class="soap-text">${rec.assessment}</p>
            <div class="soap-title">P - Plano</div><p class="soap-text">${rec.plan}</p>
          </div>
          <div class="signature">
            Assinado Digitalmente por:<br/>
            <strong>${rec.signature}</strong>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="physio-dashboard">
      {/* Primary Workspace */}
      <div className="xl:col-span-8 space-y-6">
        {/* Navigation Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 shadow-sm shrink-0">
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'schedule' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="physiosubtab-schedule"
          >
            <Calendar className="w-4 h-4 inline-block mr-1.5" />
            Minha Agenda Hoje
          </button>
          <button
            onClick={() => setActiveSubTab('records')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'records' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="physiosubtab-records"
          >
            <Clipboard className="w-4 h-4 inline-block mr-1.5" />
            Histórico e Prontuários
          </button>
          <button
            onClick={() => { setSelectedPatientId(''); setSelectedAppointmentId(''); setActiveSubTab('soap'); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
              activeSubTab === 'soap' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
            id="physiosubtab-soap"
          >
            <Plus className="w-4 h-4 inline-block mr-1.5" />
            Registrar Nova Sessão (SOAP)
          </button>
        </div>

        {/* Schedule SubTab */}
        {activeSubTab === 'schedule' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Seus Pacientes do Dia</h2>
              <p className="text-xs text-slate-500">Acompanhe suas consultas agendadas, confirme presenças e elabore o prontuário SOAP.</p>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
              {myAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center bg-slate-50/50">Nenhuma consulta agendada para hoje.</p>
              ) : (
                myAppointments.map((appt) => (
                  <div key={appt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors" id={`phy-appt-${appt.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg shrink-0 font-mono text-xs font-bold text-center">
                        <Clock className="w-3.5 h-3.5 mx-auto text-teal-600 mb-0.5" />
                        <span>{appt.time}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800">{appt.patientName}</p>
                          {appt.status === 'checked_in' && (
                            <span className="bg-rose-100 text-rose-800 text-[9px] px-1.5 py-0.2 rounded font-bold animate-pulse flex items-center gap-0.5">
                              <UserCheck className="w-2.5 h-2.5" /> Na Recepção
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">Convênio: {appt.covenant} {appt.notes ? `| Obs: ${appt.notes}` : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-11 sm:pl-0">
                      {appt.status === 'completed' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                          ✓ Prontuário Salvo
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          {appt.status !== 'checked_in' && (
                            <button
                              onClick={() => onUpdateAppointmentStatus(appt.id, 'checked_in')}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg cursor-pointer"
                            >
                              Presente
                            </button>
                          )}
                          <button
                            onClick={() => startSoapForAppointment(appt)}
                            className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                            id={`start-soap-${appt.id}`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Registrar Sessão
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* History / Records SubTab */}
        {activeSubTab === 'records' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Busca Geral de Prontuários</h2>
              <p className="text-xs text-slate-500">Acesse a ficha e o histórico completo de evoluções de qualquer paciente da clínica.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Patient List column */}
              <div className="md:col-span-5 space-y-3 border-r border-slate-100 pr-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar paciente..."
                    value={searchHistoryTerm}
                    onChange={(e) => setSearchHistoryTerm(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                  {filteredHistoryPatients.map(pat => (
                    <div
                      key={pat.id}
                      onClick={() => setActiveHistoryPatient(pat)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        activeHistoryPatient?.id === pat.id
                          ? 'border-teal-500 bg-teal-50/20 font-bold text-teal-900'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                      id={`history-pat-list-${pat.id}`}
                    >
                      {pat.name}
                      <p className="text-[9px] text-slate-400 font-mono font-normal">CPF: {pat.cpf}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Records Timeline Column */}
              <div className="md:col-span-7 space-y-4">
                {activeHistoryPatient ? (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <h4 className="font-bold text-slate-800">Ficha: {activeHistoryPatient.name}</h4>
                      <p className="text-slate-500">Convênio: {activeHistoryPatient.covenant} | Nascimento: {activeHistoryPatient.birthDate.split('-').reverse().join('/')}</p>
                      <p className="text-slate-500">Telefone: {activeHistoryPatient.phone} | CPF: {activeHistoryPatient.cpf}</p>
                    </div>

                    <h4 className="font-semibold text-xs text-slate-700">Histórico de Sessões Gravadas:</h4>
                    
                    <div className="space-y-3 max-h-[220px] overflow-y-auto">
                      {records.filter(r => r.patientId === activeHistoryPatient.id).length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 italic text-center">Nenhum prontuário SOAP assinado ainda.</p>
                      ) : (
                        records
                          .filter(r => r.patientId === activeHistoryPatient.id)
                          .map(rec => (
                            <div key={rec.id} className="p-3 border border-slate-200 rounded-xl space-y-2 bg-white" id={`hist-rec-${rec.id}`}>
                              <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                                <span className="text-[10px] font-mono font-bold text-teal-700">{rec.date}</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => printRecord(rec)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-teal-600 cursor-pointer"
                                    title="Imprimir / Exportar PDF"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-600 italic">"{rec.subjective.substring(0, 80)}..."</p>
                              <p className="text-[9px] text-right font-mono font-semibold text-slate-400 italic">Assinado: {rec.signature}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                    <Search className="w-10 h-10 mb-2.5 text-slate-300" />
                    <p className="text-xs">Selecione um paciente na lista ao lado para ver o histórico de prontuários.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SOAP Form SubTab */}
        {activeSubTab === 'soap' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Evolução de Sessão de Fisioterapia (Método SOAP)
            </h2>

            <form onSubmit={handleSaveSoap} className="space-y-4" id="soap-clinical-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Paciente Alvo</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    required
                    disabled={!!selectedAppointmentId} // lock if derived from schedule
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                    id="soap-patient-select"
                  >
                    <option value="">-- Selecione o paciente da evolução --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.cpf})</option>
                    ))}
                  </select>
                </div>

                <div className="text-left md:text-right pt-4 md:pt-0">
                  <p className="text-xs text-slate-500">Profissional:</p>
                  <p className="text-xs font-bold text-slate-800">{physioName}</p>
                  <p className="text-[10px] text-slate-400 font-mono font-bold">Registro: {crefito}</p>
                </div>
              </div>

              {/* SOAP Sheets */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    S - Subjetivo (Queixas e histórico relatados pelo paciente)
                  </label>
                  <textarea
                    required
                    value={soapData.subjective}
                    onChange={(e) => setSoapData(prev => ({ ...prev, subjective: e.target.value }))}
                    rows={2}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                    placeholder="Ex: Paciente refere dores na região lombar ao levantar da cadeira..."
                    id="soap-s"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    O - Objetivo (Testes funcionais, exames, amplitude de movimento, palpação)
                  </label>
                  <textarea
                    required
                    value={soapData.objective}
                    onChange={(e) => setSoapData(prev => ({ ...prev, objective: e.target.value }))}
                    rows={2}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                    placeholder="Ex: Amplitude de movimento reduzida para flexão de tronco..."
                    id="soap-o"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    A - Avaliação (Evolução clínica geral, resposta ao tratamento e diagnóstico)
                  </label>
                  <textarea
                    required
                    value={soapData.assessment}
                    onChange={(e) => setSoapData(prev => ({ ...prev, assessment: e.target.value }))}
                    rows={2}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                    placeholder="Ex: Melhora significativa na estabilidade lombopélvica comparada com a última semana..."
                    id="soap-a"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    P - Plano de Conduta (Exercícios aplicados, alongamentos, conduta para as próximas sessões)
                  </label>
                  <textarea
                    required
                    value={soapData.plan}
                    onChange={(e) => setSoapData(prev => ({ ...prev, plan: e.target.value }))}
                    rows={2}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
                    placeholder="Ex: Exercícios de estabilização segmentar com bola, Maitland L4-L5, orientações..."
                    id="soap-p"
                  />
                </div>
              </div>

              {/* Signature Checkbox */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <span className="p-1 bg-emerald-100 text-emerald-700 rounded mt-0.5">
                  <Shield className="w-4.5 h-4.5" />
                </span>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Termo de Assinatura Eletrônica</p>
                  <p className="text-[10px] text-emerald-700 leading-relaxed">
                    Ao salvar, este prontuário será criptografado e carimbado com sua assinatura profissional certificada pelo conselho regional: <strong>{crefito}</strong>.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
                id="soap-submit-btn"
              >
                Assinar e Concluir Evolução Clínica
              </button>
            </form>
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
    </div>
  );
}
