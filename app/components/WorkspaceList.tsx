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
                  `block border-b hover:bg-my-secondary hover:bg-opacity-70 p-4 text-md ${
                    isActive ? "bg-my-secondary bg-opacity-40" : ""
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
