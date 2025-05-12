import React, { useState, useEffect, useCallback } from 'react';
import { Coins, Sword, Shield, Crown, Sparkles, Zap, Star, Timer, Award, Rocket, RefreshCw, Volume2, VolumeX, Moon, Sun, Cpu, Maximize, Minimize, AlertTriangle, Target, Dog } from 'lucide-react';


interface Upgrade {
  id: string;
  name: string;
  cost: number;
  multiplier: number;
  owned: number;
  icon: React.ReactNode;
  description: string;
  category: 'click' | 'passive' | 'special';
  unlocked: boolean;
  maxOwned?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  condition: (gameState: { totalClicks: number; score: number; upgrades: Upgrade[]; passiveIncome: number; prestigePoints: number; }) => boolean; 
}

interface RandomEvent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  effect: () => (() => void) | void;
  revert: () => void;
}

interface DailyQuest {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  rewardClaimed: boolean;
}

interface Pet {
  id: string;
  name: string;
  level: number;
  experience: number;
  bonus: number;
  bonusType: 'click' | 'passive' | 'criticalChance' | 'criticalMultiplier' | 'autoClickSpeed' | 'prestigePoints';
  ability: string;
  icon: React.ReactNode;
  cost: number;
  owned: boolean;
}

function App() {
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem('gameScore');
    return saved ? parseFloat(saved) : 0;
  });
  const [clickPower, setClickPower] = useState(() => {
    const saved = localStorage.getItem('gameClickPower');
    return saved ? parseInt(saved) : 1;
  });
  const [totalClicks, setTotalClicks] = useState(() => {
    const saved = localStorage.getItem('gameTotalClicks');
    return saved ? parseInt(saved) : 0;
  });
  const [passiveIncome, setPassiveIncome] = useState(() => {
    const saved = localStorage.getItem('gamePassiveIncome');
    return saved ? parseFloat(saved) : 0;
  });
  const [prestigePoints, setPrestigePoints] = useState(() => {
    const saved = localStorage.getItem('gamePrestigePoints');
    return saved ? parseInt(saved) : 0;
  });
  const [prestigeMultiplier, setPrestigeMultiplier] = useState(() => {
    const saved = localStorage.getItem('gamePrestigeMultiplier');
    return saved ? parseFloat(saved) : 1;
  });
  const [prestigeCost, setPrestigeCost] = useState(() => {
    const saved = localStorage.getItem('gamePrestigeCost');
    return saved ? parseFloat(saved) : 10000;
  });
  const [totalEarned, setTotalEarned] = useState(() => {
    const saved = localStorage.getItem('gameTotalEarned');
    return saved ? parseFloat(saved) : 0;
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('gameSoundEnabled');
    return saved ? saved === 'true' : true;
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('gameDarkMode');
    return saved ? saved === 'true' : true;
  });

  const [fullscreen, setFullscreen] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [criticalClick, setCriticalClick] = useState(false);
  const [criticalMultiplier, setCriticalMultiplier] = useState(() => {
     const saved = localStorage.getItem('gameCriticalMultiplier');
     return saved ? parseFloat(saved) : 2;
  });
  const [criticalChance, setCriticalChance] = useState(() => {
     const saved = localStorage.getItem('gameCriticalChance');
     return saved ? parseFloat(saved) : 5;
  });

  const [activeEvent, setActiveEvent] = useState<RandomEvent | null>(null);
  const [eventTimeLeft, setEventTimeLeft] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [autoClickerActive, setAutoClickerActive] = useState(false);
  const [autoClickerSpeed, setAutoClickerSpeed] = useState(() => {
     const saved = localStorage.getItem('gameAutoClickerSpeed');
     return saved ? parseFloat(saved) : 0; 
  });

 
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => {
    const saved = localStorage.getItem('gameDailyQuests');
    const defaultQuests: DailyQuest[] = [
      {
        id: 'clicks',
        name: 'Космический кликер',
        description: 'Сделайте 1000 кликов',
        target: 1000,
        progress: 0,
        reward: 1000,
        completed: false,
        rewardClaimed: false
      },
      {
        id: 'passive',
        name: 'Пассивный доход',
        description: 'Заработайте 5000 монет пассивно',
        target: 5000,
        progress: 0,
        reward: 2000,
        completed: false,
        rewardClaimed: false
      },
      {
        id: 'upgrades',
        name: 'Модернизация',
        description: 'Купите 3 любых улучшения',
        target: 3,
        progress: 0,
        reward: 1500,
        completed: false,
        rewardClaimed: false
      }
    ];
    if (saved) {
      try {
        const parsedQuests = JSON.parse(saved);
        const mergedQuests = defaultQuests.map(defaultQuest => {
          const savedQuest = parsedQuests.find((q: DailyQuest) => q.id === defaultQuest.id);
          return savedQuest ? { 
            ...defaultQuest, 
            progress: savedQuest.progress, 
            completed: savedQuest.completed,
            rewardClaimed: savedQuest.rewardClaimed || false
          } : defaultQuest;
        });
        return mergedQuests;
      } catch (e) {
        console.error("Error parsing daily quests:", e);
        return defaultQuests;
      }
    }
    return defaultQuests;
  });

  const [comboMultiplier, setComboMultiplier] = useState(() => {
    const saved = localStorage.getItem('gameComboMultiplier');
    return saved ? parseFloat(saved) : 1;
  });

  const [comboTimer, setComboTimer] = useState(() => {
    const saved = localStorage.getItem('gameComboTimer');
    return saved ? parseInt(saved) : 0;
  });

  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('gamePets');
    const defaultPets: Pet[] = [
      {
        id: 'cosmic_cat',
        name: 'Космический кот',
        level: 1,
        experience: 0,
        bonus: 0.1, // +10% к силе клика
        bonusType: 'click',
        ability: 'Увеличивает силу клика',
        icon: <Dog className="w-6 h-6" />,
        cost: 100,
        owned: false
      },
      {
        id: 'star_dog',
        name: 'Звёздный пёс',
        level: 1,
        experience: 0,
        bonus: 0.1, // +10% к пассивному доходу
        bonusType: 'passive',
        ability: 'Увеличивает пассивный доход',
        icon: <Dog className="w-6 h-6" />,
        cost: 250,
        owned: false
      },
      {
        id: 'crit_sprite',
        name: 'Крит-Спрайт',
        level: 1,
        experience: 0,
        bonus: 0.05, // +5% к шансу крит. клика
        bonusType: 'criticalChance',
        ability: 'Увеличивает шанс критического клика',
        icon: <Zap className="w-6 h-6" />,
        cost: 500,
        owned: false
      },
      {
        id: 'multiplier_guardian',
        name: 'Хранитель Множителя',
        level: 1,
        experience: 0,
        bonus: 0.1, // +10% к множителю крит. клика
        bonusType: 'criticalMultiplier',
        ability: 'Увеличивает множитель критического клика',
        icon: <AlertTriangle className="w-6 h-6" />,
        cost: 750,
        owned: false
      },
       {
        id: 'auto_bot',
        name: 'Авто-Бот',
        level: 1,
        experience: 0,
        bonus: 1, // +1 к скорости автокликера
        bonusType: 'autoClickSpeed',
        ability: 'Увеличивает скорость автокликера',
        icon: <RefreshCw className="w-6 h-6" />,
        cost: 1000,
        owned: false,
      },
       {
        id: 'prestige_ghost',
        name: 'Призрак Престижа',
        level: 1,
        experience: 0,
        bonus: 0.15, // +15% к потенциальным очкам престижа
        bonusType: 'prestigePoints',
        ability: 'Увеличивает количество получаемых очков престижа',
        icon: <Sparkles className="w-6 h-6" />,
        cost: 5000,
        owned: false,
      },
       {
        id: 'lucky_charm',
        name: 'Талисман Удачи',
        level: 1,
        experience: 0,
        bonus: 0.03, // +3% к шансу критического клика
        bonusType: 'criticalChance',
        ability: 'Немного увеличивает шанс критического клика',
        icon: <Star className="w-6 h-6" />,
        cost: 2000,
        owned: false,
      },
      {
        id: 'golden_retriever',
        name: 'Золотой Ретривер',
        level: 1,
        experience: 0,
        bonus: 0.25, // +25% к силе клика
        bonusType: 'click',
        ability: 'Значительно увеличивает силу клика',
        icon: <Dog className="w-6 h-6" />,
        cost: 3000,
        owned: false,
      },
      {
        id: 'void_cat',
        name: 'Кошка Пустоты',
        level: 1,
        experience: 0,
        bonus: 0.2, // +0.2x к множителю крит. клика
        bonusType: 'criticalMultiplier',
        ability: 'Увеличивает урон критических кликов',
        icon: <Zap className="w-6 h-6" />,
        cost: 4000,
        owned: false,
      }
    ];
    if (saved) {
      try {
         const parsedPets = JSON.parse(saved);
         const mergedPets = defaultPets.map(defaultPet => {
           const savedPet = parsedPets.find((p: Pet) => p.id === defaultPet.id);
           return savedPet ? { ...defaultPet, ...savedPet, icon: defaultPet.icon } : defaultPet;
         });
         return mergedPets;
      } catch (e) {
         console.error("Error parsing pets:", e);
         return defaultPets;
      }
    }
    return defaultPets;
  });

  const [activePet, setActivePet] = useState<Pet | null>(() => {
    const saved = localStorage.getItem('gameActivePet');
    if (saved) {
      try {
        const parsedActivePet = JSON.parse(saved);
        return pets.find(p => p.id === parsedActivePet.id) || null;
      } catch (e) {
         console.error("Error parsing active pet:", e);
         return null;
      }
    }
    return null;
  });

  const [showDailyQuests, setShowDailyQuests] = useState(false);
  const [showPets, setShowPets] = useState(false);

  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('gameUpgrades');
    const defaultUpgrades = [
      {
        id: 'sword',
        name: 'Космический меч',
        cost: 10,
        multiplier: 1,
        owned: 0,
        icon: <Sword className="w-6 h-6" />,
        description: 'Увеличивает силу клика на 1',
        category: 'click',
        unlocked: true
      },
      {
        id: 'shield',
        name: 'Щит астронавта',
        cost: 50,
        multiplier: 5,
        owned: 0,
        icon: <Shield className="w-6 h-6" />,
        description: 'Увеличивает силу клика на 5',
        category: 'click',
        unlocked: true
      },
      {
        id: 'crown',
        name: 'Корона галактики',
        cost: 200,
        multiplier: 10,
        owned: 0,
        icon: <Crown className="w-6 h-6" />,
        description: 'Увеличивает силу клика на 10',
        category: 'click',
        unlocked: true
      },
      {
        id: 'star',
        name: 'Звезда удачи',
        cost: 500,
        multiplier: 2,
        owned: 0,
        icon: <Star className="w-6 h-6" />,
        description: 'Добавляет пассивный доход +2/сек',
        category: 'passive',
        unlocked: true
      },
      {
        id: 'rocket',
        name: 'Ракетный ускоритель',
        cost: 1000,
        multiplier: 5,
        owned: 0,
        icon: <Rocket className="w-6 h-6" />,
        description: 'Добавляет пассивный доход +5/сек',
        category: 'passive',
        unlocked: true
      },
      {
        id: 'cpu',
        name: 'Квантовый процессор',
        cost: 2500,
        multiplier: 15,
        owned: 0,
        icon: <Cpu className="w-6 h-6" />,
        description: 'Добавляет пассивный доход +15/сек',
        category: 'passive',
        unlocked: true
      },
      {
        id: 'critical',
        name: 'Критический удар',
        cost: 1500,
        multiplier: 1,
        owned: 0,
        icon: <Zap className="w-6 h-6" />,
        description: 'Увеличивает шанс критического клика на 5%',
        category: 'special',
        unlocked: true,
        maxOwned: 5
      },
      {
        id: 'critpower',
        name: 'Сила критического удара',
        cost: 3000,
        multiplier: 0.5,
        owned: 0,
        icon: <AlertTriangle className="w-6 h-6" />,
        description: 'Увеличивает множитель критического клика на 0.5x',
        category: 'special',
        unlocked: true,
        maxOwned: 6
      },
      {
        id: 'autoclicker',
        name: 'Автокликер',
        cost: 5000,
        multiplier: 1,
        owned: 0,
        icon: <RefreshCw className="w-6 h-6" />,
        description: 'Автоматически кликает 1 раз в секунду',
        category: 'special',
        unlocked: true,
        maxOwned: 10
      },
    ];

    if (saved) {
      try {
        const parsedUpgrades = JSON.parse(saved);
        return parsedUpgrades.map((upgrade: Upgrade) => ({
          ...upgrade,
          unlocked: true,
          icon: 
            upgrade.id === 'sword' ? <Sword className="w-6 h-6" /> :
            upgrade.id === 'shield' ? <Shield className="w-6 h-6" /> :
            upgrade.id === 'crown' ? <Crown className="w-6 h-6" /> :
            upgrade.id === 'star' ? <Star className="w-6 h-6" /> :
            upgrade.id === 'rocket' ? <Rocket className="w-6 h-6" /> :
            upgrade.id === 'cpu' ? <Cpu className="w-6 h-6" /> :
            upgrade.id === 'critical' ? <Zap className="w-6 h-6" /> :
            upgrade.id === 'critpower' ? <AlertTriangle className="w-6 h-6" /> :
            upgrade.id === 'autoclicker' ? <RefreshCw className="w-6 h-6" /> :
            <Star className="w-6 h-6" />
        }));
      } catch (e) {
        console.error("Error parsing upgrades:", e);
        return defaultUpgrades;
      }
    }
    return defaultUpgrades;
  });


  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('gameAchievements');
    const defaultAchievements: Achievement[] = [
      {
        id: 'firstClick',
        name: 'Первый контакт',
        description: 'Сделайте свой первый клик',
        icon: <Sparkles className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.totalClicks >= 1
      },
      {
        id: 'click100',
        name: 'Начинающий исследователь',
        description: 'Сделайте 100 кликов',
        icon: <Zap className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.totalClicks >= 100
      },
      {
        id: 'click1000',
        name: 'Опытный космонавт',
        description: 'Сделайте 1,000 кликов',
        icon: <Award className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.totalClicks >= 1000
      },
      {
        id: 'score100',
        name: 'Первые сбережения',
        description: 'Накопите 100 монет',
        icon: <Coins className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.score >= 100
      },
      {
        id: 'score1000',
        name: 'Космический капиталист',
        description: 'Накопите 1,000 монет',
        icon: <Coins className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.score >= 1000
      },
      {
        id: 'score10000',
        name: 'Галактический магнат',
        description: 'Накопите 10,000 монет',
        icon: <Coins className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.score >= 10000
      },
      {
        id: 'upgrade5',
        name: 'Модернизация',
        description: 'Купите 5 любых улучшений',
        icon: <Sword className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.upgrades.reduce((total, upgrade) => total + upgrade.owned, 0) >= 5
      },
      {
        id: 'upgrade20',
        name: 'Коллекционер технологий',
        description: 'Купите 20 любых улучшений',
        icon: <Cpu className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.upgrades.reduce((total, upgrade) => total + upgrade.owned, 0) >= 20
      },
      {
        id: 'passive10',
        name: 'Пассивный доход',
        description: 'Достигните пассивного дохода 10/сек',
        icon: <Timer className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.passiveIncome >= 10
      },
      {
        id: 'prestige1',
        name: 'Новое начало',
        description: 'Выполните первый престиж',
        icon: <RefreshCw className="w-6 h-6" />,
        unlocked: false,
        condition: (gameState) => gameState.prestigePoints >= 1
      }
    ];

    if (saved) {
      try {
        const parsedAchievements = JSON.parse(saved);
        return defaultAchievements.map((defaultAchievement) => ({
          ...defaultAchievement,
          unlocked: parsedAchievements.find((a: Achievement) => a.id === defaultAchievement.id)?.unlocked || false,
          condition: defaultAchievement.condition,
          icon: defaultAchievement.icon
        }));
      } catch (e) {
        console.error("Error parsing achievements:", e);
        return defaultAchievements;
      }
    }
    return defaultAchievements;
  });

  const randomEvents: RandomEvent[] = [
    {
      id: 'meteor_shower',
      name: 'Метеоритный дождь',
      description: 'Сила клика удвоена на 30 секунд!',
      icon: <Star className="w-6 h-6" />,
      duration: 30,
      effect: () => {
        const originalClickPower = clickPower;
        setClickPower(prev => prev * 2);
        return () => setClickPower(originalClickPower);
      },
      revert: () => {
      }
    },
    {
      id: 'cosmic_ray',
      name: 'Космический луч',
      description: 'Пассивный доход утроен на 20 секунд!',
      icon: <Zap className="w-6 h-6" />,
      duration: 20,
      effect: () => {
        const originalPassiveIncome = passiveIncome;
        setPassiveIncome(prev => prev * 3);
         return () => setPassiveIncome(originalPassiveIncome);
      },
      revert: () => {
      }
    },
    {
      id: 'black_hole',
      name: 'Черная дыра',
      description: 'Критический шанс увеличен до 50% на 15 секунд!',
      icon: <AlertTriangle className="w-6 h-6" />,
      duration: 15,
      effect: () => {
        const originalCriticalChance = criticalChance;
        setCriticalChance(50);
        return () => setCriticalChance(originalCriticalChance);
      },
      revert: () => {
      }
    }
  ];


  useEffect(() => {
    if (passiveIncome <= 0) return;

    const timer = setInterval(() => {
       setScore(prev => {
        const income = passiveIncome * prestigeMultiplier;
        const newScore = prev + income;
        setDailyQuests(prevQuests => {
            return prevQuests.map(quest => {
              if (quest.id === 'passive' && !quest.completed) {
                const newProgress = Math.min(quest.progress + income, quest.target);
                if (newProgress >= quest.target) {
                   return { ...quest, progress: newProgress, completed: true };
                }
                return { ...quest, progress: newProgress };
              }
              return quest;
            });
          });

        setTotalEarned(totalEarnedPrev => totalEarnedPrev + income);

        return newScore;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [passiveIncome, prestigeMultiplier]); 
  const handleCombo = () => {
    setComboTimer(5);
    setComboMultiplier(prev => Math.min(prev + 0.1, 3.0));
  };


  useEffect(() => {
    if (comboTimer > 0) {
      const timer = setInterval(() => {
        setComboTimer(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setComboMultiplier(1);
    }
  }, [comboTimer]);

 
  const handleClick = useCallback((manual = true) => {
    let clickValue = clickPower * prestigeMultiplier * comboMultiplier;

    
    let currentCriticalChance = criticalChance;
    let currentCriticalMultiplier = criticalMultiplier;

    if (activePet) {
        switch (activePet.bonusType) {
            case 'click':
                clickValue *= (1 + activePet.bonus);
                break;
            case 'passive': 
                break;
            case 'criticalChance':
                 currentCriticalChance += (activePet.bonus * 100);
                break;
            case 'criticalMultiplier':
                 currentCriticalMultiplier += activePet.bonus;
                break;
             case 'autoClickSpeed':
                break;
            case 'prestigePoints':
                 break;
        }
    }

    let isCritical = false;


    if (Math.random() * 100 < currentCriticalChance) {
      clickValue *= currentCriticalMultiplier;
      isCritical = true;
      setCriticalClick(true);
      setTimeout(() => setCriticalClick(false), 300);
    }

    setScore(prev => prev + clickValue);
    setTotalEarned(prev => prev + clickValue);

    if (manual) {
      setTotalClicks(prev => prev + 1);
      handleCombo();
      setDailyQuests(prevQuests => {
        return prevQuests.map(quest => {
          if (quest.id === 'clicks' && !quest.completed) {
             const newProgress = Math.min(quest.progress + 1, quest.target);
            if (newProgress >= quest.target) {
              return { ...quest, progress: newProgress, completed: true };
            }
            return { ...quest, progress: newProgress };
          }
          return quest;
        });
      });
    }

    if (soundEnabled) {
      playSound(isCritical ? 'critical' : 'click');
    }
    if (manual) {
      const sparkle = document.createElement('div');
      sparkle.className = isCritical ? 'sparkle critical' : 'sparkle';
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      sparkle.style.left = `calc(50% + ${x}px)`;
      sparkle.style.top = `calc(50% + ${y}px)`;
      document.getElementById('click-button')?.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }

  }, [clickPower, prestigeMultiplier, comboMultiplier, activePet, criticalChance, criticalMultiplier, soundEnabled, setDailyQuests, setScore, setTotalEarned, setTotalClicks, handleCombo]); 
  useEffect(() => {
    const autoClickBonusSpeed = activePet && activePet.bonusType === 'autoClickSpeed' ? activePet.bonus : 0;
    const currentAutoClickSpeed = autoClickerSpeed + autoClickBonusSpeed;
    if (autoClickerActive && currentAutoClickSpeed > 0) {
      const timer = setInterval(() => {
        handleClick(false);
      }, 1000 / currentAutoClickSpeed);

      return () => clearInterval(timer);
    } else if (!autoClickerActive && currentAutoClickSpeed > 0) {
       // мяу мяу
       // мяу мяу
    }

  }, [autoClickerActive, autoClickerSpeed, activePet, handleClick]); 
  useEffect(() => {
    const checkAchievements = () => {
      let newUnlocked = false;
      const updatedAchievements = achievements.map(achievement => {
        if (!achievement.unlocked && achievement.condition({ totalClicks, score, upgrades, passiveIncome, prestigePoints })) {
          newUnlocked = true;
          return { ...achievement, unlocked: true };
        }
        return achievement;
      });
      const achievementsChanged = updatedAchievements.some((ach, index) => ach.unlocked !== achievements[index].unlocked);
      if (achievementsChanged) {
         setAchievements(updatedAchievements);
         const newlyUnlocked = updatedAchievements.find((ach, index) => ach.unlocked && !achievements[index].unlocked);
         if(newlyUnlocked) setNewAchievement(newlyUnlocked);
         if (newUnlocked && soundEnabled) {
           playSound('achievement');
         }
      }
    };
    checkAchievements();
  }, [totalClicks, score, passiveIncome, upgrades, prestigePoints, soundEnabled, achievements, setNewAchievement]); 
  useEffect(() => {
    const startRandomEvent = () => {
        if (!activeEvent) {
            const randomIndex = Math.floor(Math.random() * randomEvents.length);
            const event = randomEvents[randomIndex];
            setActiveEvent(event);
            setEventTimeLeft(event.duration);
            const cleanup = event.effect();
            setActiveEvent(prev => prev ? { ...prev, revert: cleanup || prev.revert } : null);
            if (soundEnabled) {
              playSound('event');
            }
        }
    };

    const eventTimer = setInterval(() => {
       if (!activeEvent) {
         startRandomEvent();
       }
    }, 1000);

    return () => clearInterval(eventTimer);
  }, [activeEvent, randomEvents, soundEnabled, clickPower, passiveIncome, criticalChance]);


  useEffect(() => {
    if (activeEvent && eventTimeLeft > 0) {
      const timer = setInterval(() => {
        setEventTimeLeft(prev => {
          if (prev <= 1) {
            if (activeEvent.revert && typeof activeEvent.revert === 'function') {
                 activeEvent.revert();
            } else {
                 const eventDefinition = randomEvents.find(e => e.id === activeEvent.id);
                 if (eventDefinition) eventDefinition.revert();
            }

            setActiveEvent(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeEvent, eventTimeLeft, randomEvents]);
  useEffect(() => {
    if (newAchievement) {
      const timer = setTimeout(() => {
        setNewAchievement(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [newAchievement]);


  const playSound = (type: 'click' | 'buy' | 'achievement' | 'event' | 'critical') => {
    if (!soundEnabled) return;
    console.log(`Playing sound: ${type}`);
  };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };
  const purchaseUpgrade = useCallback((upgradeId: string) => {
    setUpgrades(prevUpgrades => {
      const newUpgrades = prevUpgrades.map(upgrade => {
        if (upgrade.id === upgradeId && score >= upgrade.cost) {
          if (upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned) {
            return upgrade;
          }

          const newCost = Math.floor(upgrade.cost * 1.5);
          const newOwned = upgrade.owned + 1;

          setScore(prev => prev - upgrade.cost);
          if (upgrade.category === 'passive') {
            setPassiveIncome(prev => prev + upgrade.multiplier);
          } else if (upgrade.category === 'click') {
            setClickPower(prev => prev + upgrade.multiplier);
          } else if (upgrade.category === 'special') {
            if (upgrade.id === 'critical') {
              setCriticalChance(prev => prev + 5);
            } else if (upgrade.id === 'critpower') {
              setCriticalMultiplier(prev => prev + 0.5);
            } else if (upgrade.id === 'autoclicker') {
              setAutoClickerSpeed(prev => prev + 1);
            }
          }
          setDailyQuests(prevQuests => {
            return prevQuests.map(quest => {
              if (quest.id === 'upgrades' && !quest.completed) {
                 const newProgress = Math.min(quest.progress + 1, quest.target);
                if (newProgress >= quest.target) {
                  return { ...quest, progress: newProgress, completed: true };
                }
                return { ...quest, progress: newProgress };
              }
              return quest;
            });
          });

          if (soundEnabled) {
            playSound('buy');
          }

          return {
            ...upgrade,
            owned: newOwned,
            cost: newCost,
          };
        }
        return upgrade;
      });
      return newUpgrades;
    });
  }, [score, soundEnabled, setPassiveIncome, setClickPower, setCriticalChance, setCriticalMultiplier, setAutoClickerSpeed, setDailyQuests, setScore]);
  
  const purchasePet = useCallback((petId: string) => {
    setPets(prevPets => {
      const newPets = prevPets.map(pet => {
        if (pet.id === petId && !pet.owned && score >= pet.cost) {
          setScore(prev => prev - pet.cost);
           if (soundEnabled) {
            playSound('buy');
          }
          return { ...pet, owned: true };
        }
        return pet;
      });
      return newPets;
    });
  }, [score, soundEnabled, setScore, setPets]);
  const performPrestige = () => {
    if (score < prestigeCost) {
      return;
    }
    const newPrestigePoints = Math.floor(Math.sqrt(totalEarned / 1000));

    if (newPrestigePoints < 1) {
      return;
    }

    setPrestigePoints(prev => prev + newPrestigePoints);
    setPrestigeMultiplier(prev => prev + newPrestigePoints * 0.1);
    setPrestigeCost(prev => Math.floor(prev * 1.5));
    setScore(0);
    setClickPower(1);
    setPassiveIncome(0);
    setCriticalChance(5);
    setCriticalMultiplier(2);
    setAutoClickerSpeed(0);
    setAutoClickerActive(false);
    setUpgrades(prevUpgrades => {
      return prevUpgrades.map(upgrade => ({
        ...upgrade,
        owned: 0,
        cost: upgrade.id === 'sword' ? 10 :
              upgrade.id === 'shield' ? 50 :
              upgrade.id === 'crown' ? 200 :
              upgrade.id === 'star' ? 500 :
              upgrade.id === 'rocket' ? 1000 :
              upgrade.id === 'cpu' ? 2500 :
              upgrade.id === 'critical' ? 1500 :
              upgrade.id === 'critpower' ? 3000 :
              upgrade.id === 'autoclicker' ? 5000 :
              upgrade.cost
      }));
    });

    setShowPrestige(false);

    if (soundEnabled) {
      playSound('event');
    }
  };
  const calculatePotentialPrestigePoints = () => {
    const prestigeBonus = (activePet && activePet.bonusType === 'prestigePoints') ? activePet.bonus : 0;
    return Math.floor(Math.sqrt(totalEarned / 1000) * (1 + prestigeBonus));
  };
  const canPerformPrestige = () => {
    return score >= prestigeCost && calculatePotentialPrestigePoints() >= 1;
  };
  const filteredUpgrades = upgrades.filter(upgrade => {
    if (!upgrade.unlocked) return false;
    if (activeTab === 'all') return true;
    return upgrade.category === activeTab;
  });
  const achievementPercentage = Math.floor((achievements.filter(a => a.unlocked).length / achievements.length) * 100);
  const buttonBaseClass = `p-3 rounded-lg ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors flex flex-col items-center gap-1 w-[80px] h-[80px] justify-center`;
  const iconClass = "w-7 h-7";
  const claimQuestReward = useCallback((questId: string) => {
    setDailyQuests(prevQuests => {
      return prevQuests.map(quest => {
        if (quest.id === questId && quest.completed && !quest.rewardClaimed) {
          setScore(prev => prev + quest.reward);
          
          if (soundEnabled) {
            playSound('achievement');
          }
          return { ...quest, rewardClaimed: true };
        }
        return quest;
      });
    });
  }, [setScore, soundEnabled]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white' : 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen flex flex-col">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2 ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
            <Sparkles className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-purple-300' : 'text-purple-500'}`} />
            Космический Кликер
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-2xl mx-auto mb-4 sm:mb-8">
            <div className={`${darkMode ? 'bg-purple-800/30' : 'bg-white/50'} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Coins className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <div className="text-lg sm:text-xl font-bold">{Math.floor(score)}</div>
              <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Монет</div>
            </div>

            <div className={`${darkMode ? 'bg-purple-800/30' : 'bg-white/50'} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Zap className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              <div className="text-lg sm:text-xl font-bold">{clickPower} x{prestigeMultiplier.toFixed(1)}</div>
              <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Сила клика</div>
            </div>

            <div className={`${darkMode ? 'bg-purple-800/30' : 'bg-white/50'} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Timer className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
              <div className="text-lg sm:text-xl font-bold">{passiveIncome}/сек</div>
              <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Пассивный доход</div>
            </div>

            <div className={`${darkMode ? 'bg-purple-800/30' : 'bg-white/50'} backdrop-blur-sm rounded-lg p-2 sm:p-4 flex flex-col items-center`}>
              <Award className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-500'}`} />
              <div className="text-lg sm:text-xl font-bold">{prestigePoints}</div>
              <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Очки престижа</div>
            </div>
          </div>
          {comboMultiplier > 1 && (
            <div className={`fixed top-4 right-4 ${darkMode ? 'bg-purple-700' : 'bg-purple-200'} p-2 rounded-lg animate-pulse`}>
              <div className="font-bold">Комбо x{comboMultiplier.toFixed(1)}</div>
              <div className="text-sm">Осталось {comboTimer}с</div>
            </div>
          )}
          <div className="flex justify-center gap-3 mb-4">
            <div className="flex gap-3">
              <button
                onClick={() => setShowAchievements(true)}
                className={buttonBaseClass}
                title="Достижения"
              >
                <Award className={iconClass} />
                <span className="text-xs">Достижения</span>
              </button>
              <button
                onClick={() => setShowPrestige(true)}
                className={buttonBaseClass}
                title="Престиж"
              >
                <RefreshCw className={iconClass} />
                <span className="text-xs">Престиж</span>
              </button>
            </div>
            <div className="relative group">
              <button
                className={buttonBaseClass}
                title="Дополнительно"
              >
                <Sparkles className={iconClass} />
                <span className="text-xs">Функции</span>
              </button>

              <div className={`absolute top-full right-0 mt-2 ${darkMode ? 'bg-purple-800' : 'bg-white'} rounded-lg shadow-xl p-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                <button
                  onClick={() => setShowDailyQuests(true)}
                  className={`w-full p-2 rounded-lg mb-1 flex items-center gap-3 ${darkMode ? 'hover:bg-purple-700' : 'hover:bg-indigo-100'} transition-colors`}
                >
                  <Target className="w-6 h-6" />
                  <span>Задания</span>
                </button>
                <button
                  onClick={() => setShowPets(true)}
                  className={`w-full p-2 rounded-lg mb-1 flex items-center gap-3 ${darkMode ? 'hover:bg-purple-700' : 'hover:bg-indigo-100'} transition-colors`}
                >
                  <Dog className="w-6 h-6" />
                  <span>Питомцы</span>
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={buttonBaseClass}
                title={soundEnabled ? "Выключить звук" : "Включить звук"}
              >
                {soundEnabled ? <Volume2 className={iconClass} /> : <VolumeX className={iconClass} />}
                <span className="text-xs">Звук</span>
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={buttonBaseClass}
                title={darkMode ? "Светлая тема" : "Тёмная тема"}
              >
                {darkMode ? <Sun className={iconClass} /> : <Moon className={iconClass} />}
                <span className="text-xs">Тема</span>
              </button>
              <button
                onClick={toggleFullscreen}
                className={buttonBaseClass}
                title={fullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
              >
                {fullscreen ? <Minimize className={iconClass} /> : <Maximize className={iconClass} />}
                <span className="text-xs">Экран</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 max-w-4xl mx-auto w-full">
          <div className="flex-1 flex items-center justify-center">
            <button
              id="click-button"
              onClick={() => handleClick()}
              className={`w-full max-w-[300px] lg:max-w-none aspect-square rounded-2xl ${
                darkMode
                  ? 'bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600'
              } transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-purple-400/20 to-transparent' : 'bg-gradient-to-br from-indigo-300/20 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="text-center relative z-10">
                <Sparkles className={`w-16 h-16 sm:w-20 sm:h-20 mb-2 mx-auto animate-pulse ${criticalClick ? 'text-yellow-300 scale-150' : darkMode ? 'text-purple-200' : 'text-purple-100'} transition-all duration-300`} />
                <span className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-purple-100' : 'text-white'}`}>КЛИК!</span>
              </div>
            </button>
          </div>
          <div className="flex-1">
            <div className={`${darkMode ? 'bg-purple-800/20' : 'bg-white/30'} backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-xl h-full`}>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>Улучшения</h2>
              <div className="flex mb-3 space-x-2 text-sm">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === 'all'
                      ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white')
                      : (darkMode ? 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200')
                  }`}
                >
                  Все
                </button>
                <button
                  onClick={() => setActiveTab('click')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === 'click'
                      ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white')
                      : (darkMode ? 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200')
                  }`}
                >
                  Клик
                </button>
                <button
                  onClick={() => setActiveTab('passive')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === 'passive'
                      ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white')
                      : (darkMode ? 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200')
                  }`}
                >
                  Пассив
                </button>
                <button
                  onClick={() => setActiveTab('special')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeTab === 'special'
                      ? (darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white')
                      : (darkMode ? 'bg-purple-800/50 text-purple-300 hover:bg-purple-700/50' : 'bg-purple-100 text-purple-700 hover:bg-purple-200')
                  }`}
                >
                  Особые
                </button>
              </div>
              <div className="space-y-2 sm:space-y-3 overflow-y-auto max-h-[300px] lg:max-h-[400px] pr-2">
                {filteredUpgrades.length > 0 ? (
                  filteredUpgrades.map((upgrade) => (
                    <button
                      key={upgrade.id}
                      onClick={() => purchaseUpgrade(upgrade.id)}
                      disabled={score < upgrade.cost || (upgrade.maxOwned !== undefined && upgrade.owned >= upgrade.maxOwned)}
                      className={`w-full p-3 sm:p-4 rounded-lg flex items-center justify-between ${
                        score >= upgrade.cost && (!upgrade.maxOwned || upgrade.owned < upgrade.maxOwned)
                          ? (darkMode ? 'bg-purple-700/50 hover:bg-purple-600/50' : 'bg-purple-200/70 hover:bg-purple-300/70')
                          : (darkMode ? 'bg-gray-800/50 cursor-not-allowed opacity-50' : 'bg-gray-200/50 cursor-not-allowed opacity-50')
                      } transition-all duration-200 group`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 ${darkMode ? 'bg-purple-800/50 group-hover:bg-purple-700/50' : 'bg-purple-300/50 group-hover:bg-purple-400/50'} rounded-lg transition-colors`}>
                          {upgrade.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm sm:text-base">{upgrade.name}</div>
                          <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            {upgrade.description}
                          </div>
                          <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                            Куплено: {upgrade.owned}{upgrade.maxOwned ? `/${upgrade.maxOwned}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 ${darkMode ? 'bg-purple-900/50' : 'bg-purple-100/70'} px-2 sm:px-3 py-1 rounded-full text-sm sm:text-base`}>
                        <Coins className={`w-3 h-3 sm:w-4 sm:h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        {upgrade.cost}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className={`text-center p-4 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Нет доступных улучшений в этой категории
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {activeEvent && (
          <div className={`fixed bottom-4 left-4 right-4 ${darkMode ? 'bg-purple-700' : 'bg-indigo-100'} p-3 rounded-lg shadow-lg max-w-md mx-auto flex items-center gap-3 animate-pulse`}>
            <div className={`p-2 rounded-full ${darkMode ? 'bg-purple-600' : 'bg-indigo-200'}`}>
              {activeEvent.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold">{activeEvent.name}</div>
              <div className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>{activeEvent.description}</div>
            </div>
            <div className={`text-lg font-bold ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>{eventTimeLeft}с</div>
          </div>
        )}
        {newAchievement && (
          <div className={`fixed top-4 left-4 right-4 ${darkMode ? 'bg-yellow-600' : 'bg-yellow-100'} p-3 rounded-lg shadow-lg max-w-md mx-auto flex items-center gap-3 animate-bounce`}>
            <div className={`p-2 rounded-full ${darkMode ? 'bg-yellow-500' : 'bg-yellow-200'}`}>
              {newAchievement.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold">Новое достижение!</div>
              <div className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>{newAchievement.name}</div>
            </div>
          </div>
        )}
        {showAchievements && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-purple-900' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col`}>
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Award className="w-6 h-6" /> Достижения ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                </h2>
                <button onClick={() => setShowAchievements(false)} className="text-2xl">&times;</button>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <div className="mb-4 w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${achievementPercentage}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {achievements.map(achievement => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg ${
                        achievement.unlocked
                          ? (darkMode ? 'bg-purple-700' : 'bg-purple-100')
                          : (darkMode ? 'bg-gray-800 opacity-70' : 'bg-gray-200 opacity-70')
                      } flex items-center gap-3`}
                    >
                      <div className={`p-2 rounded-full ${
                        achievement.unlocked
                          ? (darkMode ? 'bg-purple-600 text-yellow-300' : 'bg-purple-200 text-yellow-600')
                          : (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-500')
                      }`}>
                        {achievement.icon}
                      </div>
                      <div>
                        <div className="font-bold">{achievement.name}</div>
                        <div className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-700">
                <button
                  onClick={() => setShowAchievements(false)}
                  className={`w-full py-2 rounded-lg ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-purple-500 hover:bg-purple-400'} text-white transition-colors`}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
        {showPrestige && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-purple-900' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col`}>
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <RefreshCw className="w-6 h-6" /> Система престижа
                </h2>
                <button onClick={() => setShowPrestige(false)} className="text-2xl">&times;</button>
              </div>

              <div className="p-4">
                <p className="mb-4">Престиж позволяет сбросить прогресс, но получить постоянный множитель ко всем доходам.</p>

                <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-800' : 'bg-purple-100'} mb-4`}>
                  <div className="flex justify-between items-center mb-2">
                    <span>Текущий множитель:</span>
                    <span className="font-bold">x{prestigeMultiplier.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Очки престижа:</span>
                    <span className="font-bold">{prestigePoints}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Стоимость престижа:</span>
                    <span className="font-bold">{prestigeCost} монет</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Потенциальные очки:</span>
                    <span className="font-bold">{calculatePotentialPrestigePoints()}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    При престиже вы получите <strong>{calculatePotentialPrestigePoints()}</strong> очков престижа и увеличите множитель на <strong>+{(calculatePotentialPrestigePoints() * 0.1).toFixed(1)}x</strong>.
                  </p>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    Для престижа требуется <strong>{prestigeCost}</strong> монет. После престижа весь прогресс будет сброшен, но множитель сохранится навсегда!
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPrestige(false)}
                    className={`flex-1 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-200'} transition-colors`}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={performPrestige}
                    disabled={!canPerformPrestige()}
                    className={`flex-1 py-2 rounded-lg ${
                      canPerformPrestige()
                        ? (darkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-500 hover:bg-purple-400')
                        : (darkMode ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gray-300 cursor-not-allowed opacity-50')
                    } text-white transition-colors`}
                  >
                    Престиж
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showDailyQuests && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-purple-900' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full overflow-hidden`}>
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-6 h-6" /> Ежедневные задания
                </h2>
                <button onClick={() => setShowDailyQuests(false)} className="text-2xl">&times;</button>
              </div>

              <div className="p-4 space-y-4">
                {dailyQuests.map(quest => (
                  <div
                    key={quest.id}
                    className={`${darkMode ? 'bg-purple-800' : 'bg-purple-100'} p-4 rounded-lg`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{quest.name}</h3>
                        <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          {quest.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                        <span>{quest.reward}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${quest.completed ? 'bg-green-400' : 'bg-blue-400'}`}
                        style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm">
                        {quest.progress}/{quest.target}
                      </div>
                      {quest.completed && !quest.rewardClaimed && (
                        <button
                          onClick={() => claimQuestReward(quest.id)}
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showPets && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-purple-900' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full overflow-hidden`}>
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Dog className="w-6 h-6" /> Питомцы
                </h2>
                <button onClick={() => setShowPets(false)} className="text-2xl">&times;</button>
              </div>

              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {pets.map(pet => (
                  <div
                    key={pet.id}
                    className={`${darkMode ? 'bg-purple-800' : 'bg-purple-100'} p-4 rounded-lg flex items-center gap-4`}
                  >
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-700' : 'bg-purple-200'}`}>
                      {pet.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{pet.name}</h3>
                      <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        {pet.ability}
                      </p>
                      <div className="text-sm">
                         Бонус: {pet.bonusType === 'criticalChance' ? `+${(pet.bonus * 100).toFixed(0)}% к шансу` :
                                 pet.bonusType === 'criticalMultiplier' ? `+${pet.bonus.toFixed(1)}x к множителю` :
                                 pet.bonusType === 'autoClickSpeed' ? `+${pet.bonus} к скорости автокликера` :
                                 pet.bonusType === 'prestigePoints' ? `+${(pet.bonus * 100).toFixed(0)}% к престижу` :
                                 `+${(pet.bonus * 100).toFixed(0)}% к ${pet.bonusType === 'click' ? 'клику' : 'пассивному доходу'}`}
                      </div>
                      <div className="text-sm">Уровень: {pet.level}</div>
                    </div>
                    <div>
                      {pet.owned ? (
                         <button
                          onClick={() => setActivePet(pet)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            activePet?.id === pet.id
                              ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white')
                              : (darkMode ? 'bg-purple-700 text-purple-200 hover:bg-purple-600' : 'bg-purple-200 text-purple-800 hover:bg-purple-300')
                          } transition-colors`}
                          disabled={activePet?.id === pet.id}
                        >
                          {activePet?.id === pet.id ? 'Активен' : 'Выбрать'}
                        </button>
                      ) : (
                         <button
                           onClick={() => purchasePet(pet.id)}
                           disabled={score < pet.cost}
                           className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                             score >= pet.cost
                               ? (darkMode ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-yellow-400 hover:bg-yellow-500 text-white')
                               : (darkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-600 cursor-not-allowed')
                           } transition-colors`}
                         >
                           <Coins className="w-4 h-4" /> {pet.cost}
                         </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* по рофлу */}
      <style>
        {`
        .sparkle {
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          pointer-events: none;
          animation: sparkle-animation 1s ease-out forwards;
        }
        
        .sparkle.critical {
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0) 70%);
          animation: critical-animation 1s ease-out forwards;
        }
        
        @keyframes sparkle-animation {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes critical-animation {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(2);
            opacity: 0.7;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        `}
      </style>
    </div>
  );
}

export default App;
