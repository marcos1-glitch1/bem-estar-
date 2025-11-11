import React, { useState } from 'react';
import type { DiaryEntry, User } from '../types';
import { useUserLocalStorage } from '../hooks/useLocalStorage';


interface ProgressDiaryProps {
    user: User;
}

export const ProgressDiary: React.FC<ProgressDiaryProps> = ({ user }) => {
    const [entries, setEntries] = useUserLocalStorage<DiaryEntry[]>(user.id, 'diary-entries', []);
    const [newText, setNewText] = useState('');
    const [newWeight, setNewWeight] = useState('');

    const addEntry = () => {
        if (!newText.trim()) return;
        const newEntry: DiaryEntry = {
            id: new Date().toISOString(),
            date: new Date().toLocaleString('pt-BR'),
            text: newText,
            weight: newWeight || undefined
        };
        setEntries([newEntry, ...entries]);
        setNewText('');
        setNewWeight('');
    };
    
    const deleteEntry = (id: string) => {
        if (window.confirm("Tem certeza que deseja apagar esta entrada?")) {
            setEntries(entries.filter(entry => entry.id !== id));
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                 <h2 className="text-2xl font-bold text-brand-dark mb-4">Adicionar Nova Entrada ao Diário</h2>
                 <div className="space-y-4">
                     <textarea
                        className="w-full p-3 bg-white text-brand-dark placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                        rows={4}
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="Como você se sentiu hoje? Quais foram suas vitórias ou desafios?"
                     />
                     <input 
                        type="number"
                        className="w-full md:w-1/3 p-3 bg-white text-brand-dark placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        placeholder="Peso (kg, opcional)"
                     />
                 </div>
                 <button 
                    onClick={addEntry}
                    className="mt-4 px-8 py-3 bg-brand-primary text-white font-bold rounded-md hover:bg-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    disabled={!newText.trim()}
                 >
                    Salvar no Diário
                 </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-brand-dark mb-4">Suas Entradas</h2>
                {entries.length === 0 ? (
                    <p className="text-gray-500">Nenhuma entrada ainda. Adicione uma acima para começar!</p>
                ) : (
                    <ul className="space-y-4">
                        {entries.map(entry => (
                            <li key={entry.id} className="border border-gray-200 p-4 rounded-md relative group">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-brand-dark">{entry.date}</p>
                                        {entry.weight && <p className="text-sm font-bold text-brand-secondary">Peso: {entry.weight} kg</p>}
                                    </div>
                                     <button 
                                        onClick={() => deleteEntry(entry.id)}
                                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Apagar entrada"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{entry.text}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};