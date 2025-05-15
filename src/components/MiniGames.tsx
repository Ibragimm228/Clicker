import React, { useState, useEffect, useRef } from 'react';
import { Star, Target, Map, AlertTriangle, CheckCircle, Gift } from 'lucide-react';

interface MiniGameProps {
  onReward: (amount: number) => void;
  darkMode: boolean;
  soundEnabled: boolean;
  onClose: () => void;
}

interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.FC<{onWin: (score: number) => void; darkMode: boolean; soundEnabled?: boolean; key?: string}>;
}

const AsteroidGame: React.FC<{onWin: (score: number) => void; darkMode: boolean; soundEnabled?: boolean}> = ({ onWin, darkMode, soundEnabled }) => {
  const [position, setPosition] = useState(50);
  const [asteroids, setAsteroids] = useState<{id: number; x: number; y: number; size: number; speed: number; rotation: number}[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [nextAsteroidId, setNextAsteroidId] = useState(0);
  const [starParticles, setStarParticles] = useState<{id: number; x: number; y: number; opacity: number; size: number}[]>([]);

  const gameAreaWidth = 100;
  const gameAreaHeight = 100;
  const playerWidth = 5;
  const playerHeight = 5;

  const playSound = (sound: string) => {
    if (soundEnabled) { 
      void(sound);
    }
  };

  useEffect(() => {
    const bgStars = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.2,
        size: Math.random() * 1.5 + 0.5,
    }));
    setStarParticles(bgStars);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const gameTick = 80; 
    const interval = setInterval(() => {
      const baseSpeed = 1.5 + Math.floor(score / 250) * 0.4;
      setAsteroids(prevAsteroids => {
        const newAsteroids = prevAsteroids
          .map(a => ({ ...a, y: a.y + a.speed }))
          .filter(a => a.y < gameAreaHeight + 10);
        const spawnChance = 0.12 + Math.floor(score / 400) * 0.025;
        if (Math.random() < Math.min(spawnChance, 0.4)) {
          const newSize = Math.random() * 3 + 3;
          const newSpeed = baseSpeed + (Math.random() * 1.5 - 0.75);
          newAsteroids.push({
            id: nextAsteroidId,
            x: Math.random() * (gameAreaWidth - newSize),
            y: -newSize - 5,
            size: newSize,
            speed: Math.max(1.2, newSpeed),
            rotation: Math.random() * 360
          });
          setNextAsteroidId(prevId => prevId + 1);
        }
        return newAsteroids;
      });
      setScore(prev => prev + 1);
    }, gameTick);
    return () => clearInterval(interval);
  }, [gameOver, score, nextAsteroidId]);

  useEffect(() => {
    if (gameOver || lives <= 0) return;
    const playerRect = {
        left: position,
        right: position + playerWidth,
        top: gameAreaHeight - playerHeight - 3,
        bottom: gameAreaHeight - 3
    };
    const newAsteroidsState = [...asteroids];
    let collisionOccurredThisFrame = false;
    for (let i = newAsteroidsState.length - 1; i >= 0; i--) {
      const asteroid = newAsteroidsState[i];
      const asteroidRect = {
        left: asteroid.x + asteroid.size * 0.1,
        right: asteroid.x + asteroid.size * 0.9,
        top: asteroid.y + asteroid.size * 0.1,
        bottom: asteroid.y + asteroid.size * 0.9
      };
      if (
        playerRect.left < asteroidRect.right &&
        playerRect.right > asteroidRect.left &&
        playerRect.top < asteroidRect.bottom &&
        playerRect.bottom > asteroidRect.top
      ) {
        newAsteroidsState.splice(i, 1);
        collisionOccurredThisFrame = true;
        playSound("explosion");
        setLives(prevLives => {
          const newLiveCount = prevLives - 1;
          if (newLiveCount <= 0) {
            setGameOver(true);
            playSound("game_over_asteroid");
            onWin(Math.floor(score / 5));
          } else {
            playSound("hit_asteroid");
          }
          return newLiveCount;
        });
        break;
      }
    }
    if (collisionOccurredThisFrame) {
      setAsteroids(newAsteroidsState);
    }
  }, [asteroids, position, gameOver, score, onWin, lives, soundEnabled]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(gameAreaWidth - playerWidth, x)));
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (gameOver) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(gameAreaWidth - playerWidth, x)));
  };

  const playerShipStyle = {
    left: `${position}%`,
    width: `${playerWidth}%`,
    height: `${playerHeight}%`,
  };

  return (
    <div
      className={`relative w-full h-80 ${darkMode ? 'bg-gray-900' : 'bg-blue-900'} rounded-lg overflow-hidden select-none cursor-none shadow-2xl`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={(e) => e.preventDefault()}
    >
      {starParticles.map(star => (
        <div key={star.id} className="absolute rounded-full bg-gray-400"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `twinkle ${Math.random() * 5 + 2}s infinite alternate`
          }}
        />
      ))}
      <svg 
        viewBox="0 0 100 100"
        className={`absolute bottom-3 transition-transform duration-100 ${darkMode ? 'text-sky-400' : 'text-yellow-400'}`}
        style={playerShipStyle}
        preserveAspectRatio="none"
      >
        <polygon points="50,0 100,100 0,100" fill="currentColor" />
        <polygon points="50,15 85,100 15,100" fill={darkMode ? "rgba(100,200,255,0.7)" : "rgba(255,255,150,0.7)"} />
      </svg>

      {asteroids.map(asteroid => (
        <div
          key={asteroid.id}
          className={`absolute ${darkMode ? 'bg-gray-500' : 'bg-gray-400'} rounded-md shadow-md`}
          style={{
            left: `${asteroid.x}%`,
            top: `${asteroid.y}%`,
            width: `${asteroid.size}%`,
            height: `${asteroid.size}%`,
            transform: `rotate(${asteroid.rotation + asteroid.y * 0.5}deg)`,
            border: darkMode ? '1px solid #4A5568' : '1px solid #A0AEC0'
          }}
        />
      ))}

      <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg shadow-lg ${darkMode ? 'text-white bg-gray-800/80' : 'text-gray-800 bg-white/80'}`}>
        Очки: {Math.floor(score / 5)}
      </div>
      <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg shadow-lg ${darkMode ? 'text-white bg-gray-800/80' : 'text-gray-800 bg-white/80'}`}>
        Жизни: {Array(lives).fill(0).map((_, i) => <span key={i} className={`text-red-500 ${darkMode ? 'opacity-70' : ''}`}>♥</span>)}
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <AlertTriangle size={64} className={`mb-4 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
          <h3 className={`text-4xl font-bold mb-3 ${darkMode ? 'text-red-400' : 'text-red-500'}`}>Игра окончена!</h3>
          <p className={`text-2xl mb-6 ${darkMode ? 'text-gray-200' : 'text-gray-100'}`}>Итоговый счет: {Math.floor(score / 5)}</p>
        </div>
      )}
      {!gameOver && lives === 3 && score < 50 && (
         <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 p-2.5 rounded-md text-sm shadow-md ${darkMode ? 'text-gray-300 bg-gray-700/90' : 'text-gray-700 bg-white/90'}`}>
            Двигайте мышь или палец, чтобы уклоняться!
        </div>
      )}
      <style>
        {`@keyframes twinkle { 0% { opacity: 0.3; } 100% { opacity: 0.8; } }`}
      </style>
    </div>
  );
};

