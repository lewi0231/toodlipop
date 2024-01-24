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
  await createTodo({ title, workspaceId });

  // possible won't needs this
  // const workspace = await getWorkspace({ id: workspaceId, userId });

  return redirect(`todos`);
};

export default function WorkspaceDetailsPage() {
  const inputFormRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    inputFormRef.current?.reset();
  }, [isSubmitting]);

  return (
    <section
      id="note-list"
      className="bg-my-secondary-lighten-03 w-full flex flex-col h-full pl-14 pt-4"
    >
      <div className="sub-header flex justify-between items-center ">
        <h1 className=" text-4xl">Tasks</h1>
        <div className="pr-20">
          <h1 className=" text-xl">AUGUST</h1>
          <h1 className=" text-7xl">06</h1>
        </div>
      </div>
      <Form
        className="flex flex-col text-left w-full "
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
          className=" bg-my-primary-lighten-03 w-1/2 placeholder-black placeholder-opacity-80 pt-4 pb-4 shadow-md outline-none indent-10"
        />
      </Form>
      <div className="flex w-2/3 gap-5 mt-10">
        <h1 className=" text-xl w-1/2 font-semibold pb-3">Current </h1>
      </div>
      <div className="flex flex-col gap-3w-full gap-3">
        <Outlet />
      </div>
    </section>
  );
}
