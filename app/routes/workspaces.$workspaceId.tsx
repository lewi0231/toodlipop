import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, Outlet, redirect, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

import { createTodo } from "~/models/todo.server";
import { requireUserId } from "~/session.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get("todoTitle");
  const { workspaceId } = params;
  invariant(workspaceId, "workspace not found");

  if (!title || typeof title !== "string") {
    console.log(formData.get("todoTitle"));
    return new Response("No title", { status: 400 });
  }
  const newTodo = await createTodo({ title, workspaceId });
  console.log("Just created a todo", newTodo);
  return redirect(`todos`);
};

export default function WorkspaceDetailsPage() {
  // const data = useLoaderData<typeof loader>();
  const inputFormRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    inputFormRef.current?.reset();
  }, [isSubmitting]);

  return (
    <section
      id="note-list"
      className="bg-my-primary w-full flex flex-col  h-full"
    >
      <Form
        className="flex flex-col text-left w-full"
        ref={inputFormRef}
        method="post"
      >
        <input
          type="text"
          id="todoTitle"
          name="todoTitle"
          required
          disabled={isSubmitting}
          placeholder="+ add a task and hit enter"
          className=" bg-my-tertiary bg-opacity-10 w-2/3 placeholder-my-tertiary placeholder-opacity-70 ml-10 pt-4 pb-4"
        />
      </Form>

      <div className="flex w-2/3  pl-5 gap-5 mt-20 ml-10">
        <h1 className=" text-xl w-1/2 font-semibold p-0">Current </h1>
        <div className="w-1/2 flex gap-5 opacity-60 text-sm h-10 items-end">
          <span className=" w-1/3 text-center ">month</span>
          <span className=" w-1/3 text-center">week</span>
          <span className=" w-1/3 text-center">day</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 ml-10 w-full">
        <Outlet />
      </div>
    </section>
  );
}
