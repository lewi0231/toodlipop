import type { Timer, Todo } from "@prisma/client";
import { RiMoreFill, RiPencilLine, RiTimeLine } from "@remixicon/react";
import { useEffect, useState } from "react";

import TimerComponent from "./TimerComponent";

export type TodoWithTimers = Todo & {
  timers: Timer[];
};

const DEFAULT_TIMER_DURATION = 60;

const TimeKeeper = ({
  todo,
  handleOnTimeEnd,
}: {
  todo: TodoWithTimers & { id: Pick<Todo, "id"> };
  handleOnTimeEnd: (
    startTime: Date,
    endTime: Date,
    secondsRemaining: number,
    todoId: string,
  ) => void;
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    DEFAULT_TIMER_DURATION,
  );
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const handleOnToggleTimer = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsTimerRunning(!isTimerRunning);
  };

  const handleEditTodo = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleMoreOptions = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleTimerCountdown = () => {
    setSecondsRemaining((prev) => prev - 1);
  };

  useEffect(() => {
    if (secondsRemaining === 0) {
      setIsTimerRunning(false);
    }
  }, [secondsRemaining]);

  return (
    <>
      <TimerComponent
        secondsRemaining={secondsRemaining}
        isTimerRunning={isTimerRunning}
        handleOnTimeEnd={handleOnTimeEnd}
        handleTimerCountdown={handleTimerCountdown}
        timers={todo.timers}
        todoId={todo.id}
      />

      <div className="absolute hidden top-0 right-20 bg-my-secondary bg-opacity-50 items-center h-1/2 w-1/4 text-sm rounded group-hover:flex group-hover:justify-between px-3">
        <button onClick={handleEditTodo}>
          <RiPencilLine className=" hover:opacity-50" color="black" />
        </button>
        <button onClick={handleOnToggleTimer}>
          <RiTimeLine className=" hover:opacity-50" size={20} color="black" />
        </button>
        <button onClick={handleMoreOptions}>
          <RiMoreFill className=" hover:opacity-50" size={20} color="black" />
        </button>
      </div>
    </>
  );
};

export default TimeKeeper;
