import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, Outlet, redirect, useParams, useSubmit } from "@remix-run/react";
import { useRef } from "react";
import invariant from "tiny-invariant";

import { createTodo } from "~/models/todo.server";
import { getWorkspace } from "~/models/workspace.server";
import { requireUserId } from "~/session.server";
import { INTENTS } from "~/types/types";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("todoTitle");
  const id = String(formData.get("id"));
  const category = String(formData.get("category"));
  const goal = String(formData.get("goal"));

  const { workspaceId } = params;
  invariant(workspaceId, "workspace not found");

  const workspace = await getWorkspace({ id: workspaceId, userId });

  const count = workspace?.todos ? workspace.todos.length : 0;

  if (!title || typeof title !== "string") {
    console.error(formData.get("todoTitle"));
    return new Response("No title", { status: 400 });
  }
  await createTodo({
    id,
    title,
    workspaceId,
    category,
    goal: parseInt(goal),
    order: count + 1,
  });

  return redirect(`todos`);
};

export default function WorkspaceDetailsPage() {
  const inputFormRef = useRef<HTMLFormElement>(null);

  const params = useParams();

  const submit = useSubmit();

  return (
    <section
      id="note-list"
      className="bg-my-secondary-lighten-03 w-full flex flex-col h-full pl-20 pt-4"
    >
      <div className="sub-header flex justify-between items-center ">
        <h1 className=" text-4xl">Tasks</h1>
        {/* TODO - NEED TO IMPLEMENT DATE FUNCTIONALITY */}
        <div className="pr-20">
          <h1 className=" text-xl">AUGUST</h1>
          <h1 className=" text-7xl">06</h1>
        </div>
      </div>
      <Form
        className="flex flex-col text-left w-full "
        ref={inputFormRef}
        method="post"
        onSubmit={(event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const id = crypto.randomUUID();
          const workspaceId = params.workspaceId;

          formData.append("id", id);
          formData.append("order", "1");
          formData.append("category", "current");
          formData.append("goal", "1");
          formData.append("workspaceId", workspaceId ?? "");

          submit(formData, { method: "post", navigate: false });

          invariant(inputFormRef.current);
          inputFormRef.current.value = "";
        }}
      >
        <input type="hidden" name="intent" value={INTENTS.createTodo} />
        <input
          type="text"
          id="todoTitle"
          name="todoTitle"
          required
          placeholder="+ add a task and hit enter"
          className=" bg-my-primary-lighten-03 w-1/2 placeholder-black placeholder-opacity-80 pt-4 pb-4 shadow-md outline-none indent-10"
        />
      </Form>
      <Outlet />
    </section>
  );
}
