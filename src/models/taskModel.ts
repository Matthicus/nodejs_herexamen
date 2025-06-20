import mongoose, { Document, Schema } from "mongoose";


export interface ITask extends Document {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}


const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exv 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters']
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high'
      },
      lowercase: true
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function(date: Date) {
          return !date || date > new Date();
        },
        message: 'Due date has to be in the furute'
      }
    }
  },
  {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


taskSchema.index({ category: 1, priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });


export const Task = mongoose.model<ITask>("Task", taskSchema);