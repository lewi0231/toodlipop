import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef } from "react";

import {
  createWorkspace,
  getWorkspaceListItems,
} from "~/models/workspace.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const workspaceListItems = await getWorkspaceListItems({ userId });
  return json({ workspaceListItems });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString();

  const userId = await requireUserId(request);

  if (!title) {
    throw new Response("no input", { status: 404 });
  }
  return createWorkspace({ title, userId });
};

export default function WorkspacesPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const inputFormRef = useRef<HTMLFormElement>(null);
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  useEffect(() => {
    inputFormRef.current?.reset();
  }, [isSubmitting]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Form
            className="flex flex-col text-left w-800px"
            ref={inputFormRef}
            method="post"
          >
            <input
              className="m-0 w-full block p-4 bg-white border-2px border-black"
              type="text"
              placeholder="+ create workspace hit enter"
              disabled={isSubmitting}
              name="title"
              id="title"
              required
            />
          </Form>

          <hr />

          {data.workspaceListItems.length === 0 ? (
            <p className="p-4">No notes yet</p>
          ) : (
            <ol>
              {data.workspaceListItems.map((workspace) => (
                <li key={workspace.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={workspace.id}
                  >
                    📝 {workspace.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
