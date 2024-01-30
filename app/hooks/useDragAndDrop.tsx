import React, { useState } from "react";
import invariant from "tiny-invariant";

import type { FormSubmission } from "~/components/TodoTitleEditor";
import { CONTENT_TYPES, INTENTS, TodoProp } from "~/types/types";

export const useDragAndDrop = ({
  previousOrder,
  nextOrder,
  formSubmitter,
  todo,
}: {
  previousOrder: number;
  nextOrder: number;
  formSubmitter: FormSubmission;
  todo: TodoProp;
}) => {
  const [acceptDrop, setAcceptDrop] = useState<"none" | "bottom" | "top">();

  const handleOnDragOver = (event: React.DragEvent) => {
    if (event.dataTransfer.types.includes(CONTENT_TYPES.todoCard)) {
      event.preventDefault();
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      const midPoint = (rect.top + rect.bottom) / 2;
      setAcceptDrop(event.clientY <= midPoint ? "top" : "bottom");
    }
  };

  const handleOnDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    let transfer;
    try {
      transfer = JSON.parse(event.dataTransfer.getData(CONTENT_TYPES.todoCard));
    } catch (error) {
      console.error("something went wrong with transfer data");
    }

    invariant(transfer.todoId, "missing todoId");

    if (acceptDrop !== "none") {
      console.log("previous", previousOrder, "next", nextOrder);
      // reorder the current list of todos
      const droppedOrder = acceptDrop === "top" ? previousOrder : nextOrder;
      const moveOrder = (droppedOrder + todo.order) / 2;

      console.log("moveOrder is ", moveOrder, "todoID", transfer.todoID);

      formSubmitter.submit({
        intent: INTENTS.updateTodoOrder,
        object: {
          todoId: String(transfer.todoId),
          order: String(moveOrder),
          category: todo.category,
        },
      });

      setAcceptDrop("none");
    }
  };
  return { handleOnDrop, handleOnDragOver, acceptDrop, setAcceptDrop };
};
