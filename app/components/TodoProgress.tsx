import { Timer } from "@prisma/client";

export interface TimerProp {
  id: string;
  startTime: string;
  endTime: string;
  secondsRemaining: number;
  todoId: string;
}

const TodoProgress = ({
  timers: timersProp,
  goal,
}: {
  timers: TimerProp[];
  goal: number;
}) => {
  const timers = convertTimerStringsToDates(timersProp);

  const heightResult = extractRelativeHeights(timers, goal * 60 * 1000 * 1000);

  const dayHeight = 50;

  // if (heightResult) {
  //   [dayHeight] = heightResult;
  // }

  return (
    <div
      style={{ width: `${dayHeight}%` }}
      className=" absolute left-0 top-0 bg-my-tertiary bg-opacity-10 h-full"
    ></div>
  );
};

function calculateTotalTimes(timers: Timer[]) {
  console.debug("Timers to be calculated are:", timers);
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
  console.log(result, goal);
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
