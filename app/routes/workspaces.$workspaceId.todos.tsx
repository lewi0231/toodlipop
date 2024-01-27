import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useFetchers, useLoaderData } from "@remix-run/react";
import { RiMoreFill, RiPencilLine, RiTimeLine } from "@remixicon/react";
import { useCallback, useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import TimerComponent from "~/components/TimerComponent";
import { createTimer } from "~/models/timer.server";
import { getTodoListItems, updateTodo } from "~/models/todo.server";
import { CONTENT_TYPES, INTENTS, TimerProp, TodoProp } from "~/types/types";

import audioSrc from "../audio/complete.wav";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { workspaceId } = params;
  if (!workspaceId) {
    throw new Response("require workspaceId", {
      status: 400,
    });
  }

  let result;
  try {
    result = await getTodoListItems({ workspaceId });
    console.log(result);
  } catch (error) {
    result = { error: true };

    throw new Response("there was a problem fetching todos", {
      status: 500,
    });
  }

  return json(result);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const todoId = formData.get("todoId") as string;
  invariant(todoId, "need a todo id");

  let result;
  try {
    if (formData.has("title")) {
      const title = String(formData.get("title"));

      console.debug("Updating todo title", todoId, title);
      result = await updateTodo({ id: todoId, title });
    } else if (formData.has("category")) {
      const orderString = String(formData.get("order"));
      invariant(orderString, "order is not defined");
      const order = parseInt(orderString);

      const category = String(formData.get("category"));
      invariant(category, "category is not defined");

      result = await updateTodo({ id: todoId, order, category });
    } else {
      const todoId = formData.get("todoId") as string;
      const startTime = new Date(formData.get("startTime")!.toString());
      const endTime = new Date(formData.get("endTime")!.toString());
      const secondsRemaining = parseInt(
        formData.get("secondsRemaining")!.toString(),
      );

      const toBeSaved = { todoId, startTime, endTime, secondsRemaining };
      console.log("about to save", toBeSaved);

      result = await createTimer(toBeSaved);
    }
  } catch (error) {
    result = "error";
  }
  console.debug("Action function result ", result);
  return json(result);
};

const TodoListPage = () => {
  const initialData = useLoaderData<typeof loader>();
  const fetchers = useFetchers();

  const todosById = new Map(initialData.map((todo) => [todo.id, todo]));

  const usePendingTodos = () => {
    type PendingTodo = ReturnType<typeof useFetchers>[number] & {
      formData: FormData;
    };

    return fetchers
      .filter((fetcher): fetcher is PendingTodo => {
        if (!fetcher.formData) return false;
        return fetcher.formData.get("intent") === INTENTS.createTodo;
      })
      .map((fetcher) => {
        return {
          title: String(fetcher.formData.get("todoTitle")),
          id: String(fetcher.formData.get("id")),
          category: String(fetcher.formData.get("category")),
          order: parseInt(String(fetcher.formData.get("order"))),
          goal: parseInt(String(fetcher.formData.get("goal"))),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          workspaceId: String(fetcher.formData.get("workspaceId")),
        };
      });
  };

  const pendingTodos = usePendingTodos();

  for (const pendingTodo of pendingTodos) {
    const todo = todosById.get(pendingTodo.id);
    const timers: TimerProp[] = [];
    const mergedTodo: TodoProp = todo
      ? { ...todo, ...pendingTodo }
      : { ...pendingTodo, timers };
    todosById.set(pendingTodo.id, mergedTodo);
  }

  const useUpdatingTodos = () => {
    type PendingTodo = ReturnType<typeof useFetchers>[number] & {
      formData: FormData;
    };
    return fetchers
      .filter((fetcher): fetcher is PendingTodo => {
        if (!fetcher.formData) return false;
        return fetcher.formData.get("intent") === INTENTS.updateTodo;
      })
      .map((fetcher) => ({
        todoId: String(fetcher.formData.get("todoId")),
        category: String(fetcher.formData.get("category")),
        order: parseInt(String(fetcher.formData.get("order"))),
      }));
  };

  const updatingTodos = useUpdatingTodos();

  for (const updatingTodo of updatingTodos) {
    const todo = todosById.get(updatingTodo.todoId);
    if (todo) {
      todosById.set(updatingTodo.todoId, { ...todo, ...updatingTodo });
    }
  }

  const todos = Array.from(todosById.values());

  return (
    <>
      <div className="flex w-full gap-5">
        <TodoCategoryList todoList={todos} width="1/2" title="Current" />
        <TodoCategoryList
          todoList={todos}
          width="1/2"
          title="Later"
          paddingRight={20}
        />
      </div>
      <div>
        <TodoCategoryList todoList={todos} width="1/2" title="Complete" />
        <div className="min-w-1/2 mt-10 min-h-10"></div>
      </div>
    </>
  );
};

