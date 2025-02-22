import AsyncStorage from '@react-native-async-storage/async-storage';
import { Experience } from '../models/Experience';

const EXP_STORAGE_KEY = '@wanderlust_experience';

export const saveExperience = async (experience: Experience) => {
    try {
        const expData = {
            currentExp: experience.currentExp,
            currentLevel: experience.currentLevel
        };
        await AsyncStorage.setItem(EXP_STORAGE_KEY, JSON.stringify(expData));
    } catch (error) {
        console.error('Error saving experience:', error);
    }
};

export const loadExperience = async (): Promise<Experience> => {
    try {
        const expData = await AsyncStorage.getItem(EXP_STORAGE_KEY);
        if (expData) {
            const { currentExp, currentLevel } = JSON.parse(expData);
            return new Experience(currentExp, currentLevel);
        }
    } catch (error) {
        console.error('Error loading experience:', error);
    }
    return new Experience(); // Return default experience if nothing is stored
};
