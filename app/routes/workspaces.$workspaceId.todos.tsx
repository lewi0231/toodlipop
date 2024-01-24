import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { RiMoreFill, RiPencilLine, RiTimeLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";

import TimerComponent from "~/components/TimerComponent";
import { createTimer } from "~/models/timer.server";
import { getTodoListItems, updateTodo } from "~/models/todo.server";

import audioSrc from "../audio/complete.wav";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { workspaceId } = params;
  if (!workspaceId) {
    throw new Response("require workspaceId", {
      status: 400,
    });
  }
  // This is
  const todos = await getTodoListItems({ workspaceId });

  if (!todos) {
    throw new Response("there was a problem fetching todos", {
      status: 500,
    });
  }
  return json({ todos });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  if (formData.has("title") && formData.has("todoId")) {
    const title = formData.get("title") as string;
    const todoId = formData.get("todoId") as string;

    console.debug("Updating todo title", todoId, title);
    return updateTodo({ id: todoId, title });
  } else {
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
};

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
  complete: boolean;
  goal: number;
  workspaceId: string;
  timers: TimerProp[];
}

const TodoListPage = () => {
  const params = useParams();
  const data = useLoaderData<typeof loader>();

  const mappedTodos = data.todos.map((todo: TodoProp) => {
    return (
      <Link
        className=" border-2 border-opacity-5 rounded-md border-black w-1/2"
        to={`/workspaces/${params.workspaceId}/${todo.id}`}
        key={todo.id}
      >
        <Todo todo={todo} />
      </Link>
    );
  });
  return <>{mappedTodos}</>;
};

function usePrevious(value: boolean) {
  const ref = useRef<boolean | undefined>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function Todo({ todo }: { todo: TodoProp }) {
  const editTodoInputRef = useRef<HTMLInputElement | null>(null);

  const fetcher = useFetcher();

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState(todo.title);
  const [audioPlayer, setAudioPlayer] = useState<
    HTMLAudioElement | undefined
  >();

  const prevIsTimerRunning = usePrevious(isTimerRunning);

  console.log("isTimerRunning", isTimerRunning);
  const handleOnToggleTimer = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsTimerRunning(!isTimerRunning);
  };

  const handleEditTodo = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleMoreOptions = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const handleTitleOnBlur = () => {
    const formData = new FormData();
    formData.append("todoId", todo.id.toString());
    formData.append("title", title.toString());
    fetcher.submit(formData, {
      method: "post",
    });

    setIsEditing(false);
  };

  const handleOnTimeEnd = () => {
    // Save to db
    if (startTime) {
      const formData = new FormData();
      formData.append("startTime", startTime.toISOString());
      formData.append("endTime", new Date().toISOString());
      formData.append("secondsRemaining", "0");
      formData.append("todoId", todo.id.toString());
      fetcher.submit(formData, {
        method: "post",
      });
    }

    if (audioPlayer) {
      audioPlayer.play();
    }

    setIsTimerRunning(false);
    setStartTime(undefined);

    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Timer completed!", {
            body: "Your timer has finished!",
          });
        }
      });
    } else if (Notification.permission === "granted") {
      new Notification("Timer completed!", {
        body: "Your timer has finished!",
      });
    }
  };

  useEffect(() => {
    if (isTimerRunning && !prevIsTimerRunning && !startTime) {
      setStartTime(new Date());
    }

    if (isEditing) {
      editTodoInputRef.current?.focus();
    }

    // This needs to be here because otherwise attempts to SSR - and can't.
    setAudioPlayer(new Audio(audioSrc));
  }, [isTimerRunning, prevIsTimerRunning, startTime, isEditing]);

  return (
    <div className=" bg-my-primary-lighten-03  w-full cursor-pointer rounded flex h-16 box-border gap-5 relative border-1 group shadow-md hover:shadow-lg hover:bg-my-primary-lighten-03 hover:bg-opacity-60 bg-opacity">
      <div className="flex items-center absolute top-0 left-0 h-full w-full">
        {isEditing ? (
          <input
            ref={editTodoInputRef}
            className=" w-full h-full outline-none pl-10 cursor-text bg-my-primary-lighten-03 bg-opacity-70"
            type="text"
            value={title}
            onBlur={handleTitleOnBlur}
            onChange={(e) => setTitle(e.target.value)}
            onClick={(e) => e.preventDefault()}
          />
        ) : (
          <h1 className="w-full pl-10 text-my-primary-darken-04">{title}</h1>
        )}
      </div>
      <TimerComponent
        isTimerRunning={isTimerRunning}
        handleOnTimeEnd={handleOnTimeEnd}
        todoId={todo.id}
        timers={todo.timers}
        goal={todo.goal}
      />
      <div className="absolute hidden top-0 right-20 bg-my-primary-lighten-03 bg-opacity-50 items-center h-1/2 w-1/4 text-sm rounded group-hover:flex group-hover:justify-between px-3 shadow-md">
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
    </div>
  );
}

export default TodoListPage;
