import { Request, Response } from 'express';
import { Task } from '../models/taskModel';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryFilter = req.query.category as string;
    const priorityFilter = req.query.priority as string;

    const query: Record<string, unknown> = {};
    
    query.$or = [
      { dueDate: { $exists: false } },
      { dueDate: { $gte: new Date() } }
    ];

    if (categoryFilter && categoryFilter !== 'all') {
      query.category = new RegExp(categoryFilter, 'i');
    }

    if (priorityFilter && priorityFilter !== 'all') {
      query.priority = priorityFilter.toLowerCase();
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    const allTasks = await Task.find({
      $or: [
        { dueDate: { $exists: false } },
        { dueDate: { $gte: new Date() } }
      ]
    });

    const categories = [...new Set(allTasks.map(task => task.category))].sort();
    const priorities = ['low', 'medium', 'high'];

    res.render('dashboard', {
      tasks: tasks,
      categories: categories,
      priorities: priorities,
      currentCategory: categoryFilter || 'all',
      currentPriority: priorityFilter || 'all',
      totalTasks: tasks.length
    });
  } catch (error) {
    console.log('Error loading dashboard:', error);
    res.status(500).render('error', {
      message: 'Error loading dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};