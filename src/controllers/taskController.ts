import { Request, Response } from 'express';
import { Task, ITask } from '../models/taskModel';

// export const createTask = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { title, description, category, priority, dueDate } = req.body;

//     if (!title || !description || !category || !priority) {
//       res.status(400).json({
//         message: 'Title, description, category, and priority are required'
//       });
//       return;
//     }

//     const newTask: Partial<ITask> = {
//       title: title.trim(),
//       description: description.trim(),
//       category: category.trim(),
//       priority: priority.toLowerCase() as 'low' | 'medium' | 'high'
//     };

//     if (dueDate) {
//       newTask.dueDate = new Date(dueDate);
//     }

//     const task = new Task(newTask);
//     const result = await task.save();

//     res.status(201).json(result);
//   } catch (error) {
//     console.log('Error creating task:', error);
//     res.status(400).json({ 
//       message: error instanceof Error ? error.message : 'Could not create task'
//     });
//   }
// };


//post function, had pas laat door dat deze niet required was voor de opdracht
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryFilter = req.query.category as string;
    const priorityFilter = req.query.priority as string;
    const pageParam = req.query.page as string;
    const limitParam = req.query.limit as string;
    const sortParam = req.query.sort as string;
    const orderParam = req.query.order as string;

    const query: Record<string, unknown> = {};
    
    query.$or = [
      { dueDate: { $exists: false } },
      { dueDate: { $gte: new Date() } }
    ];

    if (categoryFilter) {
      query.category = new RegExp(categoryFilter, 'i');
    }

    if (priorityFilter) {
      query.priority = priorityFilter.toLowerCase();
    }

    const page = parseInt(pageParam) || 1;
    const limit = parseInt(limitParam) || 10;
    const skip = (page - 1) * limit;

    const sortField = sortParam || 'createdAt';
    const sortDirection = orderParam === 'asc' ? 1 : -1;
    const sortOptions: { [key: string]: 1 | -1 } = {};
    sortOptions[sortField] = sortDirection;

    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments(query);
    const totalPages = Math.ceil(totalTasks / limit);

    const response = {
      tasks: tasks,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalTasks: totalTasks,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    res.json(response);
  } catch (error) {
    console.log('Error getting tasks:', error);
    res.status(500).json({ 
      message: 'Failed to get tasks' 
    });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (task.dueDate && task.dueDate < new Date()) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(task);
  } catch (error) {
    console.log('Error getting task:', error);
    res.status(500).json({ 
      message: 'Failed to get task' 
    });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const updateData = req.body;

    const keys = Object.keys(updateData);
    for (let i = 0; i < keys.length; i++) {
      if (updateData[keys[i]] === undefined) {
        delete updateData[keys[i]];
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    console.log('Error updating task:', error);
    res.status(400).json({ 
      message: error instanceof Error ? error.message : 'Failed to update task'
    });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.log('Error deleting task:', error);
    res.status(500).json({ 
      message: 'Failed to delete task' 
    });
  }
};