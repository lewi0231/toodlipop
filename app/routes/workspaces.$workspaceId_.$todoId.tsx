import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useRef } from "react";

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

const TodoDetailPage = () => {
  const { todo } = useLoaderData<typeof loader>();
  const subtaskInputRef = useRef<HTMLFormElement>(null);

  return (
    <div className=" min-h-lvh pl-20">
      <h1 className=" underline text-3xl pt-10">{todo.title}</h1>
      <div className="mt-10 w-2/3 flex flex-col gap-5 pb-10">
        <div className="flex justify-between">
          <h4>Date Created: </h4>
          <h4 className="w-1/2 text-left">{todo.createdAt}</h4>
        </div>
        <div className="flex justify-between">
          <h4>Status: </h4>
          <h4 className="w-1/2 text-left">{todo.complete.toString()}</h4>
        </div>
        <div className="flex justify-between">
          <h4 className="w-1/2">Goal(hours)</h4>
          <h4 className="w-1/2 text-left">{todo.goal}</h4>
        </div>
      </div>
      <hr />
      <div className="h-[10em]">STATS</div>
      <hr />
      <div className="w-1/2">
        <Form method="post" ref={subtaskInputRef}>
          <input
            className="w-full h-10 outline-none"
            type="text"
            name="subtasks"
            placeholder="+ add a sub task"
          />
        </Form>
      </div>
    </div>
  );
};

export default TodoDetailPage;
