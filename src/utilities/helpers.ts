import { PIN_LENGTH } from './constants';

export const generateRandomPin = (): string => {
  const characters = '0123456789';
  let pin = '';
  
  for (let i = 0; i < PIN_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    pin += characters[randomIndex];
  }
  
  return pin;
};

export const calculateScore = (timeLeft: number, totalTime: number, basePoints: number): number => {
  const percentage = timeLeft / totalTime;
  return Math.floor(basePoints * percentage);
};