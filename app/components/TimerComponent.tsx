import { useEffect, useState } from "react";

import { TimerProp } from "~/routes/workspaces.$workspaceId.todos";

import Spinner from "./Spinner";
import TodoProgress from "./TodoProgress";

const DEFAULT_TIMER_DURATION = 30;

const TimerComponent = ({
  isTimerRunning = false,
  handleOnTimeEnd,
  timers,
  todoId,
  goal,
}: {
  isTimerRunning: boolean;
  handleOnTimeEnd: () => void;
  timers: TimerProp[];
  todoId: string;
  goal: number;
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>();

  useEffect(() => {
    if (typeof secondsRemaining !== "number") {
      setSecondsRemaining(() => {
        const storage = JSON.parse(localStorage.getItem(todoId) ?? "{}");

        if (storage?.secondsRemaining) {
          return storage.secondsRemaining;
        } else {
          return DEFAULT_TIMER_DURATION;
        }
      });
    }

    const handleTimerCountdown = () => {
      setSecondsRemaining((prev) => {
        if (prev !== undefined) {
          return prev - 1;
        }
      });
    };

    let intervalId: NodeJS.Timeout;
    if (isTimerRunning) {
      intervalId = setInterval(handleTimerCountdown, 1000);

      console.log("seconds:", secondsRemaining);

      if (secondsRemaining !== undefined && secondsRemaining < 0) {
        handleOnTimeEnd();
        setSecondsRemaining(DEFAULT_TIMER_DURATION);
        clearInterval(intervalId);
      }
    } else {
      if (secondsRemaining) {
        localStorage.setItem(
          todoId,
          JSON.stringify({
            secondsRemaining,
          }),
        );
      }
    }

    return () => {
      clearInterval(intervalId);

      if (secondsRemaining && secondsRemaining > 0) {
        localStorage.setItem(
          todoId,
          JSON.stringify({
            secondsRemaining,
          }),
        );
      }
    };
  }, [
    handleOnTimeEnd,
    setSecondsRemaining,
    isTimerRunning,
    todoId,
    secondsRemaining,
  ]);

  return (
    <>
      <TodoProgress timers={timers} goal={goal} />

      <div className=" absolute right-4 h-full rotate-90 text-sm opacity-80">
        {secondsRemaining ? (
          <div>{extractTimeFormat(secondsRemaining)}</div>
        ) : (
          <Spinner showSpinner={true} />
        )}
      </div>
    </>
  );
};

function extractTimeFormat(timeLeft: number) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const minuteString = `${minutes < 10 ? "0" + minutes : minutes}`;
  const secondsString = `${seconds < 10 ? "0" + seconds : seconds}`;

  console.debug("Extracted time format: ", minuteString, secondsString);

  return `${minuteString}:${secondsString}`;
}

export default TimerComponent;
