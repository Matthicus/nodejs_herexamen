import express from "express";
import { 
  getDashboard, 
  getTaskDetails, 
  deleteTask, 
  editTask,
  showCreateForm,
  createTaskDashboard
} from "../controllers/dashboardController";

const router = express.Router();

router.get("/", getDashboard);                  
router.get("/create", showCreateForm);           
router.post("/create", createTaskDashboard);      
router.get("/task/:id", getTaskDetails);         
router.post("/task/:id/delete", deleteTask);      
router.post("/task/:id/edit", editTask);          

export default router;