import React from 'react';
import { Scroll, Beaker, Cpu, Rocket } from 'lucide-react';

interface ResearchSystemProps {
  darkMode: boolean;
  researchPoints: number;
  onClose: () => void;
}

const ResearchSystem: React.FC<ResearchSystemProps> = ({
  darkMode,
  researchPoints,
  onClose
}) => {
  return (
    <div className={`${darkMode ? 'bg-purple-900' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full overflow-hidden`}>
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Scroll className="w-6 h-6" /> Система исследований
          <span className={`ml-4 px-3 py-1 rounded-full text-sm ${
            darkMode ? 'bg-purple-800' : 'bg-indigo-100'
          }`}>
            Доступно очков: {researchPoints}
          </span>
        </h2>
        <button onClick={onClose} className="text-2xl">&times;</button>
      </div>

      <div className="p-4">
        <div className="mb-6">
          <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
            Очки исследования позволяют открывать новые технологии и улучшения для вашей космической станции.
            Получайте их за выполнение квестов и особых достижений.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-700' : 'bg-purple-200'}`}>
                <Beaker className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Научные исследования</h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              Улучшайте эффективность производства и открывайте новые источники ресурсов.
              Скоро будет доступно!
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-700' : 'bg-purple-200'}`}>
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Автоматизация</h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              Разрабатывайте автоматические системы для увеличения производительности.
              Скоро будет доступно!
            </p>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-800' : 'bg-purple-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-700' : 'bg-purple-200'}`}>
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-bold">Космические экспедиции</h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              Отправляйте экспедиции для исследования новых планет и сбора ресурсов.
              Скоро будет доступно!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchSystem; 