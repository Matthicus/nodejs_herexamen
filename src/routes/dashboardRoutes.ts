import express from "express";
import { getDashboard, getTaskDetails, deleteTask, editTask } from "../controllers/dashboardController";

const router = express.Router();

router.get("/", getDashboard);
router.get("/task/:id", getTaskDetails);
router.post("/task/:id/delete", deleteTask);
router.post("/task/:id/edit", editTask);

export default router;