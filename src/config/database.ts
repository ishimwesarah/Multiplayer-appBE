// src/config/db.config.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import { User } from '../models/user.model';
import { Quiz } from '../models/quiz.model';
import { Question } from '../models/question.model';
import { Option } from '../models/option.model';
import { GameSession } from '../models/game.model'; // Note: You might have GameSession in a different file
import { Player } from '../models/player.model';
import { Category } from '../models/category.model';

dotenv.config();

// --- THE MAIN CHANGE IS HERE ---

// Declare sequelize, but don't initialize it yet.
let sequelize: Sequelize;

const models = [User, Quiz, Question, Option, GameSession, Player, Category];

// Check if we are in a production environment (like Render)
if (process.env.DATABASE_URL) {
  // If DATABASE_URL is present, use it. This is for Render.
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // This is important for Render connections
      },
    },
    logging: false,
    models: models,
  });
} else {
  // Otherwise, fall back to the local development setup
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  sequelize = new Sequelize({
    dialect: 'postgres',
    host: DB_HOST!,
    port: Number(DB_PORT!),
    username: DB_USER!,
    password: DB_PASSWORD!,
    database: DB_NAME!,
    logging: false,
    models: models,
  });
}

// Export the configured instance
export { sequelize };

// --- THE REST OF THE FILE REMAINS THE SAME ---

const seedDefaultCategories = async () => {
  const defaultCategories = [
    'Technology',
    'Science',
    'History',
    'Geography',
    'Movies',
    'Music',
    'Art'
  ];

  try {
    for (const categoryName of defaultCategories) {
      await Category.findOrCreate({
        where: { name: categoryName },
      });
    }
  } catch (error) {
    console.error('Error seeding default categories:', error);
  }
};

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('PostgreSQL Database connected successfully.');

    await seedDefaultCategories();
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};