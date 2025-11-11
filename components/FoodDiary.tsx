import React, { useState, useMemo } from 'react';
import type { User, FoodItem, MealLog, MealType } from '../types';
import { useUserLocalStorage } from '../hooks/useLocalStorage';
import { fetchFoodData, FoodData } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface FoodDiaryProps {
  user: User;
}

export const FoodDiary: React.FC<FoodDiaryProps> = ({ user }) => {
  const todayKey = new Date().toISOString().split('T')[0];
  const [dailyLog, setDailyLog] = useUserLocalStorage<MealLog>(user.id, `foodlog-${todayKey}`, { breakfast: [], lunch: [], dinner: [], snacks: [] });
  
  const [query, setQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [foodResult, setFoodResult] = useState<FoodData | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    setFoodResult(null);
    try {
      const result = await fetchFoodData(query);
      setFoodResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao buscar dados do alimento.');
    } finally {
      setIsLoading(false);
    }
  };

  const addFoodItem = () => {
    if (!foodResult) return;
    const newFoodItem: FoodItem = {
      id: Date.now().toString(),
      name: foodResult.foodName,
      calories: foodResult.calories,
      protein: foodResult.protein,
      carbs: foodResult.carbs,
      fat: foodResult.fat,
      servingSize: foodResult.servingSize,
    };
    setDailyLog(prevLog => ({
      ...prevLog,
      [selectedMeal]: [...prevLog[selectedMeal], newFoodItem]
    }));
    setFoodResult(null);
    setQuery('');
  };
  
  const deleteFoodItem = (meal: MealType, id: string) => {
      setDailyLog(prevLog => ({
          ...prevLog,
          [meal]: prevLog[meal].filter(item => item.id !== id)
      }));
  };

  const totalCalories = useMemo(() => {
    return Object.values(dailyLog).flat().reduce((acc, item) => acc + item.calories, 0);
  }, [dailyLog]);

  const MealSection: React.FC<{ mealType: MealType, title: string }> = ({ mealType, title }) => (
    <div>
        <h3 className="text-lg font-semibold text-brand-dark border-b border-gray-200 pb-1 mb-2">{title}</h3>
        <ul className="space-y-1 text-sm">
            {dailyLog[mealType].map(item => (
                <li key={item.id} className="flex justify-between items-center group">
                    <span>{item.name} ({item.servingSize}) - <strong>{item.calories} kcal</strong></span>
                    <button onClick={() => deleteFoodItem(mealType, item.id)} className="text-red-500 opacity-0 group-hover:opacity-100">X</button>
                </li>
            ))}
        </ul>
        <p className="text-right font-bold text-sm mt-1">Total: {dailyLog[mealType].reduce((acc, item) => acc + item.calories, 0)} kcal</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Adicionar Refeição</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: 100g de frango grelhado"
            className="p-2 border border-gray-300 rounded-md md:col-span-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
          />
          <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value as MealType)} className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition">
            <option value="breakfast">Café da Manhã</option>
            <option value="lunch">Almoço</option>
            <option value="dinner">Jantar</option>
            <option value="snacks">Lanches</option>
          </select>
        </div>
        <button onClick={handleSearch} disabled={isLoading} className="mt-4 px-6 py-2 bg-brand-primary text-white font-bold rounded hover:bg-brand-secondary disabled:bg-gray-400 flex items-center">
          {isLoading && <LoadingSpinner />}
          {isLoading ? 'Buscando...' : 'Buscar Informação Nutricional'}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        {foodResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-bold">{foodResult.foodName} ({foodResult.servingSize})</h3>
            <p>Calorias: {foodResult.calories} kcal</p>
            <p>Proteínas: {foodResult.protein}g, Carboidratos: {foodResult.carbs}g, Gorduras: {foodResult.fat}g</p>
            <button onClick={addFoodItem} className="mt-2 px-4 py-1 bg-green-600 text-white rounded">Adicionar</button>
            <button onClick={() => setFoodResult(null)} className="mt-2 ml-2 px-4 py-1 bg-gray-300 rounded">Cancelar</button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-baseline">
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Resumo de Hoje</h2>
              <p className="font-bold text-lg text-brand-primary">Total: {totalCalories} kcal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <MealSection mealType="breakfast" title="Café da Manhã" />
              <MealSection mealType="lunch" title="Almoço" />
              <MealSection mealType="dinner" title="Jantar" />
              <MealSection mealType="snacks" title="Lanches" />
          </div>
      </div>
    </div>
  );
};