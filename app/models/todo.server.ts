import type { Todo, Workspace } from "@prisma/client";

import { prisma } from "~/db.server";

export function getTodo({
  id,
}: Pick<Todo, "id"> ) {
  return prisma.todo.findFirst({
    where: { id },
  });
}

export function getTodoListItems({ workspaceId }: { workspaceId: Workspace['id'] }) {
  let todos;
  try {
    todos = prisma.todo.findMany({
       where: { workspaceId },
      //  include: { timers: true},
       orderBy: { updatedAt: "desc" },
    });
    
    return todos
    
  } catch (error) {
    throw new Response("There was a problem obtaining list of Todos")
  }

}

export function createTodo({
  title,
  workspaceId
}: Pick<Todo, "title"> & { workspaceId: Workspace["id"]}) {
  return prisma.todo.create({
    data: {
      title,
        workspace: {
            connect: {
            id: workspaceId
        }
      }
    },
  });
}

export function deleteTodo({
  id,
}: Pick<Todo, "id"> ) {
  return prisma.todo.deleteMany({
    where: { id },
  });
}
