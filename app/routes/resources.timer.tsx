import type { Timer } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { RiMoreFill, RiPencilLine, RiTimeLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import GoalProgressBar from "~/components/GoalProgressBar";
import { createTimer, getTimerList } from "~/models/timer.server";
import { requireUser } from "~/session.server";

const DEFAULT_TIMER_DURATION = 30;

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  const url = new URL(request.url);
  const todoId = url.searchParams.get("todoId");
  invariant(typeof todoId === "string", "todoId is required");

  const timersResult = await getTimerList({ todoId });

  if (!timersResult) {
    throw new Response("There was a problem fetching timers", { status: 500 });
  }

  return json({
    timers: timersResult,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const startTime = new Date(formData.get("startTime")!.toString());
  const endTime = new Date(formData.get("endTime")!.toString());
  const secondsRemaining = parseInt(
    formData.get("secondsRemaining")!.toString(),
  );
  const todoId = formData.get("todoId")?.toString() ?? "";

  return createTimer({ todoId, startTime, endTime, secondsRemaining });
}

export function Timer({ todoId, goal }: { todoId: string; goal: number }) {
  const timerFetcher = useFetcher<typeof loader>();
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date>();
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const prevIsTimerRunning = usePrevious(isTimerRunning);

  const timers = timerFetcher.data?.timers;
  const [dayHeight, weekHeight, monthHeight] = extractRelativeHeights(
    timers,
    goal,
  );

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

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (secondsRemaining === null) {
      setSecondsRemaining(() => {
        return JSON.parse(
          localStorage.getItem("secondsRemaining") ||
            DEFAULT_TIMER_DURATION.toString(),
        );
      });
    }

    if (isTimerRunning) {
      if (!startTime) {
        setStartTime(new Date());
      }
      intervalId = setInterval(handleTimerCountdown, 1000);

      if (secondsRemaining === 0) {
        setIsTimerRunning(false);
        setStartTime(undefined);
        setSecondsRemaining(DEFAULT_TIMER_DURATION);
      }

      if (secondsRemaining) {
        localStorage.setItem(
          "secondsRemaining",
          JSON.stringify(secondsRemaining),
        );
      }
    }

    function handleTimerCountdown() {
      setSecondsRemaining((prev) => prev! - 1);
    }

    if (
      !isTimerRunning &&
      prevIsTimerRunning &&
      startTime &&
      secondsRemaining &&
      secondsRemaining >= 0
    ) {
      const formData = new FormData();
      formData.append("startTime", startTime.toISOString());
      formData.append("endTime", new Date().toISOString());
      formData.append("secondsRemaining", secondsRemaining.toString());
      formData.append("todoId", todoId.toString());
      timerFetcher.submit(formData, {
        method: "post",
        action: "/resources/timer",
      });
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [
    startTime,
    isTimerRunning,
    timerFetcher,
    secondsRemaining,
    todoId,
    prevIsTimerRunning,
    timers,
  ]);

  return (
    <>
      <div className="w-1/2 flex relative gap-5">
        <GoalProgressBar height={dayHeight} />
        <GoalProgressBar height={weekHeight} />
        <GoalProgressBar height={monthHeight} />
        <div className=" absolute -right-2 h-full rotate-90 text-sm opacity-50">
          {secondsRemaining ? (
            <div>{extractTimeFormat(secondsRemaining)}</div>
          ) : (
            <div>loading...</div>
          )}
        </div>
      </div>

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
}

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
    return { dayHours: 0, weekHours: 0, monthHours: 0 };
  }

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

function extractRelativeHeights(timers: Timer[] | undefined, goal: number) {
  if (!timers) {
    return [0, 0, 0];
  }
  const { dayHours, weekHours, monthHours } = calculateTotalTimes(timers);

  return [
    (dayHours / goal) * 100,
    (weekHours / goal) * 100,
    (monthHours / goal) * 100,
  ];
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

function usePrevious(value: boolean) {
  const ref = useRef<boolean | undefined>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
