import type { Todo as PrismaTodo } from "@prisma/client";
import { useState } from "react";

import CountdownTimer from "./Timer";

export type TodoProp = Omit<PrismaTodo, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function Todo({ todo }: { todo: TodoProp }) {
  const defaultDurationSeconds = 25 * 60;
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const { monthHeight, weekHeight, dayHeight } = extractHeights(todo);

  const handleClickTimer = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsTimerRunning(!isTimerRunning);
  };

  const handleOnTimeEnd = () => {
    // do something
    console.debug("handling time end");
  };

  return (
    <div className=" bg-my-secondary bg-opacity-10 w-2/3 cursor-pointer rounded-lg pl-5 flex h-16 box-border gap-5 relative hover:bg-opacity-20 border-1 border-my-tertiary border-opacity-10 group">
      <div className="w-1/2"></div>
      <div className="flex items-center absolute top-0 left-5 h-full">
        <h1 className="w-full">{todo.title}</h1>
      </div>
      <div className="w-1/2 flex relative gap-5">
        <div
          style={{ height: `${monthHeight}%` }}
          className={` w-1/3 bg-my-tertiary bg-opacity-20`}
        ></div>
        <div
          style={{ height: `${weekHeight}%` }}
          className={`w-1/3 bg-my-tertiary opacity-20`}
        ></div>
        <div
          style={{ height: `${dayHeight}%` }}
          className={` bg-my-tertiary bg-opacity-20 w-1/3 `}
        ></div>
        <div className=" absolute -right-7 h-full rotate-90">
          <CountdownTimer
            isTimerRunning={isTimerRunning}
            onTimeEnd={handleOnTimeEnd}
            durationSeconds={defaultDurationSeconds}
            todoId={todo.id}
          />
        </div>
      </div>
      <div className="absolute hidden group-hover:block top-0 right-0 bg-slate-200 bg-opacity-75 items-center h-full text-sm rounded">
        <button className="rounded h-full hover:bg-my-secondary w-1/2 text-center p3">
          edit
        </button>
        <button
          onClick={handleClickTimer}
          className="rounded hover:bg-my-secondary content-center h-full  text-white w-1/2 text-center p-3"
        >
          {/* Replace with your actual modal content */}
          timer
        </button>
      </div>
    </div>
  );
}

function extractHeights(todo: TodoProp) {
  const dayHeight = Math.floor((todo.hoursDay / todo.goal) * 100).toString();
  const weekHeight = Math.floor(
    (todo.hoursWeek / (todo.goal * 7)) * 100,
  ).toString();
  const monthHeight = Math.floor(
    (todo.hoursMonth / (todo.goal * 30)) * 100,
  ).toString();
  return { monthHeight, weekHeight, dayHeight };
}

export default Todo;
