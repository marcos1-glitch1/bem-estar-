export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface User {
    id: string;
    username: string;
    email: string;
    password: string; // ATENÇÃO: Em um app real, isso deve ser criptografado (hash).
}

export interface DiaryEntry {
    id: string;
    date: string;
    text: string;
    weight?: number | string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface MealLog {
    breakfast: FoodItem[];
    lunch: FoodItem[];
    dinner: FoodItem[];
    snacks: FoodItem[];
}

export interface ScheduleItem {
    id: string;
    time: string;
    description: string;
    dosage: string;
}