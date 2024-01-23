import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";

import { getTodoListItems } from "~/models/todo.server";

import { Timer } from "./resources.timer";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { workspaceId } = params;
  if (!workspaceId) {
    throw new Response("require workspaceId", {
      status: 400,
    });
  }
  // This is
  const todos: TodoProp[] = await getTodoListItems({ workspaceId });

  if (!todos) {
    throw new Response("there was a problem fetching todos", {
      status: 500,
    });
  }
  return json({ todos });
};

export interface TodoProp {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  complete: boolean;
  goal: number;
  workspaceId: string;
  timers: {
    id: string;
    startTime: string;
    endTime: string;
    secondsRemaining: number;
    todoId: string;
  }[];
}

const TodoListPage = () => {
  const params = useParams();
  const data = useLoaderData<typeof loader>();

  const mappedTodos = data.todos.map((todo: TodoProp) => {
    return (
      <Link to={`/workspaces/${params.workspaceId}/${todo.id}`} key={todo.id}>
        <Todo todo={todo} />
      </Link>
    );
  });
  return <>{mappedTodos}</>;
};

export function Todo({ todo }: { todo: TodoProp }) {
  return (
    <div className=" bg-my-secondary bg-opacity-10 w-2/3 cursor-pointer rounded flex h-16 box-border gap-5 relative hover:bg-opacity-20 border-1 border-my-tertiary border-opacity-10 group">
      <div className="w-1/2"></div>
      <div className="flex items-center absolute top-0 left-5 h-full">
        <h1 className="w-full">{todo.title}</h1>
      </div>
      <Timer todo={todo} />
    </div>
  );
}

export default TodoListPage;
