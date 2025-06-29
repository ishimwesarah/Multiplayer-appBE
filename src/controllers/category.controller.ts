// src/controllers/category.controller.ts
import { Request, Response } from 'express';
import { Category } from '../models/category.model';
import { Op } from 'sequelize';

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  try {
    // Check if category already exists (case-insensitive)
    const existingCategory = await Category.findOne({ where: { name: { [Op.iLike]: name } } });
    if(existingCategory) {
        res.status(409).json({ message: 'Category with this name already exists.'});
        return;
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error });
  }
};

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error });
  }
};