import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";

import Todo from "~/components/Todo";
import { createTodo } from "~/models/todo.server";
import { getWorkspace } from "~/models/workspace.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.workspaceId, "workspaceId not found");

  const workspace = await getWorkspace({ id: params.workspaceId, userId });
  if (!workspace) {
    throw new Response("Not Found", { status: 404 });
  }

  const todos = workspace.todos;
  console.log("current todos for wkspace", todos);
  return json({ id: workspace.id, todos });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  console.log("hello");
  const title = formData.get("todoTitle");
  const { workspaceId } = params;
  invariant(workspaceId, "workspace not found");

  if (!title || typeof title !== "string") {
    console.log(formData.get("todoTitle"));
    return new Response("No title", { status: 400 });
  }
  const newTodo = await createTodo({ title, workspaceId });
  console.log("Just created a todo", newTodo);

  return redirect(`/workspaces/${workspaceId}`);
};

export default function WorkspaceDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const inputFormRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    inputFormRef.current?.reset();
  }, [isSubmitting]);

  return (
    <section id="note-list" className="w-full flex flex-col mt-10">
      <Form
        className="flex flex-col text-left w-[800px]"
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
          className=" bg-my-tertiary bg-opacity-10 w-2/3 h-[40px] placeholder-my-tertiary placeholder-opacity-80 pl-10"
        />
      </Form>

      <div className="flex w-2/3  pl-5 gap-5">
        <h1 className=" text-xl w-1/2 font-semibold p-0">Current </h1>
        <div className="w-1/2 flex gap-5 opacity-60 text-sm h-10 items-end">
          <span className=" w-1/3 text-center ">month</span>
          <span className=" w-1/3 text-center">week</span>
          <span className=" w-1/3 text-center">day</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {data.todos.map((todo) => (
          <Link to={`${todo.id}`} key={todo.id}>
            <Todo todo={todo} />
          </Link>
        ))}
      </div>
    </section>
  );
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
    return <div>Note not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
