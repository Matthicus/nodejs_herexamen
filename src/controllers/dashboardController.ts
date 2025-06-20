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

export const getTaskDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).render('error', {
        message: 'Task not found',
        error: 'The requested task does not exist'
      });
      return;
    }

    if (task.dueDate && task.dueDate < new Date()) {
      res.status(404).render('error', {
        message: 'Task not found',
        error: 'This task has expired'
      });
      return;
    }

    res.render('task-detail', { task });
  } catch (error) {
    console.log('Error getting task:', error);
    res.status(500).render('error', {
      message: 'Error loading task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      res.status(404).render('error', {
        message: 'Task not found',
        error: 'Could not delete task'
      });
      return;
    }

    res.redirect('/?message=Task deleted successfully');
  } catch (error) {
    console.log('Error deleting task:', error);
    res.status(500).render('error', {
      message: 'Error deleting task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const editTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const { title, description, category, priority, dueDate } = req.body;

    const updateData: Record<string, unknown> = {};
    
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (category) updateData.category = category.trim();
    if (priority) updateData.priority = priority.toLowerCase();
    if (dueDate) updateData.dueDate = new Date(dueDate);

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      res.status(404).render('error', {
        message: 'Task not found',
        error: 'Could not update task'
      });
      return;
    }

    res.redirect('/?message=Task updated successfully');
  } catch (error) {
    console.log('Error updating task:', error);
    res.status(500).render('error', {
      message: 'Error updating task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};