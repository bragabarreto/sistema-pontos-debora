'use client';

import { useEffect, useState } from 'react';

interface SettingsProps {
  childId: number | null;
  onUpdate: () => void;
}

interface AppSettings {
  title: string;
  subtitle: string;
  titleEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  child1Emoji: string;
  child2Emoji: string;
}

const defaultAppSettings: AppSettings = {
  title: 'Sistema de Pontuação',
  subtitle: 'Incentivando bons comportamentos!',
  titleEmoji: '🏆',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  child1Emoji: '👦',
  child2Emoji: '👧',
};

const emojiOptions = ['👦', '👧', '👶', '🧒', '👨', '👩', '🧑', '👸', '🤴', '🦸', '🦹', '🧚', '🧙', '⭐', '🌟', '💫', '✨', '🎯', '🏆', '🎖️', '🥇', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎮', '🎲', '🧩', '🎁', '🎀', '🎈', '🎉', '🎊', '❤️', '💖', '💝', '💗', '💓', '💕', '💜', '💙', '💚', '💛', '🧡', '🤍', '🖤', '🤎'];

export function Settings({ childId, onUpdate }: SettingsProps) {
  const [multipliers, setMultipliers] = useState({
    positivos: 10,
    especiais: 100,
    negativos: -10,
    graves: -100,
  });
  const [loading, setLoading] = useState(true);
  
  // Parent user state
  const [parentName, setParentName] = useState('');
  const [parentGender, setParentGender] = useState('');
  const [appStartDate, setAppStartDate] = useState('');
  const [parentExists, setParentExists] = useState(false);
  
  // Child initial balance state
  const [childInitialBalance, setChildInitialBalance] = useState(0);
  const [childStartDate, setChildStartDate] = useState('');

  // App appearance settings
  const [appSettings, setAppSettings] = useState<AppSettings>(defaultAppSettings);

  // Children names state
  const [children, setChildren] = useState<any[]>([]);
  const [child1Name, setChild1Name] = useState('');
  const [child2Name, setChild2Name] = useState('');

  useEffect(() => {
    loadSettings();
    loadParentInfo();
    loadAppSettings();
    loadChildrenNames();
    if (childId) {
      loadChildInfo();
    }
  }, [childId]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings?key=multipliers');
      const data = await response.json();
      if (data?.value) {
        setMultipliers(data.value);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppSettings = async () => {
    try {
      const response = await fetch('/api/settings?key=appSettings');
      const data = await response.json();
      if (data?.value) {
        setAppSettings({ ...defaultAppSettings, ...data.value });
      }
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  };

  const loadChildrenNames = async () => {
    try {
      const response = await fetch('/api/children');
      const data = await response.json();
      if (Array.isArray(data)) {
        setChildren(data);
        if (data.length >= 1) setChild1Name(data[0].name);
        if (data.length >= 2) setChild2Name(data[1].name);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  };

  const loadParentInfo = async () => {
    try {
      const response = await fetch('/api/parent');
      const data = await response.json();
      
      if (data) {
        setParentName(data.name || '');
        setParentGender(data.gender || '');
        setAppStartDate(data.appStartDate ? new Date(data.appStartDate).toISOString().split('T')[0] : '');
        setParentExists(true);
      }
    } catch (error) {
      console.error('Error loading parent info:', error);
    }
  };

  const loadChildInfo = async () => {
    try {
      const response = await fetch(`/api/children/${childId}`);
      const data = await response.json();
      
      if (data) {
        setChildInitialBalance(data.initialBalance || 0);
        setChildStartDate(data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : '');
      }
    } catch (error) {
      console.error('Error loading child info:', error);
    }
  };

  const saveMultipliers = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'multipliers',
          value: multipliers,
        }),
      });
      alert('Multiplicadores salvos com sucesso!');
    } catch (error) {
      console.error('Error saving multipliers:', error);
      alert('Erro ao salvar multiplicadores');
    }
  };

  const saveAppSettings = async () => {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'appSettings',
          value: appSettings,
        }),
      });
      alert('Configurações de aparência salvas com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Error saving app settings:', error);
      alert('Erro ao salvar configurações de aparência');
    }
  };

  const saveChildrenNames = async () => {
    try {
      if (children.length >= 1 && child1Name) {
        await fetch(`/api/children/${children[0].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: child1Name }),
        });
      }
      if (children.length >= 2 && child2Name) {
        await fetch(`/api/children/${children[1].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: child2Name }),
        });
      }
      alert('Nomes das crianças salvos com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Error saving children names:', error);
      alert('Erro ao salvar nomes das crianças');
    }
  };

  const exportData = async () => {
    try {
      const [childrenRes, activitiesRes, customActivitiesRes, settingsRes] = await Promise.all([
        fetch('/api/children'),
        fetch('/api/activities'),
        fetch('/api/custom-activities'),
        fetch('/api/settings'),
      ]);

      const [childrenData, activities, customActivities, settings] = await Promise.all([
        childrenRes.json(),
        activitiesRes.json(),
        customActivitiesRes.json(),
        settingsRes.json(),
      ]);

      const exportData = {
        children: Array.isArray(childrenData) ? childrenData : [],
        activities: Array.isArray(activities) ? activities : [],
        customActivities: Array.isArray(customActivities) ? customActivities : [],
        settings: Array.isArray(settings) ? settings : [],
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `sistema-pontos-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Erro ao exportar dados');
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          const response = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(importedData),
          });

          const result = await response.json();
          
          if (response.ok) {
            alert(`Dados importados com sucesso!\n\nCrianças: ${result.children}\nAtividades personalizadas: ${result.customActivities}\nAtividades: ${result.activities}`);
            onUpdate();
          } else {
            alert(`Erro ao importar dados: ${result.error}`);
          }
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Erro ao processar arquivo de importação');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const saveParentInfo = async () => {
    if (!parentName || !appStartDate) {
      alert('Por favor, preencha o nome e a data de início do app');
      return;
    }

    try {
      const response = await fetch('/api/parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: parentName,
          gender: parentGender,
          appStartDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Informações do pai/mãe salvas com sucesso!');
        setParentExists(true);
      } else {
        const errorMessage = data.error || 'Erro ao salvar informações';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving parent info:', error);
      alert('Erro ao salvar informações. Verifique sua conexão e tente novamente.');
    }
  };

  const saveChildInitialBalance = async () => {
    if (!childId) {
      alert('Selecione uma criança');
      return;
    }

    if (!childStartDate) {
      alert('Por favor, defina a data de início');
      return;
    }

    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initialBalance: childInitialBalance,
          startDate: childStartDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Saldo inicial e data de início salvos com sucesso!');
        onUpdate();
      } else {
        const errorMessage = data.error || 'Erro ao salvar configurações';
        alert(`Erro: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving child initial balance:', error);
      alert('Erro ao salvar configurações. Verifique sua conexão e tente novamente.');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">⚙️ Configurações</h2>

      {/* App Appearance Section */}
      <div className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">🎨 Personalização do Aplicativo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Título do Aplicativo:</label>
            <input
              type="text"
              value={appSettings.title}
              onChange={(e) => setAppSettings({ ...appSettings, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Sistema de Pontuação"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Emoji do Título:</label>
            <select
              value={appSettings.titleEmoji}
              onChange={(e) => setAppSettings({ ...appSettings, titleEmoji: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-2xl"
            >
              {emojiOptions.map((emoji) => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">Subtítulo:</label>
            <input
              type="text"
              value={appSettings.subtitle}
              onChange={(e) => setAppSettings({ ...appSettings, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Incentivando bons comportamentos!"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Cor Principal:</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={appSettings.primaryColor}
                onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={appSettings.primaryColor}
                onChange={(e) => setAppSettings({ ...appSettings, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="#667eea"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Cor Secundária:</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={appSettings.secondaryColor}
                onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={appSettings.secondaryColor}
                onChange={(e) => setAppSettings({ ...appSettings, secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="#764ba2"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Emoji da Criança 1:</label>
            <select
              value={appSettings.child1Emoji}
              onChange={(e) => setAppSettings({ ...appSettings, child1Emoji: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-2xl"
            >
              {emojiOptions.map((emoji) => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Emoji da Criança 2:</label>
            <select
              value={appSettings.child2Emoji}
              onChange={(e) => setAppSettings({ ...appSettings, child2Emoji: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-2xl"
            >
              {emojiOptions.map((emoji) => (
                <option key={emoji} value={emoji}>{emoji}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 bg-white rounded-md border mb-4">
          <p className="text-sm text-gray-600 mb-2">Pré-visualização:</p>
          <div className="text-center p-4 rounded-md" style={{ background: `linear-gradient(to right, ${appSettings.primaryColor}, ${appSettings.secondaryColor})` }}>
            <h4 className="text-2xl font-bold text-white">{appSettings.titleEmoji} {appSettings.title}</h4>
            <p className="text-white">{appSettings.subtitle}</p>
            <div className="flex justify-center gap-4 mt-2">
              <span className="bg-white/20 px-3 py-1 rounded text-white">{appSettings.child1Emoji} {child1Name || 'Criança 1'}</span>
              <span className="bg-white/20 px-3 py-1 rounded text-white">{appSettings.child2Emoji} {child2Name || 'Criança 2'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={saveAppSettings}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-md hover:from-pink-600 hover:to-purple-600 font-semibold"
        >
          💾 Salvar Aparência
        </button>
      </div>

      {/* Children Names Section */}
      <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">👶 Nomes das Crianças</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome da Criança 1:</label>
            <input
              type="text"
              value={child1Name}
              onChange={(e) => setChild1Name(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome da primeira criança"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Nome da Criança 2:</label>
            <input
              type="text"
              value={child2Name}
              onChange={(e) => setChild2Name(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome da segunda criança"
            />
          </div>
        </div>
        <button
          onClick={saveChildrenNames}
          className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 font-semibold"
        >
          💾 Salvar Nomes
        </button>
      </div>

      {/* Parent User Registration Section */}
      <div className="mb-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">👤 Dados do Pai/Mãe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nome do Pai/Mãe:</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Digite seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Sexo:</label>
            <select
              value={parentGender}
              onChange={(e) => setParentGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Data de Início do App:</label>
            <input
              type="date"
              value={appStartDate}
              onChange={(e) => setAppStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button
          onClick={saveParentInfo}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-semibold"
        >
          {parentExists ? '💾 Atualizar Dados' : '💾 Salvar Dados'}
        </button>
      </div>

      {/* Child Initial Balance Section */}
      {childId && (
        <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="text-xl font-bold mb-4">🎯 Configurações da Criança</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Saldo Inicial (pontos):</label>
              <input
                type="number"
                value={childInitialBalance}
                onChange={(e) => setChildInitialBalance(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Ex: 100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Data de Início para a Criança:</label>
              <input
                type="date"
                value={childStartDate}
                onChange={(e) => setChildStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <button
            onClick={saveChildInitialBalance}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-semibold"
          >
            💾 Salvar Configurações da Criança
          </button>
        </div>
      )}

      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-xl font-bold mb-4">📦 Backup e Importação</h3>
        <div className="flex gap-3">
          <button
            onClick={exportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <span>📥</span>
            Exportar Dados
          </button>
          <button
            onClick={importData}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <span>📤</span>
            Importar Dados
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Exporte seus dados para fazer backup ou importe dados de um arquivo anterior.
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Multiplicadores de Pontos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Positivas</label>
            <input
              type="number"
              value={multipliers.positivos}
              onChange={(e) => setMultipliers({ ...multipliers, positivos: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Especiais</label>
            <input
              type="number"
              value={multipliers.especiais}
              onChange={(e) => setMultipliers({ ...multipliers, especiais: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Negativas</label>
            <input
              type="number"
              value={multipliers.negativos}
              onChange={(e) => setMultipliers({ ...multipliers, negativos: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Atividades Graves</label>
            <input
              type="number"
              value={multipliers.graves}
              onChange={(e) => setMultipliers({ ...multipliers, graves: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <button
          onClick={saveMultipliers}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Salvar Multiplicadores
        </button>
      </div>
    </div>
  );
}
