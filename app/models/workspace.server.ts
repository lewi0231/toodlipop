import type { User, Workspace } from "@prisma/client";

import { prisma } from "~/db.server";

export function getWorkspace({
  id,
  userId,
}: Pick<Workspace, "id"> & {
  userId: User["id"];
    }) {
    return prisma.workspace.findFirst({
        select: { id: true, title: true, todos: true },
        where: {id, userId}
    })
}

export function getWorkspaceListItems({
    userId
}: {
  userId: User["id"];
    }) {
       return prisma.workspace.findMany({
        select: { id: true, title: true},
        where: {userId}
    }) 
}

export function createWorkspace({
  title,
  userId
}: Pick<Workspace, "title"> & {
  userId: User["id"];
}) {
  return prisma.workspace.create({
    data: {
      title,
        user: {
            connect: {
            id: userId
        }
      }
    },
  });
}

