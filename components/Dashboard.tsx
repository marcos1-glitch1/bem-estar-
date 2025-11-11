import React, { useState, useMemo } from 'react';
import type { User, ScheduleItem, MealLog } from '../types';
import { useUserLocalStorage } from '../hooks/useLocalStorage';
import { DailyNews } from './DailyNews';

interface DashboardProps {
  user: User;
}

const ScheduleManager: React.FC<{ user: User }> = ({ user }) => {
    const [schedule, setSchedule] = useUserLocalStorage<ScheduleItem[]>(user.id, 'schedule', []);
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [dosage, setDosage] = useState('');

    const addItem = () => {
        if (!time || !description) return;
        const newItem: ScheduleItem = { id: Date.now().toString(), time, description, dosage };
        setSchedule([...schedule, newItem].sort((a,b) => a.time.localeCompare(b.time)));
        setTime('');
        setDescription('');
        setDosage('');
    };
    
    const deleteItem = (id: string) => {
        setSchedule(schedule.filter(item => item.id !== id));
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-brand-dark mb-4">Agenda Diária (Dieta e Medicamentos)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="p-2 bg-white text-brand-dark border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"/>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (ex: Vitamina D)" className="p-2 bg-white text-brand-dark placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"/>
                <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosagem (ex: 1 cápsula)" className="p-2 bg-white text-brand-dark placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"/>
            </div>
            <button onClick={addItem} className="px-4 py-2 bg-brand-primary text-white font-bold rounded hover:bg-brand-secondary">Adicionar à Agenda</button>
            <ul className="mt-4 space-y-2">
                {schedule.map(item => (
                    <li key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                            <span className="font-bold text-brand-secondary">{item.time}</span>
                            <span className="ml-4 text-gray-800">{item.description}</span>
                            {item.dosage && <span className="ml-2 text-sm text-gray-500">({item.dosage})</span>}
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-700">X</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const [calorieGoal, setCalorieGoal] = useUserLocalStorage(user.id, 'calorieGoal', 2000);
    const [dailyLog] = useUserLocalStorage<MealLog>(user.id, `foodlog-${new Date().toISOString().split('T')[0]}`, { breakfast: [], lunch: [], dinner: [], snacks: [] });

    const totalCalories = useMemo(() => {
        return Object.values(dailyLog).flat().reduce((acc, item) => acc + item.calories, 0);
    }, [dailyLog]);
    
    const progress = useMemo(() => {
        return calorieGoal > 0 ? (totalCalories / calorieGoal) * 100 : 0;
    }, [totalCalories, calorieGoal]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Seu Progresso de Hoje</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-base font-medium text-brand-dark">Calorias Consumidas</span>
                            <span className="text-sm font-medium text-brand-dark">{Math.round(totalCalories)} / {calorieGoal} kcal</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-brand-primary h-4 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                    </div>
                     <div className="flex items-center space-x-2">
                        <label htmlFor="calorieGoal" className="font-medium text-brand-dark">Meta de Calorias:</label>
                        <input 
                            id="calorieGoal"
                            type="number"
                            value={calorieGoal}
                            onChange={e => setCalorieGoal(Number(e.target.value))}
                            className="p-2 bg-white text-brand-dark border border-gray-300 rounded-md w-32 focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                        />
                    </div>
                </div>
            </div>

            <ScheduleManager user={user} />

            <DailyNews />
        </div>
    );
};