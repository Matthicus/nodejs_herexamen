import { Request, Response } from 'express';
import { Task } from '../models/taskModel';

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryFilter = req.query.category as string;
    const priorityFilter = req.query.priority as string;
    const pageParam = req.query.page as string;
    const limitParam = req.query.limit as string;

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

    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 10;
    const skip = (page - 1) * limit;

 
    const allTasks = await Task.find(query);
    

    const sortedTasks = allTasks.sort((a, b) => {
  
      if (a.dueDate && b.dueDate) {
        const dateDiff = a.dueDate.getTime() - b.dueDate.getTime();
        if (dateDiff !== 0) return dateDiff;
      
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      
    
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
   
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

   
    const tasks = sortedTasks.slice(skip, skip + limit);

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);

    const allTasksForCategories = await Task.find({
      $or: [
        { dueDate: { $exists: false } },
        { dueDate: { $gte: new Date() } }
      ]
    });

    const categories = [...new Set(allTasksForCategories.map(task => task.category))].sort();
    const priorities = ['low', 'medium', 'high'];

    res.render('dashboard', {
      tasks: tasks,
      categories: categories,
      priorities: priorities,
      currentCategory: categoryFilter || 'all',
      currentPriority: priorityFilter || 'all',
      totalTasks: totalTasks,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: limit
      }
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

    res.render('taskDetail', { task, error: null });
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

  
    if (!title || !description || !category || !priority) {
      const task = await Task.findById(taskId);
      if (!task) {
        res.status(404).render('error', {
          message: 'Task not found',
          error: 'Could not update task'
        });
        return;
      }

      res.render('taskDetail', {
        task: task,
        error: 'All fields (title, description, category, priority) are required'
      });
      return;
    }

 
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const now = new Date();
      
      if (isNaN(dueDateObj.getTime())) {
        const task = await Task.findById(taskId);
        if (!task) {
          res.status(404).render('error', {
            message: 'Task not found',
            error: 'Could not update task'
          });
          return;
        }

        res.render('taskDetail', {
          task: task,
          error: 'Invalid due date format. Please use a valid date and time.'
        });
        return;
      }
      
      if (dueDateObj <= now) {
        const task = await Task.findById(taskId);
        if (!task) {
          res.status(404).render('error', {
            message: 'Task not found',
            error: 'Could not update task'
          });
          return;
        }

        res.render('taskDetail', {
          task: task,
          error: 'Due date must be in the future'
        });
        return;
      }
    }

 
    if (!['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      const task = await Task.findById(taskId);
      if (!task) {
        res.status(404).render('error', {
          message: 'Task not found',
          error: 'Could not update task'
        });
        return;
      }

      res.render('taskDetail', {
        task: task,
        error: 'Priority must be low, medium, or high'
      });
      return;
    }

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
    
    
    try {
      const task = await Task.findById(req.params.id);
      if (task) {
        let errorMessage = 'Error updating task';
        
        if (error instanceof Error && error.name === 'ValidationError') {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        res.render('taskDetail', {
          task: task,
          error: errorMessage
        });
        return;
      }
    } catch (fetchError) {
     
    }

    res.status(500).render('error', {
      message: 'Error updating task',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const showCreateForm = async (req: Request, res: Response): Promise<void> => {
  try {
  
    const allTasks = await Task.find({
      $or: [
        { dueDate: { $exists: false } },
        { dueDate: { $gte: new Date() } }
      ]
    });
    
    const categories = [...new Set(allTasks.map(task => task.category))].sort();
    const priorities = ['low', 'medium', 'high'];

    res.render('createTask', { 
      error: null, 
      formData: {},
      categories: categories,
      priorities: priorities
    });
  } catch (error) {
    console.log('Error loading create form:', error);
    res.status(500).render('error', {
      message: 'Error loading create form',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


export const createTaskDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, category, priority, dueDate } = req.body;

    
    const allTasks = await Task.find({
      $or: [
        { dueDate: { $exists: false } },
        { dueDate: { $gte: new Date() } }
      ]
    });
    const categories = [...new Set(allTasks.map(task => task.category))].sort();
    const priorities = ['low', 'medium', 'high'];

  
    if (!title || !description || !category || !priority) {
      res.render('createTask', {
        error: 'All fields (title, description, category, priority) are required',
        formData: req.body,
        categories: categories,
        priorities: priorities
      });
      return;
    }

  
    if (title.length > 200) {
      res.render('createTask', {
        error: 'Title must be 200 characters or less',
        formData: req.body,
        categories: categories,
        priorities: priorities
      });
      return;
    }

  
    if (description.length > 1000) {
      res.render('createTask', {
        error: 'Description must be 1000 characters or less',
        formData: req.body,
        categories: categories,
        priorities: priorities
      });
      return;
    }

   
    if (category.length > 100) {
      res.render('createTask', {
        error: 'Category must be 100 characters or less',
        formData: req.body,
        categories: categories,
        priorities: priorities
      });
      return;
    }

   
    if (!['low', 'medium', 'high'].includes(priority.toLowerCase())) {
      res.render('createTask', {
        error: 'Priority must be low, medium, or high',
        formData: req.body,
        categories: categories,
        priorities: priorities
      });
      return;
    }

    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const now = new Date();
      
      if (isNaN(dueDateObj.getTime())) {
        res.render('createTask', {
          error: 'Invalid due date format. Please use a valid date and time.',
          formData: req.body,
          categories: categories,
          priorities: priorities
        });
        return;
      }
      
      if (dueDateObj <= now) {
        res.render('createTask', {
          error: 'Due date must be in the future',
          formData: req.body,
          categories: categories,
          priorities: priorities
        });
        return;
      }
    }

   
    const newTask = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority: priority.toLowerCase() as 'low' | 'medium' | 'high',
      ...(dueDate && { dueDate: new Date(dueDate) })
    };

    const task = new Task(newTask);
    await task.save();

    res.redirect('/?message=Task created successfully');
  } catch (error) {
    console.log('Error creating task:', error);
    
   
    try {
      const allTasks = await Task.find({
        $or: [
          { dueDate: { $exists: false } },
          { dueDate: { $gte: new Date() } }
        ]
      });
      const categories = [...new Set(allTasks.map(task => task.category))].sort();
      const priorities = ['low', 'medium', 'high'];

      let errorMessage = 'Error creating task';
      
      if (error instanceof Error && error.name === 'ValidationError') {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      res.render('createTask', {
        error: errorMessage,
        formData: req.body,
        categories: categories,
        priorities: priorities
      });
    } catch (fetchError) {
  
      res.status(500).render('error', {
        message: 'Error creating task',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};