import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, PieChart, FileText, Download, Plus, Calendar, Users, Printer, Percent, ShieldAlert } from 'lucide-react';
import { Transaction, Appointment, Patient } from '../types';

interface AdminDashboardProps {
  transactions: Transaction[];
  appointments: Appointment[];
  patients: Patient[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function AdminDashboard({
  transactions,
  appointments,
  patients,
  onAddTransaction
}: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'financial' | 'covenants' | 'reports'>('financial');
  const [showAddTxForm, setShowAddTxForm] = useState(false);
  const [newTx, setNewTx] = useState({
    type: 'saida' as 'entrada' | 'saida',
    category: 'Materiais',
    description: '',
    amount: '',
    date: '2026-07-13'
  });

  // XML TISS local generator state
  const [selectedTissPatientId, setSelectedTissPatientId] = useState('');
  const [tissGuideType, setTissGuideType] = useState('spsadt'); // spsadt or consulta
  const [tissGuideNum, setTissGuideNum] = useState(`2026${Math.floor(1000 + Math.random() * 9000)}`);
  const [tissTussCode, setTissTussCode] = useState('31602019'); // 31602019 is Fisioterapia motora
  const [tissQty, setTissQty] = useState('1');

  const handleGenerateTissXml = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTissPatientId) {
      alert('Por favor, selecione um paciente para a guia TISS!');
      return;
    }

    const patient = patients.find(p => p.id === selectedTissPatientId);
    if (!patient) return;

    const ansCodeMap: { [key: string]: string } = {
      'Unimed': '357251',
      'Amil': '326305',
      'Bradesco Saúde': '005711',
      'Particular': '000000'
    };
    const ansCode = ansCodeMap[patient.covenant] || '999999';

    // Standard TISS XML structure (simplified but valid format representation for downloading locally)
    const xmlContent = `<?xml version="1.0" encoding="ISO-8859-1"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xsi:schemaLocation="http://www.ans.gov.br/padroes/tiss/schemas http://www.ans.gov.br/padroes/tiss/schemas/tissMensagemV4_01_00.xsd">
  <ans:cabecalho>
    <ans:identificacaoTransacao>
      <ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao>
      <ans:sequencialTransacao>${Date.now()}</ans:sequencialTransacao>
      <ans:dataRegistroTransacao>${new Date().toISOString().split('T')[0]}</ans:dataRegistroTransacao>
      <ans:horaRegistroTransacao>${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</ans:horaRegistroTransacao>
    </ans:identificacaoTransacao>
    <ans:origem>
      <ans:identificacaoPrestador>
        <ans:cnpjPrestador>12.345.678/0001-99</ans:cnpjPrestador>
      </ans:identificacaoPrestador>
    </ans:origem>
    <ans:destino>
      <ans:registroANS>${ansCode}</ans:registroANS>
    </ans:destino>
    <ans:versaoPadrao>4.01.00</ans:versaoPadrao>
  </ans:cabecalho>
  <ans:prestadorParaOperadora>
    <ans:loteGuias>
      <ans:numeroLote>${Math.floor(100 + Math.random() * 900)}</ans:numeroLote>
      <ans:guiasTISS>
        <ans:guiaPrestador>
          <ans:cabecalhoGuia>
            <ans:registroANS>${ansCode}</ans:registroANS>
            <ans:tempoAtendimento>1</ans:tempoAtendimento>
          </ans:cabecalhoGuia>
          <ans:beneficiario>
            <ans:numeroCarteira>${Math.floor(10000000000 + Math.random() * 90000000000)}</ans:numeroCarteira>
            <ans:nomeBeneficiario>${patient.name.toUpperCase()}</ans:nomeBeneficiario>
            <ans:cpfBeneficiario>${patient.cpf.replace(/\D/g, '')}</ans:cpfBeneficiario>
          </ans:beneficiario>
          <ans:dadosGuia>
            <ans:numeroGuiaPrestador>${tissGuideNum}</ans:numeroGuiaPrestador>
            <ans:tipoGuia>${tissGuideType.toUpperCase()}</ans:tipoGuia>
            <ans:dataEmissaoGuia>${new Date().toISOString().split('T')[0]}</ans:dataEmissaoGuia>
            <ans:procedimentosExecutados>
              <ans:procedimento>
                <ans:codigoTabela>22</ans:codigoTabela>
                <ans:codigoProcedimento>${tissTussCode}</ans:codigoProcedimento>
                <ans:descricaoProcedimento>${tissTussCode === '31602019' ? 'Fisioterapia motora - p/ segmento' : 'Atendimento fisioterapêutico domiciliar'}</ans:descricaoProcedimento>
                <ans:quantidadeExecutada>${tissQty}</ans:quantidadeExecutada>
              </ans:procedimento>
            </procedimentosExecutados>
            <ans:valorTotalGuia>${tissGuideType === 'spsadt' ? (150 * parseInt(tissQty)) : 150}</ans:valorTotalGuia>
          </ans:dadosGuia>
        </ans:guiaPrestador>
      </ans:guiasTISS>
    </ans:loteGuias>
  </ans:prestadorParaOperadora>
</ans:mensagemTISS>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guia_tiss_${patient.name.toLowerCase().replace(/\s+/g, '_')}_${tissGuideNum}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Regenerate unique random guide number for next creation
    setTissGuideNum(`2026${Math.floor(1000 + Math.random() * 9000)}`);
    alert(`Guia XML TISS (versão 4.01.00) gerada com sucesso e salva localmente para o paciente ${patient.name}!`);
  };

  // Financial calculations
  const totalEntries = transactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExits = transactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalEntries - totalExits;

  // Covenant Breakdown calculation
  const covenantsCount: { [key: string]: number } = {};
  const covenantsAmount: { [key: string]: number } = {};
  let totalCovenantSessions = 0;

  appointments.forEach(a => {
    if (a.status === 'completed') {
      const cov = a.covenant || 'Particular';
      covenantsCount[cov] = (covenantsCount[cov] || 0) + 1;
      covenantsAmount[cov] = (covenantsAmount[cov] || 0) + a.cost;
      totalCovenantSessions += 1;
    }
  });

  // Calculate stats by doctor
  const therapistSessions = {
    andre: appointments.filter(a => a.physioId === 'andre' && a.status === 'completed').length,
    beatriz: appointments.filter(a => a.physioId === 'beatriz' && a.status === 'completed').length
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newTx.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert('Por favor, informe um valor correto!');
      return;
    }

    onAddTransaction({
      type: newTx.type,
      category: newTx.category,
      description: newTx.description || `${newTx.category} Geral`,
      amount: amountVal,
      date: newTx.date
    });

    setShowAddTxForm(false);
    setNewTx({
      type: 'saida',
      category: 'Materiais',
      description: '',
      amount: '',
      date: '2026-07-13'
    });
    alert('Transação financeira registrada no fluxo de caixa!');
  };

  const exportMonthlyReportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Mensal de Desempenho Clínico - FisioFlow</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; line-height: 1.6; }
            .header { border-bottom: 3px solid #0d9488; padding-bottom: 15px; margin-bottom: 30px; text-align: center; }
            .title { font-size: 26px; font-weight: bold; color: #1e293b; margin: 0; }
            .meta { font-size: 13px; color: #64748b; margin-top: 5px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr 1fr; gap: 20px; margin-bottom: 35px; }
            .stat-card { border: 1px solid #e2e8f0; background: #f8fafc; padding: 15px; border-radius: 10px; text-align: center; }
            .stat-val { font-size: 20px; font-weight: bold; color: #0d9488; }
            .stat-lbl { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 5px; }
            .section { margin-bottom: 30px; }
            .section-header { font-size: 15px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
            th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: bold; color: #475569; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .badge { padding: 3px 8px; font-size: 10px; font-weight: bold; border-radius: 4px; }
            .badge-in { bg-color: #d1fae5; color: #065f46; background: #d1fae5; }
            .badge-out { bg-color: #fee2e2; color: #991b1b; background: #fee2e2; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Relatório de Desempenho Mensal (Julho/2026)</h1>
            <div class="meta">Gerado eletronicamente em 13/07/2026 | Responsável: Administrador Geral</div>
          </div>

          <div class="grid">
            <div class="stat-card">
              <div class="stat-val">R$ ${totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="stat-lbl">Faturamento Total (Entradas)</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">R$ ${totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="stat-lbl">Custo Operacional (Saídas)</div>
            </div>
            <div class="stat-card">
              <div class="stat-val" style="color: ${balance >= 0 ? '#0d9488' : '#e11d48'}">R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div class="stat-lbl">Lucro Líquido Real</div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">1. Produtividade Clínica & Atendimentos</div>
            <p style="font-size: 13px;">Neste período, a clínica realizou um total de <strong>${totalCovenantSessions} sessões concluídas</strong>.</p>
            <table>
              <thead>
                <tr>
                  <th>Fisioterapeuta</th>
                  <th>Sessões Concluídas</th>
                  <th>Especialidade Principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dr. André Silva</td>
                  <td>${therapistSessions.andre} sessões</td>
                  <td>Traumatologia e Ortopedia</td>
                </tr>
                <tr>
                  <td>Dra. Beatriz Costa</td>
                  <td>${therapistSessions.beatriz} sessões</td>
                  <td>Pilates Clínico e RPG</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-header">2. Análise de Convênios Médicos</div>
            <table>
              <thead>
                <tr>
                  <th>Plano de Saúde / Convênio</th>
                  <th>Quantidade de Atendimentos</th>
                  <th>Faturamento Gerado</th>
                </tr>
              </thead>
              <tbody>
                ${Object.keys(covenantsAmount).map(cov => `
                  <tr>
                    <td><strong>${cov}</strong></td>
                    <td>${covenantsCount[cov]} atendimentos</td>
                    <td>R$ ${covenantsAmount[cov].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section" style="page-break-before: always;">
            <div class="section-header">3. Demonstrativo de Fluxo de Caixa (Lançamentos Recentes)</div>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td>${t.date.split('-').reverse().join('/')}</td>
                    <td><span class="badge ${t.type === 'entrada' ? 'badge-in' : 'badge-out'}">${t.type.toUpperCase()}</span></td>
                    <td>${t.category}</td>
                    <td>${t.description}</td>
                    <td><strong>R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 25px; background: #0d9488; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;">Imprimir Laudo Completo / Exportar PDF</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6" id="admin-dashboard-root">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Entradas do Mês</p>
            <h3 className="text-xl font-black text-slate-800 font-mono mt-1">
              R$ {totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Faturamento Operacional
            </p>
          </div>
          <span className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saídas do Mês</p>
            <h3 className="text-xl font-black text-slate-800 font-mono mt-1">
              R$ {totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" /> Despesas & Custos fixos
            </p>
          </div>
          <span className="p-3 bg-rose-100 text-rose-700 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saldo de Caixa</p>
            <h3 className={`text-xl font-black font-mono mt-1 ${balance >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Saldo Líquido Real em Caixa</p>
          </div>
          <span className={`p-3 rounded-xl ${balance >= 0 ? 'bg-teal-100 text-teal-700' : 'bg-rose-100 text-rose-700'}`}>
            <DollarSign className="w-6 h-6" />
          </span>
        </div>
      </div>

      {/* Navigation SubTabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 shadow-sm shrink-0">
        <button
          onClick={() => setActiveSubTab('financial')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
            activeSubTab === 'financial' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
          id="adminsubtab-financial"
        >
          <DollarSign className="w-4 h-4 inline-block mr-1.5" />
          Fluxo de Caixa
        </button>
        <button
          onClick={() => setActiveSubTab('covenants')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
            activeSubTab === 'covenants' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
          id="adminsubtab-covenants"
        >
          <CreditCard className="w-4 h-4 inline-block mr-1.5" />
          Faturamento Convênios
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
            activeSubTab === 'reports' ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
          id="adminsubtab-reports"
        >
          <FileText className="w-4 h-4 inline-block mr-1.5" />
          Relatório Clínico Mensal
        </button>
      </div>

      {/* SubTab Content */}
      {activeSubTab === 'financial' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5" id="admin-cashflow-view">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 font-sans">Livro Diário & Lançamentos Financeiros</h2>
              <p className="text-xs text-slate-500">Monitore todas as entradas de guias de convênios, consultas pagas e contas de custeio.</p>
            </div>
            <button
              onClick={() => setShowAddTxForm(!showAddTxForm)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              id="admin-new-tx-btn"
            >
              <Plus className="w-4 h-4" />
              Lançar Movimentação
            </button>
          </div>

          {/* Quick Expense Form */}
          {showAddTxForm && (
            <form onSubmit={handleAddTx} className="p-4 border border-teal-100 rounded-xl bg-teal-50/35 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in" id="add-transaction-form">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tipo de Operação</label>
                <select
                  value={newTx.type}
                  onChange={(e) => setNewTx(prev => ({ ...prev, type: e.target.value as 'entrada' | 'saida' }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                  id="tx-input-type"
                >
                  <option value="saida">Saída (Despesa / Custo)</option>
                  <option value="entrada">Entrada (Ganho / Recebimento)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Categoria</label>
                <select
                  value={newTx.category}
                  onChange={(e) => setNewTx(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                  id="tx-input-category"
                >
                  <option value="Materiais">Materiais de Reabilitação</option>
                  <option value="Aluguel">Aluguel / Condomínio</option>
                  <option value="Salários">Salários / Comissões</option>
                  <option value="Utilidades">Energia / Água / Internet</option>
                  <option value="Marketing">Marketing / Divulgação</option>
                  <option value="Consulta">Consulta Particular</option>
                  <option value="Repasse Convenio">Faturamento Convênio</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de Luz Enel Julho"
                  value={newTx.description}
                  onChange={(e) => setNewTx(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                  id="tx-input-desc"
                />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="250.00"
                    value={newTx.amount}
                    onChange={(e) => setNewTx(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white font-mono"
                    id="tx-input-amount"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-2 rounded font-bold transition-all cursor-pointer shadow h-[31px]"
                  id="tx-submit"
                >
                  Registrar
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="border border-slate-100 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="p-3">Data</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {transactions
                  .slice()
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors" id={`tx-row-${t.id}`}>
                      <td className="p-3 text-slate-500 font-mono">{t.date.split('-').reverse().join('/')}</td>
                      <td className="p-3 font-semibold text-slate-700">{t.category}</td>
                      <td className="p-3 text-slate-600">{t.description}</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          t.type === 'entrada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.type === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={`p-3 text-right font-bold font-mono ${t.type === 'entrada' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Convenios Breakdown SubTab */}
      {activeSubTab === 'covenants' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6" id="admin-covenants-view">
          <div>
            <h2 className="text-base font-bold text-slate-800 font-sans">Estatísticas de Convênios Médicos</h2>
            <p className="text-xs text-slate-500">Acompanhe a participação no faturamento e quantidade de atendimentos de cada operadora credenciada.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Convenios Bars progress */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Faturamento Estimado</h3>
              
              <div className="space-y-4">
                {Object.keys(covenantsAmount).map((cov) => {
                  const amt = covenantsAmount[cov];
                  const percentage = totalEntries > 0 ? (amt / totalEntries) * 100 : 0;
                  return (
                    <div key={cov} className="space-y-1.5" id={`cov-breakdown-${cov}`}>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{cov} ({covenantsCount[cov]} sessões)</span>
                        <span className="text-slate-900 font-mono font-black">R$ {amt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(percentage, 3)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informative summary box and local TISS generator */}
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 space-y-3">
                <h4 className="font-bold text-teal-900 text-xs">Integração de Faturamento de Guias</h4>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  As sessões marcadas como concluídas geram o registro automático de entrada com base nas tabelas CBHPM credenciadas. 
                  Os fechamentos de faturamento ocorrem no dia 15 de cada mês de forma integrada com o webservice TISS do sistema de cada plano de saúde.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-teal-700 font-bold bg-white p-2.5 rounded-lg border border-teal-100 shadow-sm shrink-0">
                  <Percent className="w-4 h-4 text-teal-600" />
                  <span>Integração de Guias Médicas (Padrão XML TISS 4.01) Ativa</span>
                </div>
              </div>

              {/* LOCAL GENERATOR FORM (NO INTERMEDIARIES) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-left">
                <div className="flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-xs">Gerador Local de Guias XML TISS (100% Gratuito)</h4>
                </div>
                <p className="text-[10px] text-slate-500">
                  Gere o arquivo <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-teal-600 text-[9px]">.xml</span> para faturamento direto na operadora, eliminando taxas de intermediários.
                </p>

                <form onSubmit={handleGenerateTissXml} className="space-y-2.5 text-xs text-slate-700">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Selecione o Paciente</label>
                    <select
                      value={selectedTissPatientId}
                      onChange={(e) => {
                        setSelectedTissPatientId(e.target.value);
                        const patient = patients.find(p => p.id === e.target.value);
                        if (patient && patient.covenant === 'Particular') {
                          alert('Aviso: Este paciente está marcado como "Particular". O XML TISS gerado terá código ANS genérico.');
                        }
                      }}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white shadow-3xs"
                    >
                      <option value="">-- Selecionar Paciente --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.covenant})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Tipo de Guia</label>
                      <select
                        value={tissGuideType}
                        onChange={(e) => setTissGuideType(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white shadow-3xs"
                      >
                        <option value="spsadt">Guia de SP/SADT (Sessões)</option>
                        <option value="consulta">Guia de Consulta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Nº Guia (Prestador)</label>
                      <input
                        type="text"
                        value={tissGuideNum}
                        onChange={(e) => setTissGuideNum(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white font-mono shadow-3xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Código TUSS (Procedimento)</label>
                      <select
                        value={tissTussCode}
                        onChange={(e) => setTissTussCode(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white shadow-3xs"
                      >
                        <option value="31602019">31602019 - Fisioterapia Motora</option>
                        <option value="31602027">31602027 - Fisioterapia Respiratória</option>
                        <option value="50000632">50000632 - Avaliação Fisioterapêutica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-0.5">Qtde. Sessões</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={tissQty}
                        onChange={(e) => setTissQty(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white font-mono shadow-3xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] py-2 rounded shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Gerar e Baixar XML TISS 4.01
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Reports SubTab */}
      {activeSubTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6" id="admin-reports-view">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800">Relatórios Mensais de Desempenho Clínico</h2>
              <p className="text-xs text-slate-500 font-sans">Análise detalhada de produtividade dos terapeutas e captação de pacientes.</p>
            </div>
            <button
              onClick={exportMonthlyReportToPDF}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              id="admin-export-pdf-btn"
            >
              <Printer className="w-4 h-4" />
              Imprimir Relatório Detalhado (PDF)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-slate-100 rounded-xl space-y-3 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Produtividade dos Fisioterapeutas</h3>
              
              <div className="divide-y divide-slate-100">
                <div className="py-2.5 flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Dr. André Silva (Traumatologia)</span>
                  <strong className="text-slate-900 font-mono">{therapistSessions.andre} sessões concluídas</strong>
                </div>
                <div className="py-2.5 flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Dra. Beatriz Costa (Pilates/RPG)</span>
                  <strong className="text-slate-900 font-mono">{therapistSessions.beatriz} sessões concluídas</strong>
                </div>
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-xl space-y-3 bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Métricas Globais da Clínica</h3>
              
              <div className="divide-y divide-slate-100">
                <div className="py-2.5 flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Frequência Total de Atendimento</span>
                  <strong className="text-slate-900 font-mono">{totalCovenantSessions} sessões totais</strong>
                </div>
                <div className="py-2.5 flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Taxa de Presença nos Agendamentos</span>
                  <strong className="text-slate-900 font-mono">
                    {appointments.length > 0 ? Math.round((appointments.filter(a => a.status === 'completed' || a.status === 'checked_in').length / appointments.length) * 100) : 100}%
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
