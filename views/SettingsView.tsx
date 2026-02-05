import React, { useState } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Bell,
  Globe,
  Trash2,
  Save,
  Moon,
  Sun,
  Lock,
  Smartphone,
  CreditCard as CardIcon,
  CheckCircle2,
  AlertTriangle,
  // Added Plus icon to fix the error on line 254
  Plus
} from 'lucide-react';
import { useData } from '../src/context/DataContext';

interface SettingsViewProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

type SettingsSection = 'profile' | 'security' | 'billing' | 'notifications' | 'workspace';

const SettingsView: React.FC<SettingsViewProps> = ({ isDarkMode, setIsDarkMode }) => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('profile');

  const { userProfile, updateUserProfile } = useData();

  // Local state for form editing, initialized from context
  const [profile, setProfile] = useState(userProfile);

  // Sync local state if context changes (optional, but good practice)
  React.useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  const [workspace, setWorkspace] = useState(() => {
    const saved = localStorage.getItem('settings_workspace');
    return saved ? JSON.parse(saved) : { name: 'Pipe Day Solutions', domain: '' };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('settings_notifications');
    return saved ? JSON.parse(saved) : { payments: true, leads: true, expired: true, reports: false };
  });

  const handleSave = () => {
    updateUserProfile(profile);
    localStorage.setItem('settings_workspace', JSON.stringify(workspace));
    localStorage.setItem('settings_notifications', JSON.stringify(notifications));
    alert('Configurações salvas com sucesso!');
  };

  const NavButton = ({ id, icon: Icon, label }: { id: SettingsSection; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentSection(id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${currentSection === id
        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Configurações</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie sua conta, workspace e preferências.</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
        >
          <Save size={18} />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-2 lg:pb-0 no-scrollbar">
            <NavButton id="profile" icon={User} label="Perfil" />
            <NavButton id="security" icon={Shield} label="Segurança" />
            <NavButton id="billing" icon={CreditCard} label="Plano" />
            <NavButton id="notifications" icon={Bell} label="Notificações" />
            <NavButton id="workspace" icon={Globe} label="Workspace" />
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {currentSection === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Aparência</h3>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                      {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Modo Escuro</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Ative para reduzir o cansaço visual.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`relative w-12 h-6 transition-colors duration-200 rounded-full focus:outline-none ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 transition-transform duration-200 transform bg-white rounded-full shadow-md ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Dados Pessoais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chave Pix Principal</label>
                  <input
                    type="text"
                    value={profile.pixKey}
                    onChange={(e) => setProfile({ ...profile, pixKey: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100"
                    placeholder="E-mail, CPF ou Chave Aleatória"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 ml-1 italic">Usada para gerar cobranças rápidas no funil.</p>
                </div>
              </section>
            </div>
          )}

          {currentSection === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Lock size={20} className="text-slate-400" /> Alterar Senha
                </h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha Atual</label>
                    <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
                    <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Smartphone size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Autenticação em Duas Etapas</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Adicione uma camada extra de segurança à sua conta.</p>
                    </div>
                  </div>
                  <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Configurar</button>
                </div>
              </section>
            </div>
          )}

          {currentSection === 'billing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Plano Atual</h3>
                  <span className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-black px-2 py-1 rounded uppercase tracking-wider">Ativo</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                    <p className="text-indigo-100 text-sm font-medium">Plano</p>
                    <h4 className="text-2xl font-black mt-1">Pipe Pro</h4>
                    <p className="text-indigo-100 text-sm mt-4">Próxima renovação: 12 Nov, 2024</p>
                    <div className="mt-6 flex gap-3">
                      <button className="flex-1 bg-white text-indigo-600 py-2 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">Gerenciar Assinatura</button>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Clientes</p>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100">∞</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Faturas/mês</p>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100">∞</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Espaço</p>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100">10GB</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Usuários</p>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100">5/5</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <CardIcon size={20} className="text-slate-400" /> Método de Pagamento
                </h3>
                <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center font-bold italic text-slate-400">VISA</div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">•••• •••• •••• 4242</p>
                      <p className="text-xs text-slate-500">Expira em 12/28</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-red-500 transition-colors">Remover</button>
                </div>
              </section>
            </div>
          )}

          {currentSection === 'notifications' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Preferências de Alerta</h3>

                <div className="space-y-4">
                  {[
                    { id: 'payments', title: 'Pagamentos Recebidos', desc: 'Sempre que uma fatura for marcada como paga.' },
                    { id: 'leads', title: 'Novo Lead no Funil', desc: 'Notificar quando um novo contato for adicionado.' },
                    { id: 'expired', title: 'Faturas Vencidas', desc: 'Alertas diários sobre cobranças atrasadas.' },
                    { id: 'reports', title: 'Relatórios Semanais', desc: 'Resumo da performance do seu negócio por e-mail.' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notifications[item.id as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {currentSection === 'workspace' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">Geral do Workspace</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Workspace</label>
                  <input
                    type="text"
                    value={workspace.name}
                    onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                    className="w-full max-w-md px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Domínio Personalizado (Opcional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={workspace.domain}
                      onChange={(e) => setWorkspace({ ...workspace, domain: e.target.value })}
                      className="flex-1 max-w-md px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-slate-100"
                      placeholder="meu.crm.com"
                    />
                    <button className="text-indigo-600 font-bold text-sm">Validar</button>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Membros da Equipe</h3>
                  <button className="text-indigo-600 font-bold text-sm flex items-center gap-1"><Plus size={16} /> Convidar</button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: profile.name, role: 'Dono', email: profile.email },
                    { name: 'Carlos Sales', role: 'Editor', email: 'carlos@pipeday.com' }
                  ].map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-50 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">{user.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                          <p className="text-[10px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{user.role}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle size={16} /> Zona Crítica
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Excluir este workspace removerá todos os clientes, faturas e negócios sem possibilidade de recuperação.</p>
                </div>
                <button className="px-4 py-2 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-sm font-bold hover:bg-red-600 dark:hover:bg-red-700 hover:text-white transition-all shadow-sm">
                  Excluir Permanentemente
                </button>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;