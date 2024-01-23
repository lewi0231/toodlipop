import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useFetcher,
  useRouteError,
} from "@remix-run/react";
import { RiMoreFill, RiPencilLine, RiTimeLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";

import Spinner from "~/components/Spinner";
import TodoProgress from "~/components/TodoProgress";
import { createTimer } from "~/models/timer.server";
import { requireUser } from "~/session.server";

import { TodoProp } from "./workspaces.$workspaceId.todos";

const DEFAULT_TIMER_DURATION = 30;

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request);
  // const url = new URL(request.url);
  // const todoId = url.searchParams.get("todoId");
  // invariant(typeof todoId === "string", "todoId is required");

  // const timersResult = await getTimerList({ todoId });
  // console.debug("timers from loader", timersResult);
  // return json({
  //   timers: timersResult ?? [],
  // });
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const startTime = new Date(formData.get("startTime")!.toString());
  const endTime = new Date(formData.get("endTime")!.toString());
  const secondsRemaining = parseInt(
    formData.get("secondsRemaining")!.toString(),
  );

  const todoId = formData.get("todoId")?.toString() ?? "";

  const toBeSaved = { todoId, startTime, endTime, secondsRemaining };
  console.log("about to save", toBeSaved);

  return createTimer(toBeSaved);
}

export function Timer({ todo }: { todo: TodoProp }) {
  const fetcher = useFetcher();

  const timers = todo.timers;

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date>();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return timers.length > 0
      ? timers[timers.length - 1].secondsRemaining
      : DEFAULT_TIMER_DURATION;
  });
  const prevIsTimerRunning = usePrevious(isTimerRunning);

  console.log("isTimerRunning", isTimerRunning);

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
    // if (!secondsRemaining) {
    //   const storageObj = localStorage.getItem(todo.id);
    //   if (storageObj) {
    //     const parsed = JSON.parse(storageObj);
    //     setSecondsRemaining(parsed.secondsRemaining);
    //   }
    // }

    const resetTimer = () => {
      console.log(isTimerRunning);
      setIsTimerRunning(false);
      setStartTime(undefined);
      setSecondsRemaining(DEFAULT_TIMER_DURATION);
    };

    if (secondsRemaining < 0) {
      resetTimer();
    }

    if (isTimerRunning) {
      if (!startTime) {
        setStartTime(new Date());
      }
      intervalId = setInterval(handleTimerCountdown, 1000);

      if (secondsRemaining) {
        localStorage.setItem(
          todo.id,
          JSON.stringify({
            secondsRemaining: DEFAULT_TIMER_DURATION,
          }),
        );
      }

      if (secondsRemaining && secondsRemaining < 0) {
        resetTimer();
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
      formData.append("todoId", todo.id.toString());
      fetcher.submit(formData, {
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
    fetcher,
    secondsRemaining,
    todo.id,
    prevIsTimerRunning,
    timers,
  ]);

  return (
    <>
      <TodoProgress timers={timers} goal={todo.goal} />

      <div className=" absolute -right-2 h-full rotate-90 text-sm opacity-50">
        {secondsRemaining ? (
          <div>{extractTimeFormat(secondsRemaining)}</div>
        ) : (
          <Spinner showSpinner={true} />
        )}
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

function usePrevious(value: boolean) {
  const ref = useRef<boolean | undefined>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

function extractTimeFormat(timeLeft: number) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const minuteString = `${minutes < 10 ? "0" + minutes : minutes}`;
  const secondsString = `${seconds < 10 ? "0" + seconds : seconds}`;

  return `${minuteString}:${secondsString}`;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>;
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>;
  }

  if (error.status === 404) {
    return <div>Workspace not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
