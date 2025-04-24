import React, { useState, useEffect, useCallback } from 'react';
import { Coins, Sword, Shield, Crown, Sparkles, Zap, Star, Timer, Award, Rocket, RefreshCw, Volume2, VolumeX, Moon, Sun, Cpu, Maximize, Minimize, AlertTriangle } from 'lucide-react';


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
  condition: () => boolean;
}

interface RandomEvent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // в секундах
  effect: () => void;
  revert: () => void;
}

function App() {
  // Основные игровые состояния
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

  // Новые игровые состояния
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
    return saved ? parseFloat(saved) : 10000; // Начальная стоимость престижа
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
  const [criticalMultiplier, setCriticalMultiplier] = useState(2);
  const [criticalChance, setCriticalChance] = useState(5); // 5%
  const [activeEvent, setActiveEvent] = useState<RandomEvent | null>(null);
  const [eventTimeLeft, setEventTimeLeft] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [autoClickerActive, setAutoClickerActive] = useState(false);
  const [autoClickerSpeed, setAutoClickerSpeed] = useState(0);

  // Улучшения
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

  // Достижения
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('gameAchievements');
    const defaultAchievements = [
      {
        id: 'firstClick',
        name: 'Первый контакт',
        description: 'Сделайте свой первый клик',
        icon: <Sparkles className="w-6 h-6" />,
        unlocked: false,
        condition: () => totalClicks >= 1
      },
      {
        id: 'click100',
        name: 'Начинающий исследователь',
        description: 'Сделайте 100 кликов',
        icon: <Zap className="w-6 h-6" />,
        unlocked: false,
        condition: () => totalClicks >= 100
      },
      {
        id: 'click1000',
        name: 'Опытный космонавт',
        description: 'Сделайте 1,000 кликов',
        icon: <Award className="w-6 h-6" />,
        unlocked: false,
        condition: () => totalClicks >= 1000
      },
      {
        id: 'score100',
        name: 'Первые сбережения',
        description: 'Накопите 100 монет',
        icon: <Coins className="w-6 h-6" />,
        unlocked: false,
        condition: () => score >= 100
      },
      {
        id: 'score1000',
        name: 'Космический капиталист',
        description: 'Накопите 1,000 монет',
        icon: <Coins className="w-6 h-6" />,
        unlocked: false,
        condition: () => score >= 1000
      },
      {
        id: 'score10000',
        name: 'Галактический магнат',
        description: 'Накопите 10,000 монет',
        icon: <Coins className="w-6 h-6" />,
        unlocked: false,
        condition: () => score >= 10000
      },
      {
        id: 'upgrade5',
        name: 'Модернизация',
        description: 'Купите 5 любых улучшений',
        icon: <Sword className="w-6 h-6" />,
        unlocked: false,
        condition: () => upgrades.reduce((total, upgrade) => total + upgrade.owned, 0) >= 5
      },
      {
        id: 'upgrade20',
        name: 'Коллекционер технологий',
        description: 'Купите 20 любых улучшений',
        icon: <Cpu className="w-6 h-6" />,
        unlocked: false,
        condition: () => upgrades.reduce((total, upgrade) => total + upgrade.owned, 0) >= 20
      },
      {
        id: 'passive10',
        name: 'Пассивный доход',
        description: 'Достигните пассивного дохода 10/сек',
        icon: <Timer className="w-6 h-6" />,
        unlocked: false,
        condition: () => passiveIncome >= 10
      },
      {
        id: 'prestige1',
        name: 'Новое начало',
        description: 'Выполните первый престиж',
        icon: <RefreshCw className="w-6 h-6" />,
        unlocked: false,
        condition: () => prestigePoints >= 1
      }
    ];
    
    if (saved) {
      try {
        const parsedAchievements = JSON.parse(saved);
        return parsedAchievements.map((achievement: Achievement) => ({
          ...achievement,
          icon: 
            achievement.id === 'firstClick' ? <Sparkles className="w-6 h-6" /> :
            achievement.id === 'click100' ? <Zap className="w-6 h-6" /> :
            achievement.id === 'click1000' ? <Award className="w-6 h-6" /> :
            achievement.id === 'score100' || achievement.id === 'score1000' || achievement.id === 'score10000' ? <Coins className="w-6 h-6" /> :
            achievement.id === 'upgrade5' ? <Sword className="w-6 h-6" /> :
            achievement.id === 'upgrade20' ? <Cpu className="w-6 h-6" /> :
            achievement.id === 'passive10' ? <Timer className="w-6 h-6" /> :
            achievement.id === 'prestige1' ? <RefreshCw className="w-6 h-6" /> :
            <Award className="w-6 h-6" />,
          condition: 
            achievement.id === 'firstClick' ? () => totalClicks >= 1 :
            achievement.id === 'click100' ? () => totalClicks >= 100 :
            achievement.id === 'click1000' ? () => totalClicks >= 1000 :
            achievement.id === 'score100' ? () => score >= 100 :
            achievement.id === 'score1000' ? () => score >= 1000 :
            achievement.id === 'score10000' ? () => score >= 10000 :
            achievement.id === 'upgrade5' ? () => upgrades.reduce((total, upgrade) => total + upgrade.owned, 0) >= 5 :
            achievement.id === 'upgrade20' ? () => upgrades.reduce((total, upgrade) => total + upgrade.owned, 0) >= 20 :
            achievement.id === 'passive10' ? () => passiveIncome >= 10 :
            achievement.id === 'prestige1' ? () => prestigePoints >= 1 :
            () => false
        }));
      } catch (e) {
        console.error("Error parsing achievements:", e);
        return defaultAchievements;
      }
    }
    return defaultAchievements;
  });

  // Случайные события
  const randomEvents: RandomEvent[] = [
    {
      id: 'meteor_shower',
      name: 'Метеоритный дождь',
      description: 'Сила клика удвоена на 30 секунд!',
      icon: <Star className="w-6 h-6" />,
      duration: 30,
      effect: () => {
        setClickPower(prev => prev * 2);
      },
      revert: () => {
        setClickPower(prev => prev / 2);
      }
    },
    {
      id: 'cosmic_ray',
      name: 'Космический луч',
      description: 'Пассивный доход утроен на 20 секунд!',
      icon: <Zap className="w-6 h-6" />,
      duration: 20,
      effect: () => {
        setPassiveIncome(prev => prev * 3);
      },
      revert: () => {
        setPassiveIncome(prev => prev / 3);
      }
    },
    {
      id: 'black_hole',
      name: 'Черная дыра',
      description: 'Критический шанс увеличен до 50% на 15 секунд!',
      icon: <AlertTriangle className="w-6 h-6" />,
      duration: 15,
      effect: () => {
        let prevCritChance = 0;
        setCriticalChance(prev => {
          prevCritChance = prev;
          return 50;
        });
        

        return () => prevCritChance;
      },
      revert: () => {
        const getPrevValue = activeEvent?.effect() as (() => number) | undefined;
        setCriticalChance(getPrevValue ? getPrevValue() : 5);
      }
    }
  ];

  // Эффекты для сохранения данных
  useEffect(() => {
    localStorage.setItem('gameScore', score.toString());
    localStorage.setItem('gameClickPower', clickPower.toString());
    localStorage.setItem('gameTotalClicks', totalClicks.toString());
    localStorage.setItem('gamePassiveIncome', passiveIncome.toString());
    localStorage.setItem('gamePrestigePoints', prestigePoints.toString());
    localStorage.setItem('gamePrestigeMultiplier', prestigeMultiplier.toString());
    localStorage.setItem('gamePrestigeCost', prestigeCost.toString());
    localStorage.setItem('gameTotalEarned', totalEarned.toString());
    localStorage.setItem('gameSoundEnabled', soundEnabled.toString());
    localStorage.setItem('gameDarkMode', darkMode.toString());
    
    // Сохраняем улучшения без React элементов
    localStorage.setItem('gameUpgrades', JSON.stringify(upgrades.map(upgrade => ({
      ...upgrade,
      icon: null
    }))));
    
    // Сохраняем достижения без функций и React элементов
    localStorage.setItem('gameAchievements', JSON.stringify(achievements.map(achievement => ({
      ...achievement,
      icon: null,
      condition: null
    }))));
  }, [score, clickPower, totalClicks, passiveIncome, upgrades, achievements, prestigePoints, prestigeMultiplier, prestigeCost, totalEarned, soundEnabled, darkMode]);

  // Пассивный доход
  useEffect(() => {
    const timer = setInterval(() => {
      if (passiveIncome > 0) {
        const income = passiveIncome * prestigeMultiplier;
        setScore(prev => prev + income);
        setTotalEarned(prev => prev + income);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [passiveIncome, prestigeMultiplier]);

  // Автокликер
  useEffect(() => {
    if (autoClickerActive && autoClickerSpeed > 0) {
      const timer = setInterval(() => {
        handleClick(false);
      }, 1000 / autoClickerSpeed);
      
      return () => clearInterval(timer);
    }
  }, [autoClickerActive, autoClickerSpeed]);

  // Проверка достижений
  useEffect(() => {
    const checkAchievements = () => {
      let newUnlocked = false;
      
      setAchievements(prevAchievements => {
        return prevAchievements.map(achievement => {
          if (!achievement.unlocked && achievement.condition()) {
            newUnlocked = true;
            setNewAchievement(achievement);
            return { ...achievement, unlocked: true };
          }
          return achievement;
        });
      });
      
      
      if (newUnlocked && soundEnabled) {
        playSound('achievement');
      }
    };
    
    checkAchievements();
  }, [score, totalClicks, passiveIncome, upgrades, achievements, soundEnabled]);

  // Случайные события
  useEffect(() => {
    const randomEventChance = 0.5; // 0.5% шанс каждую секунду
    
    const eventTimer = setInterval(() => {
      if (!activeEvent && Math.random() * 100 < randomEventChance) {
        const randomIndex = Math.floor(Math.random() * randomEvents.length);
        const event = randomEvents[randomIndex];
        
        setActiveEvent(event);
        setEventTimeLeft(event.duration);
        event.effect();
        
        if (soundEnabled) {
          playSound('event');
        }
      }
    }, 1000);
    
    return () => clearInterval(eventTimer);
  }, [activeEvent]);
  
  // Таймер для активного события
  useEffect(() => {
    if (activeEvent && eventTimeLeft > 0) {
      const timer = setInterval(() => {
        setEventTimeLeft(prev => {
          if (prev <= 1) {
            activeEvent.revert();
            setActiveEvent(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [activeEvent, eventTimeLeft]);

  // Уведомление о новом достижении
  useEffect(() => {
    if (newAchievement) {
      const timer = setTimeout(() => {
        setNewAchievement(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [newAchievement]);

  // Функция для воспроизведения звуков
  const playSound = (type: 'click' | 'buy' | 'achievement' | 'event' | 'critical') => {
    if (!soundEnabled) return;
    
    //Тут должна быть функция музыки ну а вы знаете мне лень добавлять и вот вам тутор чутчут
    // Например:
    // const sound = new Audio(`/sounds/${type}.mp3`);
    // sound.play();
    
    console.log(`Playing sound: ${type}`);
  };

  // Функция для переключения полноэкранного режима
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

  // Функция для обработки клика
  const handleClick = useCallback((manual = true) => {
    let clickValue = clickPower * prestigeMultiplier;
    let isCritical = false;
    
    // Проверка на критический удар
    if (Math.random() * 100 < criticalChance) {
      clickValue *= criticalMultiplier;
      isCritical = true;
      setCriticalClick(true);
      setTimeout(() => setCriticalClick(false), 300);
    }
    
    setScore(prev => prev + clickValue);
    setTotalEarned(prev => prev + clickValue);
    
    if (manual) {
      setTotalClicks(prev => prev + 1);
    }
    
    // Воспроизведение звука ну музыку сами добавите как нибудь
    if (soundEnabled) {
      playSound(isCritical ? 'critical' : 'click');
    }
    
    // Визуальный эффект
    if (manual) {
      const sparkle = document.createElement('div');
      sparkle.className = isCritical ? 'sparkle critical' : 'sparkle';
      
      // Случайная позиция вокруг курсора
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      
      sparkle.style.left = `calc(50% + ${x}px)`;
      sparkle.style.top = `calc(50% + ${y}px)`;
      
      document.getElementById('click-button')?.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 1000);
    }
  }, [clickPower, prestigeMultiplier, criticalChance, criticalMultiplier, soundEnabled]);

  // Функция для покупки улучшения
  const purchaseUpgrade = (upgradeId: string) => {
    setUpgrades(prevUpgrades => {
      const newUpgrades = prevUpgrades.map(upgrade => {
        if (upgrade.id === upgradeId && score >= upgrade.cost) {
          // Проверка на максимальное количество
          if (upgrade.maxOwned && upgrade.owned >= upgrade.maxOwned) {
            return upgrade;
          }
          
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
              setAutoClickerActive(true);
            }
          }
          
          if (soundEnabled) {
            playSound('buy');
          }
          
          return {
            ...upgrade,
            owned: upgrade.owned + 1,
            cost: Math.floor(upgrade.cost * 1.5),
          };
        }
        return upgrade;
      });
      return newUpgrades;
    });
  };

  // Функция для выполнения престижа
  const performPrestige = () => {
    // Проверка, достаточно ли монет для престижа
    if (score < prestigeCost) {
      return; // Недостаточно монет для престижа
    }
    
    // Расчет очков престижа (квадратный корень от общего заработка / 1000)
    const newPrestigePoints = Math.floor(Math.sqrt(totalEarned / 1000));
    
    if (newPrestigePoints < 1) {
      return; // Недостаточно для престижа
    }
    
    setPrestigePoints(prev => prev + newPrestigePoints);
    setPrestigeMultiplier(prev => prev + newPrestigePoints * 0.1); // +10% за каждое очко
    
    // Увеличиваем стоимость следующего престижа
    setPrestigeCost(prev => Math.floor(prev * 1.5)); // Увеличиваем стоимость на 50%
    
    // Сброс игры
    setScore(0);
    setClickPower(1);
    setPassiveIncome(0);
    setCriticalChance(5);
    setCriticalMultiplier(2);
    setAutoClickerSpeed(0);
    setAutoClickerActive(false);
    
    // Сброс улучшений
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

  // Расчет потенциальных очков престижа
  const calculatePotentialPrestigePoints = () => {
    return Math.floor(Math.sqrt(totalEarned / 1000));
  };

  // Проверка возможности выполнить престиж
  const canPerformPrestige = () => {
    return score >= prestigeCost && calculatePotentialPrestigePoints() >= 1;
  };

  // Фильтрация улучшений по категории
  const filteredUpgrades = upgrades.filter(upgrade => {
    if (!upgrade.unlocked) return false;
    if (activeTab === 'all') return true;
    return upgrade.category === activeTab;
  });

  // Расчет процента разблокированных достижений
  const achievementPercentage = Math.floor((achievements.filter(a => a.unlocked).length / achievements.length) * 100);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white' : 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-4 sm:py-8 min-h-screen flex flex-col">
        {/* Верхняя панель */}
        <div className="text-center mb-4 sm:mb-8">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-2 ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
            <Sparkles className={`w-8 h-8 sm:w-10 sm:h-10 ${darkMode ? 'text-purple-300' : 'text-purple-500'}`} />
            Космический Кликер
          </h1>
          
          {/* Статистика */}
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
          
          {/* Панель инструментов */}
          <div className="flex justify-center gap-2 mb-4">
            <button 
              onClick={() => setShowAchievements(true)} 
              className={`p-2 rounded-full ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}
              title="Достижения"
            >
              <Award className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowPrestige(true)} 
              className={`p-2 rounded-full ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}
              title="Престиж"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)} 
              className={`p-2 rounded-full ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}
              title={soundEnabled ? "Выключить звук" : "Включить звук"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-2 rounded-full ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}
              title={darkMode ? "Светлая тема" : "Тёмная тема"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleFullscreen} 
              className={`p-2 rounded-full ${darkMode ? 'bg-purple-700 hover:bg-purple-600' : 'bg-indigo-100 hover:bg-indigo-200'} transition-colors`}
              title={fullscreen ? "Выйти из полноэкранного режима" : "Полноэкранный режим"}
            >
              {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-8 max-w-4xl mx-auto w-full">
          {/* Кнопка клика */}
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

          {/* Панель улучшений */}
          <div className="flex-1">
            <div className={`${darkMode ? 'bg-purple-800/20' : 'bg-white/30'} backdrop-blur-lg rounded-lg p-4 sm:p-6 shadow-xl h-full`}>
              <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>Улучшения</h2>
              
              {/* Вкладки категорий */}
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
              
              {/* Список улучшений */}
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
        
        {/* Активное событие */}
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
        
        {/* Уведомление о достижении */}
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
        
        {/* Модальное окно достижений */}
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
        
        {/* Модальное окно престижа */}
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
