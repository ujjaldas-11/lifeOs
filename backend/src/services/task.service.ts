type Task = {
    id: number;
    title: string;
    description?: string | undefined;
    priority: "low" | "medium" | "high";
    status: "pending" | "completed";

};

let tasks: Task[] = [];

export const getAllTasks = () => {
    return tasks;
}

export const getTaskById = (id: number) => {
    return tasks.find((task)=> task.id === id);
};

export const createTask = (
    title: string,
    description: string | undefined,
    priority: Task["priority"]    
) => {
    const task: Task = {
        id: Date.now(),
        title,
        description,
        priority,
        status: "pending",
    };
    tasks.push(task);

    return task;
};


export const deletaTask = (id: number) => {
    const index = tasks.findIndex((task) => task.id === id);

    if(index === -1) {
        return false;
    }

    tasks.splice(index, 1);

    return true;
};

