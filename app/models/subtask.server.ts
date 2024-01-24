import type { Subtask, Todo } from "@prisma/client";

import { prisma } from "~/db.server";

export function createSubtask({todoId, note}: {todoId: Todo['id']} & Pick<Subtask, "note"> ){
    try {
        return prisma.subtask.create({
            data: {
                note,
                todo: {
                    connect: {
                        id: todoId
                    }
                }
                
            }
        })
    } catch (error) {
        throw new Response("Problem creating subtask", {
            status: 500
        })
    }
}