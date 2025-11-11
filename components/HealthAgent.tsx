import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { marked } from 'marked';

export const HealthAgent: React.FC = () => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `Você é um especialista em emagrecimento com PhD, um cientista de nutrição e fisiologista do exercício. Sua missão é fornecer conselhos baseados em evidências científicas, de forma clara e acessível. Use uma linguagem precisa, mas compreensível. Sempre reforce a necessidade de acompanhamento médico profissional e personalize os conselhos de forma segura. Não forneça diagnósticos. Responda em português do Brasil e formate suas respostas usando markdown.`,
            },
        });
    }, []);

    useEffect(() => {
        // Scroll to bottom when new message is added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading || !chatRef.current) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
        setHistory(prev => [...prev, userMessage]);
        setIsLoading(true);
        setUserInput('');

        try {
            const result = await chatRef.current.sendMessageStream({ message: userInput });
            
            let modelResponseText = '';
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of result) {
                modelResponseText += chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: modelResponseText }] };
                    return newHistory;
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: 'Desculpe, ocorreu um erro. Por favor, tente novamente.' }] }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderMessage = (msg: ChatMessage, index: number) => {
        const isUser = msg.role === 'user';
        const content = msg.parts[0].text;
        const htmlContent = { __html: marked.parse(content) };
        
        return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl ${isUser ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                    <div className="prose max-w-none prose-p:my-2" dangerouslySetInnerHTML={htmlContent} />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg flex flex-col h-[70vh] animate-fade-in">
            <h2 className="text-2xl font-bold text-brand-dark mb-4 border-b-2 border-brand-primary/20 pb-4">Assistente Especialista (PhD)</h2>
            <div ref={chatContainerRef} className="flex-grow space-y-4 overflow-y-auto pr-2">
                {history.length === 0 && (
                    <div className="text-center text-gray-500 pt-10">
                        <p>Olá! Sou seu assistente especialista. Como posso auxiliar em sua jornada com informações baseadas em ciência?</p>
                        <p className="text-sm mt-2">Pergunte sobre nutrição, fisiologia do exercício ou estratégias de emagrecimento.</p>
                    </div>
                )}
                {history.map(renderMessage)}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xl lg:max-w-2xl px-4 py-3 rounded-xl bg-gray-200 text-gray-800 flex items-center">
                           <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                           <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                           <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Digite sua pergunta..."
                    className="flex-grow p-3 bg-white text-brand-dark placeholder-gray-500 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-brand-primary focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="px-6 py-3 bg-brand-primary text-white font-bold rounded-r-md hover:bg-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
};