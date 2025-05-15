import React, { useState, useEffect } from 'react';
import { Scroll, Star, Target, Shield, Zap, Book, Coins } from 'lucide-react';

interface QuestProps {
  onReward: (amount: number) => void;
  onResourceGain: (type: string, amount: number) => void;
  onClaimReward: (questId: string) => void;
  darkMode: boolean;
  soundEnabled: boolean;
  totalClicks: number;
  score: number;
  passiveIncome: number;
  upgrades: any[];
  onClose: () => void;
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
}

interface Quest {
  id: string;
  name: string;
  description: string;
  story: string;
  requirements: {
    type: 'clicks' | 'score' | 'passive' | 'upgrades';
    amount: number;
  }[];
  rewards: {
    type: 'coins' | 'research' | 'special' | 'talent';
    amount: number;
  }[];
  completed: boolean;
  progress: number[];
  unlocked: boolean;
  rewardClaimed: boolean;
}

const initialQuests: Quest[] = [
  {
    id: 'first_probe',
    name: 'Первый зонд',
    description: 'Построить первый исследовательский зонд',
    story: 'Для исследования далеких галактик нам необходимо построить исследовательский зонд. Это будет первый шаг к покорению космоса!',
    requirements: [
      { type: 'clicks', amount: 100 },
      { type: 'score', amount: 500 }
    ],
    rewards: [
      { type: 'coins', amount: 1000 },
      { type: 'research', amount: 50 },
      { type: 'talent', amount: 1 }
    ],
    completed: false,
    progress: [0, 0],
    unlocked: true,
    rewardClaimed: false
  },
  {
    id: 'defend_station',
    name: 'Защита станции',
    description: 'Отбить атаку космических рейдеров',
    story: 'Наши сенсоры засекли приближение вражеских кораблей! Нужно срочно усилить оборону станции и подготовиться к отражению атаки.',
    requirements: [
      { type: 'clicks', amount: 500 },
      { type: 'upgrades', amount: 3 }
    ],
    rewards: [
      { type: 'coins', amount: 2000 },
      { type: 'special', amount: 1 },
      { type: 'talent', amount: 2 }
    ],
    completed: false,
    progress: [0, 0],
    unlocked: false,
    rewardClaimed: false
  },
  {
    id: 'ancient_artifact',
    name: 'Древний артефакт',
    description: 'Расшифровать древний артефакт',
    story: 'Исследовательский зонд обнаружил странный объект с древними письменами. Для его изучения потребуются значительные ресурсы.',
    requirements: [
      { type: 'score', amount: 5000 },
      { type: 'passive', amount: 10 }
    ],
    rewards: [
      { type: 'coins', amount: 5000 },
      { type: 'research', amount: 200 },
      { type: 'talent', amount: 3 }
    ],
    completed: false,
    progress: [0, 0],
    unlocked: false,
    rewardClaimed: false
  }
];

