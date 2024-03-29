import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useRef } from "react";

import { createSubtask } from "~/models/subtask.server";
import { getTodo } from "~/models/todo.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { todoId } = params;
  if (!todoId) {
    throw new Response("Param todo id not found", { status: 404 });
  }
  const todo = await getTodo({ id: todoId });

  if (!todo) {
    throw new Response(" todo id not found", { status: 404 });
  }
  return json({ todo });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { todoId } = params;
  let result;
  if (formData.has("subtask")) {
    const subtask = formData.get("subtask") as string;
    if (todoId) {
      result = createSubtask({ todoId, note: subtask });
    }
  }
  return result;
};

const TodoDetailPage = () => {
  const { todo } = useLoaderData<typeof loader>();
  const inputRef = useRef<HTMLFormElement>(null);

  return (
    <div className=" min-h-lvh pl-20 bg-my-secondary-lighten-03">
      <h1 className=" underline text-3xl pt-10">{todo.title}</h1>
      <div className="mt-10 w-2/3 flex flex-col gap-5 pb-10">
        <div className="flex justify-between">
          <h4>Date Created: </h4>
          <h4 className="w-1/2 text-left">{todo.createdAt}</h4>
        </div>
        <div className="flex justify-between">
          <h4>Completed: </h4>
          <h4 className="w-1/2 text-left">
            {todo.category !== "Complete" ? "In Progress" : "Complete"}
          </h4>
        </div>
        <div className="flex justify-between">
          <h4 className="w-1/2">Goal (minutes per day)</h4>
          <h4 className="w-1/2 text-left">
            {todo.goal} ~ {todo.goal * 60} min
          </h4>
        </div>
      </div>
      <hr />
      <div className="h-44 w-1/2 flex flex-col gap-2 pt-3 pb-3">
        <div className=" bg-slate-500 h-1/3 "></div>
        <div className=" bg-slate-600 h-1/3"></div>
        <div className=" bg-slate-400 h-1/3"></div>
      </div>
      <hr />
      <div className="w-1/2 pt-5">
        <Form method="post" ref={inputRef} className="cursor-crosshair">
          <input
            className="w-full h-10 outline-none "
            type="text"
            name="subtask"
            placeholder="+ add a sub task"
          />
        </Form>
        <div className="pt-3 flex gap-5">
          {todo.subtask.map((task) => {
            return (
              <div
                className="shadow-md text-slate-800 text-md p-3 rounded-md bg-slate-100"
                key={task.id}
              >
                {task.note}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TodoDetailPage;
