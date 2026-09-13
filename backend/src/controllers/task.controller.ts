import {type Request,type Response } from "express";
import {getAllTasks, getTaskById, createTask, deletaTask} from "../services/task.service.js";

export const getTasks = (_req: Request, res: Response) => {
    const tasks = getAllTasks();
    res.status(200).json({
        success: true,
        data: tasks,
    });
};

export const getTask = (req: Request, res:Response) => {
    const id = Number(req.params.id);
    const task = getTaskById(id);

    if(!task) {
        res.status(404).json({
            success: false,
            message: "Task not found",
        });
        return;
    }

    res.status(200).json({
        success: true,
        data: task,
    });
}

export const addTask = (req: Request, res:Response) => {
    const {title, description, priority} = req.body;

    if(!title) {
        res.status(400).json({
            success: false,
            message: "Title is required",
        })
        return;
    }

    const task = createTask(title, description, priority ?? "medium");

    res.status(201).json({
        success: true,
        data: task,
    });
};

export const removeTask = (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const deleted = deletaTask(id);

    if(!deleted) {
        res.status(404).json({
            success: false,
            message: "task not found",
        });
        return;
    }

    res.status(204).send();
}