const TreasureGame: React.FC<{onWin: (score: number) => void; darkMode: boolean; soundEnabled?: boolean}> = ({ onWin, darkMode, soundEnabled }) => {
  const GRID_SIZE = 5;
  const totalCells = GRID_SIZE * GRID_SIZE;
  const initialAttempts = 7;

  const [grid, setGrid] = useState<Array<{revealed: boolean; isTreasure: boolean; hint: string | null}>>([]);
  const [attempts, setAttempts] = useState(initialAttempts);
  const [treasureFound, setTreasureFound] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Найдите спрятанное сокровище!");
  const treasurePosition = useRef<number | null>(null);

  useEffect(() => {
    treasurePosition.current = Math.floor(Math.random() * totalCells);
    setGrid(
      Array(totalCells).fill(null).map((_, i) => ({
        revealed: false,
        isTreasure: i === treasurePosition.current,
        hint: null,
      }))
    );
    setAttempts(initialAttempts);
    setTreasureFound(false);
    setGameOver(false);
    setMessage("Найдите спрятанное сокровище! Кликните по плитке.");
  }, []);

  const playSound = (sound: string) => {
    if (soundEnabled) {
      void(sound);
    }
  };

  const getHint = (currentIndex: number, treasureIndex: number): string => {
    const currentRow = Math.floor(currentIndex / GRID_SIZE);
    const currentCol = currentIndex % GRID_SIZE;
    const treasureRow = Math.floor(treasureIndex / GRID_SIZE);
    const treasureCol = treasureIndex % GRID_SIZE;
    const distance = Math.max(Math.abs(currentRow - treasureRow), Math.abs(currentCol - treasureCol));
    if (distance <= 1) return "🔥 Очень горячо!";
    if (distance <= 2) return "☀️ Горячо!";
    if (distance <= 3) return "🧊 Холодно.";
    return "🥶 Очень холодно!";
  };

  const handleClick = (index: number) => {
    if (gameOver || grid[index].revealed) return;
    const newGrid = [...grid];
    newGrid[index].revealed = true;

    if (newGrid[index].isTreasure) {
      setTreasureFound(true);
      setGameOver(true);
      const reward = Math.max(10 - (initialAttempts - attempts), 1) * 50 + 50;
      setMessage(`💎 Сокровище найдено! Вы получили ${reward} очков!`);
      playSound("treasure_found");
      onWin(reward);
    } else {
      const currentAttempts = attempts - 1;
      setAttempts(currentAttempts);
      playSound("click_miss_treasure");
      newGrid[index].hint = getHint(index, treasurePosition.current!);
      if (currentAttempts <= 0) {
        setGameOver(true);
        setMessage("😭 Попытки закончились! Сокровище было здесь.");
        newGrid[treasurePosition.current!].revealed = true;
        playSound("game_over_treasure");
        onWin(10);
      } else {
        setMessage(`${newGrid[index].hint} Осталось попыток: ${currentAttempts}.`);
      }
    }
    setGrid(newGrid);
  };

  return (
    <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-sky-50"} shadow-xl`}>
      <div className={`mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        <p className="text-xl font-bold mb-1">Поиск Сокровищ</p>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
      </div>
      <div className={`grid grid-cols-${GRID_SIZE} gap-1.5 max-w-sm mx-auto mb-3`}>
        {grid.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            disabled={gameOver || cell.revealed}
            className={`aspect-square rounded-md shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-sky-400' : 'focus:ring-blue-500'} 
            ${cell.revealed 
                ? cell.isTreasure
                  ? 'bg-yellow-400 animate-pulse ring-2 ring-yellow-500'
                  : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'
                : darkMode ? 'bg-sky-700 hover:bg-sky-600' : 'bg-blue-300 hover:bg-blue-400'
            } 
            ${(gameOver && cell.isTreasure && !treasureFound) ? (darkMode ? 'bg-red-500/70' : 'bg-red-300/70') : ''}`}
          >
            {cell.revealed ? (cell.isTreasure ? '💎' : <span className="text-xs">{cell.hint?.split(' ')[0][0]}</span>) : '?'}
          </button>
        ))}
      </div>
       <p className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Осталось попыток: {attempts}</p>
    </div>
  );
};

const SpaceRoulette: React.FC<{onWin: (score: number) => void; darkMode: boolean; soundEnabled?: boolean}> = ({ onWin, darkMode, soundEnabled }) => {
  const [spinning, setSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const rewards = [500, 100, 10, 75, 300, 20, 150, 50];
  const numSections = rewards.length;
  const sectionAngle = 360 / numSections;

  const playSound = (sound: string) => {
    if (soundEnabled) { 
      void(sound);
    }
  };

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResultIndex(null);
    playSound("roulette_spin_start");

    const randomSpins = 4 + Math.random() * 4;
    const winningSectionIndex = Math.floor(Math.random() * numSections);
    const targetRotation = (360 * randomSpins) + ((numSections - winningSectionIndex) * sectionAngle);
    
    setCurrentRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setResultIndex(winningSectionIndex);
      playSound("roulette_win_sound");
      onWin(rewards[winningSectionIndex]);
    }, 5000);
  };

  return (
    <div className={`flex flex-col items-center p-6 rounded-lg ${darkMode ? "bg-gray-800" : "bg-sky-50"} shadow-xl`}>
      <p className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Космическая Рулетка</p>
      <div className="relative mb-8 w-72 h-72 md:w-80 md:h-80">
        <div 
            className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[25px] border-b-red-500 z-20 transform rotate-180"
        ></div>
        
        <div 
          className={`w-full h-full rounded-full relative border-4 ${darkMode ? 'border-sky-700 bg-gray-700' : 'border-blue-400 bg-gray-200'} shadow-2xl overflow-hidden`}
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transition: spinning ? 'transform 5s cubic-bezier(0.33, 1, 0.68, 1)' : 'none'
          }}
        >
          {rewards.map((reward, i) => {
            const segmentColor = i % 2 === 0 
                ? (darkMode ? 'bg-sky-600' : 'bg-blue-300') 
                : (darkMode ? 'bg-sky-500' : 'bg-blue-200');
            return (
                <div
                    key={i}
                    className={`absolute w-1/2 h-1/2 origin-bottom-right`}
                    style={{
                        transform: `rotate(${i * sectionAngle}deg)`,
                    }}
                >
                    <div className={`absolute w-full h-full ${segmentColor}`} style={{clipPath: `polygon(50% 50%, 100% 0, 100% 100%)`}}></div>
                    <span 
                        className={`absolute text-center transform -translate-x-1/2 -translate-y-1/2 text-sm md:text-base font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}
                        style={{
                            left: '75%', 
                            top: '50%',
                            transform: `translate(-50%, -50%) rotate(${- (i * sectionAngle + sectionAngle / 2)}deg)`
                        }}
                    >
                        {reward}
                    </span>
                </div>
            );
          })}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-sky-100'} border-2 ${darkMode ? 'border-sky-600' : 'border-blue-500'} shadow-inner`} /> 
        </div>
      </div>
      <button
        onClick={spin}
        disabled={spinning}
        className={`px-10 py-3.5 rounded-lg text-white text-lg font-semibold transition-colors duration-200 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-sky-400' : 'focus:ring-blue-500'} ${
          spinning
            ? darkMode ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-400 cursor-not-allowed'
            : darkMode ? 'bg-sky-600 hover:bg-sky-500' : 'bg-blue-500 hover:bg-blue-400'
        }`}
      >
        {spinning ? 'Крутится...' : 'Крутить!'}
      </button>
      {resultIndex !== null && !spinning && (
        <p className={`mt-6 text-2xl font-bold ${darkMode ? 'text-yellow-300' : 'text-yellow-500'}`}>Вы выиграли: {rewards[resultIndex]}!</p>
      )}
    </div>
  );
};

