import React, { useState, useEffect } from 'react';
import { Zap, Star, Timer, Target, Shield, Award } from 'lucide-react';

interface TalentSystemProps {
  darkMode: boolean;
  talentPoints: number;
  onSpendPoints: (amount: number) => void;
  onTalentUpdate: (talents: TalentState) => void;
  onClose: () => void;
}

interface Talent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  maxPoints: number;
  requires?: string[];
  effects: {
    type: 'clickPower' | 'passiveIncome' | 'criticalChance' | 'criticalMultiplier' | 'petBonus' | 'prestigeBonus';
    value: number;
  }[];
}

interface TalentState {
  [key: string]: number;
}

const talents: Talent[] = [
  {
    id: 'click_mastery',
    name: 'Мастерство клика',
    description: 'Увеличивает силу клика',
    icon: <Zap className="w-6 h-6" />,
    maxPoints: 5,
    effects: [
      { type: 'clickPower', value: 0.2 } // +20% за уровень
    ]
  },
  {
    id: 'passive_mastery',
    name: 'Пассивное мастерство',
    description: 'Увеличивает пассивный доход',
    icon: <Timer className="w-6 h-6" />,
    maxPoints: 5,
    effects: [
      { type: 'passiveIncome', value: 0.15 } // +15% за уровень
    ]
  },
  {
    id: 'critical_expertise',
    name: 'Критическая экспертиза',
    description: 'Увеличивает шанс критического удара',
    icon: <Target className="w-6 h-6" />,
    maxPoints: 3,
    requires: ['click_mastery'],
    effects: [
      { type: 'criticalChance', value: 0.05 } // +5% за уровень
    ]
  },
  {
    id: 'critical_power',
    name: 'Сила критического удара',
    description: 'Увеличивает множитель критического урона',
    icon: <Shield className="w-6 h-6" />,
    maxPoints: 3,
    requires: ['critical_expertise'],
    effects: [
      { type: 'criticalMultiplier', value: 0.25 } // +25% за уровень
    ]
  },
  {
    id: 'pet_mastery',
    name: 'Мастерство питомцев',
    description: 'Увеличивает эффективность всех питомцев',
    icon: <Star className="w-6 h-6" />,
    maxPoints: 4,
    effects: [
      { type: 'petBonus', value: 0.1 } // +10% за уровень
    ]
  },
  {
    id: 'prestige_mastery',
    name: 'Мастерство престижа',
    description: 'Увеличивает получаемые очки престижа',
    icon: <Award className="w-6 h-6" />,
    maxPoints: 3,
    requires: ['passive_mastery'],
    effects: [
      { type: 'prestigeBonus', value: 0.1 } // +10% за уровень
    ]
  }
];

export { talents };

