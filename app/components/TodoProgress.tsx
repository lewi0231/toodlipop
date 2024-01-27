import { Timer } from "@prisma/client";

import { TimerProp } from "~/types/types";

const TodoProgress = ({
  timers: timersProp,
  goal,
}: {
  timers: TimerProp[];
  goal: number;
}) => {
  const timers = convertTimerStringsToDates(timersProp);

  const widths = extractRelativeHeights(timers, goal * 60 * 60 * 1000);

  let todoWidth = 0;
  if (widths) {
    [todoWidth] = widths;
  }

  return (
    <div
      style={{ width: `${todoWidth}%` }}
      className=" absolute left-0 top-0 bg-black bg-opacity-10 h-full"
    ></div>
  );
};

function calculateTotalTimes(timers: Timer[]) {
  const [dayMS, weekMS, monthMS] = timers.reduce(
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

  const tallyObject = { dayMS, weekMS, monthMS };

  return tallyObject;
}

function extractRelativeHeights(timers: Timer[] | undefined, goal: number) {
  if (!timers) {
    console.debug("No timers were found");
    return null;
  }

  const result = calculateTotalTimes(timers);
  if (!result) {
    console.debug("timers not able to be calculated: no result");
    return null;
  } else {
    const { dayMS, weekMS, monthMS } = result;

    const toBeReturned = [
      safeConvertToPercentage(goal, dayMS),
      safeConvertToPercentage(goal, weekMS),
      safeConvertToPercentage(goal, monthMS),
    ];

    return toBeReturned;
  }
}

function safeConvertToPercentage(goal: number, ms: number) {
  if (ms === 0) {
    return 0;
  }

  if (ms > goal) {
    return 100;
  }

  return (ms / goal) * 100;
}

function subtractDate(type: "month" | "day" | "week", startTime: Date) {
  const date = new Date();
  const newStartTime = new Date(startTime);
  if (type === "day") {
    date.setHours(newStartTime.getHours() - 24);
  }
  if (type === "week") {
    date.setDate(newStartTime.getDate() - 7);
  }
  if (type === "month") {
    date.setMonth(newStartTime.getMonth() - 1);
  }
  return date;
}

function convertTimerStringsToDates(timers: TimerProp[] | undefined) {
  if (!timers) {
    return [];
  }
  return timers.map((timer) => {
    const start = new Date(timer.startTime);
    const end = new Date(timer.endTime);

    return {
      ...timer,
      startTime: start,
      endTime: end,
    };
  });
}

export default TodoProgress;