export const QuestSystem: React.FC<QuestProps> = ({
  onReward,
  onResourceGain,
  onClaimReward,
  darkMode,
  soundEnabled,
  totalClicks,
  score,
  passiveIncome,
  upgrades,
  onClose,
  quests,
  setQuests
}) => {
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    const updateQuestProgress = () => {
      let questsChanged = false;
      const updatedQuests = quests.map(quest => {
        if (quest.completed) return quest;

        const newProgress = quest.requirements.map((req, index) => {
          switch (req.type) {
            case 'clicks':
              return Math.min(totalClicks, req.amount);
            case 'score':
              return Math.min(score, req.amount);
            case 'passive':
              return Math.min(passiveIncome, req.amount);
            case 'upgrades':
              return Math.min(upgrades.reduce((sum, u) => sum + u.owned, 0), req.amount);
            default:
              return quest.progress[index];
          }
        });

        const progressChanged = newProgress.some((p, i) => p !== quest.progress[i]);
        if (progressChanged) {
          questsChanged = true;
        }

        const completed = newProgress.every((p, i) => p >= quest.requirements[i].amount);
        if (completed && !quest.completed) {
          questsChanged = true;
          if (soundEnabled) {
            // Воспроизвести звук
          }
          quest.rewards.forEach(reward => {
            if (reward.type === 'coins') {
              onReward(reward.amount);
            } else {
              onResourceGain(reward.type, reward.amount);
            }
          });
        }

        return {
          ...quest,
          progress: newProgress,
          completed: completed
        };
      });

      if (questsChanged) {
        setQuests(updatedQuests);
        const newUnlocks = updatedQuests.map((quest, index) => {
          if (index === 0) return quest;
          const previousQuest = updatedQuests[index - 1];
          return {
            ...quest,
            unlocked: previousQuest.completed || quest.unlocked
          };
        });
        setQuests(newUnlocks);
      }
    };

    updateQuestProgress();
  }, [totalClicks, score, passiveIncome, upgrades, onReward, onResourceGain, soundEnabled, quests, setQuests]);

  return (
    <div className={`${darkMode ? 'bg-purple-900' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full overflow-hidden`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Book className="w-6 h-6" /> Сюжетные задания
        </h2>
        <button onClick={onClose} className="text-2xl">&times;</button>
      </div>

      <div className="p-4">
        {showStory && selectedQuest ? (
          <div className="text-center p-4">
            <h3 className="text-xl font-bold mb-4">{selectedQuest.name}</h3>
            <p className={`${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-6`}>
              {selectedQuest.story}
            </p>
            <button
              onClick={() => setShowStory(false)}
              className={`px-4 py-2 rounded-lg ${
                darkMode 
                  ? 'bg-purple-700 hover:bg-purple-600' 
                  : 'bg-indigo-500 hover:bg-indigo-400'
              } text-white transition-colors`}
            >
              Начать задание
            </button>
          </div>
        ) : selectedQuest ? (
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{selectedQuest.name}</h3>
            <p className={`${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-4`}>
              {selectedQuest.description}
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold">Требования:</h4>
                {selectedQuest.requirements.map((req, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{
                      req.type === 'clicks' ? 'Кликов' :
                      req.type === 'score' ? 'Монет' :
                      req.type === 'passive' ? 'Пассивный доход' :
                      'Улучшений'
                    }</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400"
                          style={{ width: `${(selectedQuest.progress[index] / req.amount) * 100}%` }}
                        />
                      </div>
                      <span>{selectedQuest.progress[index]}/{req.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-bold">Награды:</h4>
                {selectedQuest.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {reward.type === 'coins' ? (
                      <Coins className="w-4 h-4" />
                    ) : reward.type === 'research' ? (
                      <Scroll className="w-4 h-4" />
                    ) : reward.type === 'special' ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    <span>{reward.amount} {
                      reward.type === 'coins' ? 'монет' :
                      reward.type === 'research' ? 'очков исследования' :
                      reward.type === 'special' ? 'особая награда' :
                      'особая награда'
                    }</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quests.map(quest => (
              <button
                key={quest.id}
                onClick={() => {
                  setSelectedQuest(quest);
                  if (!quest.completed) setShowStory(true);
                }}
                disabled={!quest.unlocked}
                className={`p-4 rounded-lg text-left ${
                  quest.unlocked
                    ? quest.completed
                      ? darkMode ? 'bg-green-800/30' : 'bg-green-100'
                      : darkMode ? 'bg-purple-800 hover:bg-purple-700' : 'bg-indigo-100 hover:bg-indigo-200'
                    : darkMode ? 'bg-gray-800 opacity-50' : 'bg-gray-200 opacity-50'
                } transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    quest.completed
                      ? darkMode ? 'bg-green-700' : 'bg-green-200'
                      : darkMode ? 'bg-purple-700' : 'bg-indigo-200'
                  }`}>
                    {quest.completed ? (
                      <Shield className="w-6 h-6" />
                    ) : (
                      <Target className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{quest.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                      {quest.description}
                    </p>
                    {quest.completed && !quest.rewardClaimed && (
                      <button
                        onClick={() => onClaimReward(quest.id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-500 hover:bg-green-400 text-white'
                        } transition-colors`}
                      >
                        Забрать награду
                      </button>
                    )}
                    {quest.rewardClaimed && (
                      <span className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Награда получена
                      </span>
                    )}

                    <div className="mt-2 space-y-1">
                      {quest.rewards.map((reward, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {reward.type === 'coins' ? (
                            <Coins className="w-4 h-4 text-yellow-500" />
                          ) : reward.type === 'research' ? (
                            <Scroll className="w-4 h-4 text-blue-500" />
                          ) : reward.type === 'talent' ? (
                            <Star className="w-4 h-4 text-purple-500" />
                          ) : (
                            <Target className="w-4 h-4 text-red-500" />
                          )}
                          <span>{reward.amount} {
                            reward.type === 'coins' ? 'монет' :
                            reward.type === 'research' ? 'очков исследования' :
                            reward.type === 'talent' ? 'очков таланта' :
                            'особая награда'
                          }</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestSystem; 