import type { Timer, Todo } from '@prisma/client';

import { prisma } from "~/db.server";

export async function getTimerList({ todoId }: { todoId: string}) {
    const timings =  prisma.timer.findMany({
        where: { todoId },
        orderBy: { endTime: "desc"}
    })
    console.debug("Retrieving timings: ", timings)
    return timings
}

export function createTimer({ todoId, startTime, endTime, secondsRemaining }:  {todoId: string } & Pick<Timer, "startTime" | "endTime" | "secondsRemaining">) {
    let timer;
    try {
        timer = prisma.timer.create({
            data: {
                todo: {
                    connect: {
                        id: todoId
                    }
                },
                startTime,
                endTime,
                secondsRemaining
            }
        })
        return timer;
        
    } catch (error) {
        console.error("There was a problem saving Timer to DB")
    }
    console.debug("Timer created:", timer)
    return timer;
}

export function getLastTimer({ id: todoId }: Pick<Todo, "id">) {
    return prisma.timer.findFirst({
        where: { todoId },
        orderBy: {endTime: "desc"}
    })
}