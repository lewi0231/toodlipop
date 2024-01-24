import type { Workspace } from "@prisma/client";
import { NavLink } from "@remix-run/react";

interface WorkspaceProps {
  workspaces: Pick<Workspace, "id" | "title">[];
}

const WorkspaceList = ({ workspaces }: WorkspaceProps) => {
  return (
    <div>
      {workspaces.length === 0 ? (
        <p className="p-4">No workspaces yet</p>
      ) : (
        <ol>
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <NavLink
                className={({ isActive }) =>
                  `block border-none hover:bg-my-primary  p-4 text-md ${
                    isActive ? "bg-my-primary bg-opacity-80" : ""
                  }`
                }
                to={`${workspace.id}/todos`}
              >
                {workspace.title}
              </NavLink>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default WorkspaceList;
