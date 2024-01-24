import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import { useEffect, useRef } from "react";

import {
  createWorkspace,
  getWorkspaceListItems,
} from "~/models/workspace.server";
import { requireUserId } from "~/session.server";

import WorkspaceList from "../components/WorkspaceList";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title")?.toString();

  const userId = await requireUserId(request);

  if (!title) {
    throw new Response("no input", { status: 404 });
  }
  return createWorkspace({ title, userId });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const workspaces = await getWorkspaceListItems({ userId });
  console.debug(workspaces);
  return json({ workspaces });
};

export default function WorkspacesPage() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const inputFormRef = useRef<HTMLFormElement>(null);
  const { workspaces } = useLoaderData<typeof loader>();

  useEffect(() => {
    inputFormRef.current?.reset();
  }, [isSubmitting]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-my-primary p-4 text-black">
        <h1 className="text-3xl font-bold">
          <Link to=".">Toodlipop</Link>
        </h1>

        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-my-tertiary px-4 py-2 text-my-secondary hover:bg-my-secondary hover:text-my-tertiary active:bg-my-secondary"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-my-primary-lighten-02">
        <div className="w-72">
          <Form
            className="flex flex-col text-left"
            ref={inputFormRef}
            method="post"
          >
            <input
              className="m-0 w-full block p-4 bg-my-primary-lighten-03 outline-none"
              type="text"
              placeholder="+ create workspace"
              disabled={isSubmitting}
              name="title"
              id="title"
              required
            />
          </Form>
          <hr />
          <WorkspaceList workspaces={workspaces} />
        </div>
        <div className="flex-1 p-0">
          <Outlet />
        </div>
      </main>
    </div>
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
    return <div>Workspace not found</div>;
  }

  return <div>An unexpected error occurred: {error.statusText}</div>;
}
