import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeightLossNews } from '../services/geminiService';
import type { GroundingChunk } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { Sources } from './Sources';

interface Article {
    title: string;
    summary: string;
}

const parseNews = (text: string): Article[] => {
    const articles: Article[] = [];
    const newsBlocks = text.split('---').filter(block => block.trim() !== '');

    for (const block of newsBlocks) {
        const titleMatch = block.match(/TÍTULO:\s*(.*)/);
        const summaryMatch = block.match(/RESUMO:\s*([\s\S]*)/); // Use [\s\S]* to match across newlines

        if (titleMatch && titleMatch[1] && summaryMatch && summaryMatch[1]) {
            articles.push({
                title: titleMatch[1].trim(),
                summary: summaryMatch[1].trim(),
            });
        }
    }
    return articles;
};

export const DailyNews: React.FC = () => {
    const [news, setNews] = useState<Article[]>([]);
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadNews = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { rawText, sources } = await fetchWeightLossNews();
            const parsedArticles = parseNews(rawText);
            setNews(parsedArticles);
            setSources(sources);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro inesperado ao carregar as notícias.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg animate-fade-in">
            <div className="flex justify-between items-center border-b-2 border-brand-primary/20 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-brand-dark">Notícias do Dia sobre Bem-Estar</h2>
                <button onClick={loadNews} disabled={isLoading} className="p-2 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-brand-secondary ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 16" />
                    </svg>
                </button>
            </div>
            
            {isLoading && (
                 <div className="flex justify-center items-center py-10">
                    <LoadingSpinner /> <span className="ml-3 text-lg">Carregando notícias...</span>
                 </div>
            )}

            {error && (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Erro ao carregar notícias</p>
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && !error && (
                <div className="space-y-6">
                    {news.map((item, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <h3 className="text-xl font-semibold text-brand-dark mb-2">{item.title}</h3>
                            <p className="text-gray-600 whitespace-pre-wrap">{item.summary}</p>
                        </div>
                    ))}
                    <Sources sources={sources} />
                </div>
            )}
        </div>
    );
};