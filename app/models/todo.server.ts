import type { Todo, User, Workspace } from "@prisma/client";

import { prisma } from "~/db.server";

export function getTodo({
  id,
}: Pick<Todo, "id"> ) {
  return prisma.todo.findFirst({
    select: { id: true, title: true, goal: true, hoursDay: true, hoursWeek: true, hoursMonth: true, complete: true },
    where: { id },
  });
}

export function getTodoListItems({ workspaceId }: { userId: User["id"], workspaceId: Workspace['id'] }) {
  return prisma.todo.findMany({
    where: { workspaceId },
    // select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
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