export function TodoCategoryList({
  todoList = [],
  title,
  paddingRight,
  width,
}: {
  todoList: TodoProp[];
  title: "Current" | "Later" | "Complete";
  paddingRight?: number;
  width: string;
}) {
  const [isOver, setIsOver] = useState(false);
  const fetcher = useFetcher();

  const filteredTodos = todoList.filter((todo) => {
    return todo.category === title.toLocaleLowerCase();
  });

  const handleOnDragOver = useCallback(
    (event: React.DragEvent) => {
      console.log(isOver);
      if (event.dataTransfer.types.includes(CONTENT_TYPES.todoCard)) {
        event.preventDefault();
        event.stopPropagation();

        setIsOver(true);
      }
    },
    [setIsOver, isOver],
  );

  const handleOnDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    let transfer;
    try {
      transfer = JSON.parse(event.dataTransfer.getData(CONTENT_TYPES.todoCard));
    } catch (error) {
      console.error("something went wrong with transfer data");
    }
    invariant(transfer.todoId, "missing todoId");

    if (isOver) {
      const formData = new FormData();
      formData.append("todoId", transfer.todoId);
      formData.append("category", title.toLowerCase());
      formData.append("order", String(todoList.length + 1));
      formData.append("intent", INTENTS.updateTodo);
      fetcher.submit(formData, { method: "post" });
    }

    setIsOver(false);
  };

  return (
    <div
      className={`h-full mt-10 ${paddingRight ? `pr-${paddingRight}` : ""} ${
        width ? `w-${width}` : ""
      } min-h-10`}
    >
      <h1 className=" text-xl w-full font-semibold pb-3">{title}</h1>
      <div
        onDragOver={handleOnDragOver}
        onDrop={handleOnDrop}
        onDragLeave={() => setIsOver(false)}
        className={`flex flex-col min-h-44 ${isOver ? "bg-slate-200" : ""}`}
      >
        {filteredTodos.map((todo, index) => {
          const previousOrder = filteredTodos[index - 1]
            ? filteredTodos[index - 1].order
            : 0;
          const nextOrder = filteredTodos[index + 1]
            ? filteredTodos[index + 1].order
            : todo.order + 1;

          return (
            <Todo
              key={todo.id}
              todo={todo}
              previousOrder={previousOrder}
              nextOrder={nextOrder}
            />
          );
        })}
      </div>
    </div>
  );
}

