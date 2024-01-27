import type { Todo, Workspace } from "@prisma/client";

import { prisma } from "~/db.server";

export function getLastTodo({category}: Pick<Todo, 'category'>){
  try {
    return prisma.todo.findFirst({
      where: {
        category
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true
      }
    })
  } catch (error) {
    throw new Response("getLastTodo failed", {status: 500})
  }
}

export function getTodo({
  id,
}: Pick<Todo, "id"> ) {
  return prisma.todo.findFirst({
    where: { id },
    include: {
      timers: true,
      subtask: true
    }
  });
}

export async function updateTodo({
  id, title, goal, order, category
}: Pick<Todo, "id"> & Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>){
  category = category ? category.toLowerCase() : undefined;

  try { 
    const updatedTodo = await prisma.todo.update({
      where: {id},
      data: {
        title,
        goal,
        order,
        category
      },
    })

    if (order){
      updateTodoListOrderToIntegers(updatedTodo.workspaceId);
    }

    return updatedTodo;
  } catch (error){
    throw new Response("Unable to locate a todo with that id", { status: 500})
  }
}

// This function probably won't be used.
export function updateTodoCategoryAndOrders({
  todos
}: { todos: Todo[]}){
  try {
    const updates = todos.map((todo) => {
      return prisma.todo.update({
        where: {
          id: todo.id
        },
        data: {
          order: todo.order,
          category: todo.category
        }
      })
    })
   return prisma.$transaction(updates); 
  } catch (error) {
    throw new Response("Something went wrong saving todos", { status: 500})
  }
}

// helper function to update to list ordering behind the scenes
async function updateTodoListOrderToIntegers(workspaceId: string){
  let updatedTodos;
  try {
    const todos = await getTodoListItems({workspaceId})
  
    updatedTodos = todos.map( (todo, index) => {
      return prisma.todo.update({
        where: {
          id: todo.id
        },
        data: {
          order: index + 1
        }
      })
    })
    
  } catch (error) {
    throw new Response("There was a problem updating todo ordering", { status: 500})
  }

 
  return prisma.$transaction(updatedTodos);
}

export function getTodoListItems({ workspaceId }: { workspaceId: Workspace['id'] }) {
  let todos;
  try {
    todos = prisma.todo.findMany({
       where: { workspaceId },
       include: { timers: true},
       orderBy: { order: "asc" },
    });
    
    return todos
    
  } catch (error) {
    throw new Response("There was a problem obtaining list of Todos")
  }

}

export function createTodo({
  id,
  title,
  order,
  workspaceId,
  goal,
  category,

}: Omit<Todo, 'createdAt' | 'updatedAt' | 'complete'> & { workspaceId: Workspace["id"]}) {
  return prisma.todo.create({
    data: {
      id,
      title,
      order,
      category,
      goal,
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
