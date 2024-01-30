
export const INTENTS = {
    createTodo: "createTodo" as const,
    deleteTodo: "deleteTodo" as const,
    moveTodo: "moveTodo" as const,
    createWorkspace: "createWorkspace" as const,
    deleteWorkspace: "deleteWorkspace" as const,
    updateWorkspace: "updateWorkspace" as const,
    deleteSubtask: "deleteSubtask" as const,
    updateSubtask: "updateSubtask" as const,
    updateTodoTitle: "updateTodoTitle" as const,
    updateTodoOrder: "updateTodoOrder" as const,
    createTimer: "createTimer" as const,
}

export interface TimerProp {
  id: string;
  startTime: string;
  endTime: string;
  secondsRemaining: number;
  todoId: string;
}

export interface TodoProp {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  order: number;
  category: string;
//   complete: boolean;
  goal: number;
  workspaceId: string;
  timers: TimerProp[];
}

export const CONTENT_TYPES = {
  todoCard: "application/json",
};