function usePrevious(value: boolean) {
  const ref = useRef<boolean | undefined>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function Todo({
  todo,
  previousOrder,
  nextOrder,
}: {
  todo: TodoProp;
  previousOrder: number;
  nextOrder: number;
}) {
  const editTodoInputRef = useRef<HTMLInputElement | null>(null);

  const fetcher = useFetcher();

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [startTime, setStartTime] = useState<Date>();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [title, setTitle] = useState(todo.title);
  const [audioPlayer, setAudioPlayer] = useState<
    HTMLAudioElement | undefined
  >();
  const [acceptDrop, setAcceptDrop] = useState<"none" | "bottom" | "top">();

  const prevIsTimerRunning = usePrevious(isTimerRunning);

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

  const submitTodoTitleChange = () => {
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

  const handleOnDragOver = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(CONTENT_TYPES.todoCard)) {
      event.preventDefault();
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      const midPoint = (rect.top + rect.bottom) / 2;
      setAcceptDrop(event.clientY <= midPoint ? "top" : "bottom");
    }
  };

  const handleOnDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    let transfer;
    try {
      transfer = JSON.parse(event.dataTransfer.getData(CONTENT_TYPES.todoCard));
    } catch (error) {
      console.error("something went wrong with transfer data");
    }

    invariant(transfer.todoId, "missing todoId");

    if (acceptDrop !== "none") {
      console.log("previous", previousOrder, "next", nextOrder);
      // reorder the current list of todos
      const droppedOrder = acceptDrop === "top" ? previousOrder : nextOrder;
      const moveOrder = (droppedOrder + todo.order) / 2;

      console.log("moveOrder is ", moveOrder, "todoID", transfer.todoID);

      // save that reorder list to the db.
      const formData = new FormData();
      formData.append("todoId", transfer.todoId.toString());
      formData.append("order", moveOrder.toString());
      formData.append("category", todo.category);
      formData.append("intent", INTENTS.updateTodo);
      fetcher.submit(formData, { method: "post" });

      setAcceptDrop("none");
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
    if (!audioPlayer) {
      setAudioPlayer(new Audio(audioSrc));
    }
  }, [isTimerRunning, prevIsTimerRunning, startTime, isEditing, audioPlayer]);

  const handleOnKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitTodoTitleChange();
    }
  };

  return (
    <div
      className={`border-2 border-transparent ${
        acceptDrop === "top"
          ? " border-t-red-950"
          : acceptDrop === "bottom"
          ? "border-b-red-950"
          : ""
      }`}
    >
      <Link
        draggable
        className={` rounded-md cursor-pointer active:cursor-grabbing `}
        to={`/workspaces/${todo.workspaceId}/${todo.id}`}
        key={todo.id}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData(
            CONTENT_TYPES.todoCard,
            JSON.stringify({ todoId: todo.id }),
          );
        }}
        onDragOver={(e) => handleOnDragOver(e)}
        onDragLeave={() => {
          setAcceptDrop("none");
        }}
        onDrop={handleOnDrop}
      >
        <div className=" bg-my-primary-lighten-03  w-full  rounded flex h-12 box-border gap-5 relative group shadow-md hover:shadow-lg hover:bg-my-primary-lighten-03 hover:bg-opacity-60 bg-opacity">
          <div className="flex items-center absolute top-0 left-0 h-full w-full">
            {isEditing ? (
              <input
                ref={editTodoInputRef}
                className=" w-full h-full outline-none pl-10 cursor-text bg-my-primary-lighten-03 bg-opacity-70"
                type="text"
                value={title}
                onBlur={() => submitTodoTitleChange()}
                onChange={(e) => setTitle(e.target.value)}
                onClick={(e) => e.preventDefault()}
                onKeyDown={handleOnKeyDown}
              />
            ) : (
              <h1 className="cursor-pointer w-full pl-10 text-my-primary-darken-04">
                {title}
              </h1>
            )}
          </div>
          <TimerComponent
            isTimerRunning={isTimerRunning}
            handleOnTimeEnd={handleOnTimeEnd}
            todoId={todo.id}
            timers={todo.timers ?? []}
            goal={todo.goal}
          />
          <div className="absolute hidden top-0 right-20 bg-my-primary-lighten-03 bg-opacity-50 items-center h-1/2 w-1/4 text-sm rounded group-hover:flex group-hover:justify-between px-3 shadow-md">
            <button onClick={handleEditTodo}>
              <RiPencilLine className="hover:opacity-50" color="black" />
            </button>
            <button onClick={handleOnToggleTimer}>
              <RiTimeLine
                className=" hover:opacity-50"
                size={20}
                color="black"
              />
            </button>
            <button onClick={handleMoreOptions}>
              <RiMoreFill
                className=" hover:opacity-50"
                size={20}
                color="black"
              />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default TodoListPage;