export const TalentSystem: React.FC<TalentSystemProps> = ({
  darkMode,
  talentPoints,
  onSpendPoints,
  onTalentUpdate,
  onClose
}) => {
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [talentLevels, setTalentLevels] = useState<TalentState>(() => {
    const saved = localStorage.getItem('gameTalents');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('gameTalents', JSON.stringify(talentLevels));
    onTalentUpdate(talentLevels);
  }, [talentLevels, onTalentUpdate]);

  const canInvestPoint = (talent: Talent) => {
    if (talentPoints <= 0) return false;
    if ((talentLevels[talent.id] || 0) >= talent.maxPoints) return false;
    
    if (talent.requires) {
      return talent.requires.every(reqId => {
        const requiredTalent = talents.find(t => t.id === reqId);
        return requiredTalent && (talentLevels[reqId] || 0) >= requiredTalent.maxPoints;
      });
    }
    
    return true;
  };

  const investPoint = (talent: Talent) => {
    if (!canInvestPoint(talent)) return;

    setTalentLevels(prev => ({
      ...prev,
      [talent.id]: (prev[talent.id] || 0) + 1
    }));
    onSpendPoints(1);
  };

  const getTalentEffectDescription = (talent: Talent, level: number) => {
    return talent.effects.map(effect => {
      const totalValue = effect.value * level;
      const formattedValue = (totalValue * 100).toFixed(0);
      
      switch (effect.type) {
        case 'clickPower':
          return `+${formattedValue}% к силе клика`;
        case 'passiveIncome':
          return `+${formattedValue}% к пассивному доходу`;
        case 'criticalChance':
          return `+${formattedValue}% к шансу крит. удара`;
        case 'criticalMultiplier':
          return `+${formattedValue}% к множителю крит. удара`;
        case 'petBonus':
          return `+${formattedValue}% к эффективности питомцев`;
        case 'prestigeBonus':
          return `+${formattedValue}% к очкам престижа`;
        default:
          return '';
      }
    }).join(', ');
  };

  return (
    <div className={`${darkMode ? 'bg-purple-900' : 'bg-white'} rounded-lg shadow-xl max-w-4xl w-full overflow-hidden`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6" /> Таланты
          <span className={`ml-4 px-3 py-1 rounded-full text-sm ${
            darkMode ? 'bg-purple-800' : 'bg-indigo-100'
          }`}>
            Доступно очков: {talentPoints}
          </span>
        </h2>
        <button onClick={onClose} className="text-2xl">&times;</button>
      </div>

      <div className="p-4">
        {selectedTalent ? (
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-800' : 'bg-indigo-100'}`}>
                {selectedTalent.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{selectedTalent.name}</h3>
                <p className={`${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-4`}>
                  {selectedTalent.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Уровень:</span>
                    <span>{talentLevels[selectedTalent.id] || 0} / {selectedTalent.maxPoints}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400"
                      style={{
                        width: `${((talentLevels[selectedTalent.id] || 0) / selectedTalent.maxPoints) * 100}%`
                      }}
                    />
                  </div>
                  <div className={`mt-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Текущий эффект: {getTalentEffectDescription(selectedTalent, talentLevels[selectedTalent.id] || 0)}
                  </div>
                  <div className={`mt-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    След. уровень: {getTalentEffectDescription(selectedTalent, (talentLevels[selectedTalent.id] || 0) + 1)}
                  </div>
                </div>
                <button
                  onClick={() => investPoint(selectedTalent)}
                  disabled={!canInvestPoint(selectedTalent)}
                  className={`mt-6 px-4 py-2 rounded-lg w-full ${
                    canInvestPoint(selectedTalent)
                      ? darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-500 hover:bg-indigo-400'
                      : darkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
                  } text-white transition-colors`}
                >
                  Изучить
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {talents.map(talent => {
              const level = talentLevels[talent.id] || 0;
              const isMaxed = level >= talent.maxPoints;
              const isLocked = talent.requires?.some(reqId => {
                const requiredTalent = talents.find(t => t.id === reqId);
                return !requiredTalent || (talentLevels[reqId] || 0) < requiredTalent.maxPoints;
              });

              return (
                <button
                  key={talent.id}
                  onClick={() => setSelectedTalent(talent)}
                  disabled={isLocked}
                  className={`p-4 rounded-lg text-left ${
                    isLocked
                      ? darkMode ? 'bg-gray-800 opacity-50' : 'bg-gray-200 opacity-50'
                      : isMaxed
                        ? darkMode ? 'bg-green-800/30' : 'bg-green-100'
                        : darkMode ? 'bg-purple-800 hover:bg-purple-700' : 'bg-indigo-100 hover:bg-indigo-200'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isMaxed
                        ? darkMode ? 'bg-green-700' : 'bg-green-200'
                        : darkMode ? 'bg-purple-700' : 'bg-indigo-200'
                    }`}>
                      {talent.icon}
                    </div>
                    <div>
                      <h3 className="font-bold">{talent.name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        {talent.description}
                      </p>
                      <div className={`mt-2 text-sm ${
                        isMaxed
                          ? darkMode ? 'text-green-400' : 'text-green-600'
                          : darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        {level} / {talent.maxPoints}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentSystem; 