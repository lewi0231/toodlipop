import type { Timer } from "@prisma/client";
import { useEffect, useState } from "react";

import GoalProgressBar from "./GoalProgressBar";

const TimerComponent = ({
  secondsRemaining,
  isTimerRunning = false,
  handleOnTimeEnd,
  handleTimerCountdown,
  timers,
  todoId,
}: {
  secondsRemaining: number;
  isTimerRunning: boolean;
  handleOnTimeEnd: (
    startTime: Date,
    endTime: Date,
    secondsRemaining: number,
    todoId: string,
  ) => void;
  handleTimerCountdown: () => void;
  timers: Timer[];
  todoId: string;
}) => {
  const { dayHours, weekHours, monthHours } = calculateTotalTimes(timers);

  const [startTime, setStartTime] = useState<Date>();

  useEffect(() => {
    if (secondsRemaining === 0 && startTime) {
      handleOnTimeEnd(startTime, new Date(), secondsRemaining, todoId);
    }

    let intervalId: NodeJS.Timeout;
    if (isTimerRunning) {
      if (!startTime) {
        setStartTime(new Date());
      }
      intervalId = setInterval(handleTimerCountdown, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [
    isTimerRunning,
    secondsRemaining,
    handleOnTimeEnd,
    startTime,
    handleTimerCountdown,
    todoId,
  ]);

  return (
    <div className="w-1/2 flex relative gap-5">
      <GoalProgressBar height={dayHeight} />
      <GoalProgressBar height={weekHeight} />
      <GoalProgressBar height={monthHeight} />
      <div className=" absolute -right-2 h-full rotate-90 text-sm opacity-50">
        <div>{extractTimeFormat(secondsRemaining)}</div>
      </div>
    </div>
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

function calculateTotalTimes(timers: Timer[]) {
  if (!timers) {
    return { monthHeight: 0, weekHeight: 0, dayHeight: 0 };
  }
  // temporary
  const [dayHours, weekHours, monthHours] = timers.reduce(
    (accumulator, timer) => {
      const { startTime, endTime } = timer;
      const startDay = subtractDate("day", startTime);
      const startWeek = subtractDate("week", startTime);
      const startMonth = subtractDate("month", startTime);

      const timerDuration = endTime.getTime() - startTime.getTime();

      if (startTime.getTime() > startDay.getTime()) {
        accumulator[0] += timerDuration;
      }

      if (startTime.getTime() > startWeek.getTime()) {
        accumulator[1] += timerDuration;
      }

      if (startTime.getTime() > startMonth.getTime()) {
        accumulator[2] += timerDuration;
      }
      return accumulator;
    },
    [0, 0, 0],
  );

  const tallyObject = { dayHours, weekHours, monthHours };
  console.debug("Calculated the following hours: ", tallyObject);

  return tallyObject;
}

function subtractDate(type: "month" | "day" | "week", startTime: Date) {
  const date = new Date();
  if (type === "day") {
    date.setHours(startTime.getHours() - 24);
  }
  if (type === "week") {
    date.setDate(startTime.getDate() - 7);
  }
  if (type === "month") {
    date.setMonth(startTime.getMonth() - 1);
  }
  return date;
}

export default TimerComponent;
