import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useFetchers, useLoaderData } from "@remix-run/react";
import { useCallback, useState } from "react";
import invariant from "tiny-invariant";

import { TodoCard } from "~/components/TodoCard";
import { createTimer } from "~/models/timer.server";
import { deleteTodo, getTodoListItems, updateTodo } from "~/models/todo.server";
import { CONTENT_TYPES, INTENTS, TimerProp, TodoProp } from "~/types/types";

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

  const todoId = String(formData.get("todoId"));
  invariant(todoId, "need a todo id");

  const intent = String(formData.get("intent"));
  invariant(intent, "intent is required for action");

  let result;
  try {
    if (intent === INTENTS.deleteTodo) {
      console.debug("deleting todo ", todoId);
      result = await deleteTodo({ id: todoId });
    } else if (intent === INTENTS.updateTodoTitle) {
      const title = String(formData.get("title"));

      console.debug("Updating todo title", todoId, title);
      result = await updateTodo({ id: todoId, title });
    } else if (intent === INTENTS.updateTodoOrder) {
      const orderString = String(formData.get("order"));
      invariant(orderString, "order is not defined");
      const order = parseInt(orderString);

      const category = String(formData.get("category"));
      invariant(category, "category is not defined");

      result = await updateTodo({ id: todoId, order, category });
    } else if (intent === INTENTS.createTimer) {
      const startTime = new Date(String(formData.get("startTime")));
      const endTime = new Date(String(formData.get("endTime")));
      const secondsRemaining = parseInt(
        String(formData.get("secondsRemaining")),
      );

      const toBeSaved = { todoId, startTime, endTime, secondsRemaining };

      result = await createTimer(toBeSaved);
    }
  } catch (error) {
    result = error;
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
        return (
          fetcher.formData.get("intent") === INTENTS.updateTodoTitle ||
          fetcher.formData.get("intent") === INTENTS.updateTodoOrder
        );
      })
      .map((fetcher) => {
        if (fetcher.formData.get("intent") === INTENTS.updateTodoTitle) {
          return {
            todoId: String(fetcher.formData.get("todoId")),
            title: String(fetcher.formData.get("title")),
          };
        } else {
          return {
            todoId: String(fetcher.formData.get("todoId")),
            category: String(fetcher.formData.get("category")),
            order: parseInt(String(fetcher.formData.get("order"))),
          };
        }
      });
  };

  const updatingTodos = useUpdatingTodos();
  console.log("There is to be updated", updatingTodos);

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
      formData.append("intent", INTENTS.updateTodoOrder);
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
            <TodoCard
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

export default TodoListPage;