const miniGames: MiniGame[] = [
  {
    id: 'asteroid',
    name: 'Астероидный Дождь',
    description: 'Уклоняйтесь от падающих астероидов как можно дольше!',
    icon: <Star />,
    component: AsteroidGame
  },
  {
    id: 'treasure',
    name: 'Поиск Сокровищ',
    description: 'Найдите спрятанное сокровище за ограниченное число попыток.',
    icon: <Map />,
    component: TreasureGame
  },
  {
    id: 'roulette',
    name: 'Космическая Рулетка',
    description: 'Испытайте удачу на космическом колесе фортуны!',
    icon: <Target />,
    component: SpaceRoulette
  }
];

export const MiniGames: React.FC<MiniGameProps> = ({ onReward, darkMode, soundEnabled, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastReward, setLastReward] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const handleGameComplete = (reward: number) => {
    setLastReward(reward);
    setShowResults(true);
    onReward(reward);
  };

  const handleCloseResults = () => {
    setSelectedGame(null);
    setShowResults(false);
  };
  
  const handlePlayAgain = () => {
    setShowResults(false);
    setGameKey(prevKey => prevKey + 1);
  };

  return (
    <div className={`rounded-xl shadow-2xl max-w-lg w-full overflow-hidden mx-auto ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`p-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <h2 className="text-2xl md:text-3xl font-bold">Мини-Игры Аркада</h2>
        <button onClick={onClose} className={`text-3xl md:text-4xl ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}>&times;</button>
      </div>

      <div className="p-5 min-h-[400px]">
        {!selectedGame ? (
          <div className="grid grid-cols-1 gap-5">
            {miniGames.map(game => (
              <button
                key={game.id}
                onClick={() => {
                    setSelectedGame(game);
                    setGameKey(prevKey => prevKey + 1);
                }}
                className={`p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1.5 transition-all duration-200 flex items-center gap-5 text-left ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'}`}
              >
                <div className={`p-3.5 rounded-full ${darkMode ? 'bg-sky-600 text-white' : 'bg-blue-500 text-white'} shadow-md`}>
                  {React.cloneElement(game.icon as React.ReactElement, { size: 30 })}
                </div>
                <div>
                    <div className="text-lg font-semibold mb-1">{game.name}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {game.description}
                    </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            {showResults ? (
              <div className="text-center p-5 flex flex-col items-center justify-center min-h-[300px]">
                {lastReward > 10 ? <Gift size={60} className={`mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} /> : <AlertTriangle size={60} className={`mb-4 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`} />}
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Игра Окончена!</h3>
                <p className={`text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  Вы заработали: <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-yellow-500'}`}>{lastReward}</span> очков
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                  <button
                    onClick={handlePlayAgain}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-white ${darkMode ? 'bg-sky-600 hover:bg-sky-500' : 'bg-blue-500 hover:bg-blue-400'}`}
                  >
                    Играть Снова
                  </button>
                  <button
                    onClick={handleCloseResults}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-400 hover:bg-gray-300 text-gray-800'}`}
                  >
                    К Списку Игр
                  </button>
                </div>
              </div>
            ) : (
              <selectedGame.component 
                key={`game-${gameKey}`} 
                onWin={handleGameComplete} 
                darkMode={darkMode} 
                soundEnabled={soundEnabled} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniGames;

