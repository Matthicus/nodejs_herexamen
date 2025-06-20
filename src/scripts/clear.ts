import "dotenv/config";
import mongoose from "mongoose";
import { Task } from "../models/taskModel";

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to database");
    
    console.log("Clearing all tasks...");
    
  
    const result = await Task.deleteMany({});
    console.log(`Deleted ${result.deletedCount} tasks`);
    
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
 
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
};


clearDatabase();