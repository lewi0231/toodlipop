import { Link } from "@remix-run/react";
import { RiMoreFill, RiPencilLine, RiTimeLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";

import { useDragAndDrop } from "~/hooks/useDragAndDrop";
import { useFormSubmission } from "~/hooks/useFormSubmission";
import { useTimer } from "~/hooks/useTimer";
import { CONTENT_TYPES, INTENTS, TodoProp } from "~/types/types";

import soundEffect from "../audio/complete.wav";

import TimerComponent from "./TimerComponent";
import TodoOptionsMenu from "./TodoOptionsMenu";
import { TodoTitleEditor } from "./TodoTitleEditor";

export function TodoCard({
  todo,
  previousOrder,
  nextOrder,
}: {
  todo: TodoProp;
  previousOrder: number;
  nextOrder: number;
}) {
  const formSubmitter = useFormSubmission();
  const timer = useTimer();
  const dragAndDrop = useDragAndDrop({
    previousOrder,
    nextOrder,
    formSubmitter,
    todo,
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [audioPlayer, setAudioPlayer] = useState<
    HTMLAudioElement | undefined
  >();
  // const [acceptDrop, setAcceptDrop] = useState<"none" | "bottom" | "top">();
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const optionsButtonRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const handleMoreOptions = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (optionsButtonRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        top: rect.top + window.scrollY,
        right: window.innerWidth - rect.right,
      };
      setMenuPosition(position);
      console.debug("position is ", position);
    }

    setIsMenuOpen(true);
  };

  const handleOnTimeEnd = () => {
    // Save to db
    if (timer.startTime) {
      formSubmitter.submit({
        intent: INTENTS.createTimer,
        object: {
          startTime: timer.startTime.toISOString(),
          endTime: new Date().toISOString(),
          secondsRemaining: "0",
          todoId: todo.id,
        },
      });
    }

    if (audioPlayer) {
      audioPlayer.play();
    }

    timer.hasFinished();

    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Timer completed!", {
            body: "Your timer has finished!",
          });
        }
      });
    } else if (Notification.permission === "granted") {
      new Notification("Timer completed!", {
        body: "Your timer has finished!",
      });
    }
  };

  // const handleOnDragOver = (event: React.DragEvent) => {
  //   if (event.dataTransfer.types.includes(CONTENT_TYPES.todoCard)) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //     const rect = event.currentTarget.getBoundingClientRect();
  //     const midPoint = (rect.top + rect.bottom) / 2;
  //     setAcceptDrop(event.clientY <= midPoint ? "top" : "bottom");
  //   }
  // };

  // const handleOnDrop = (event: React.DragEvent) => {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   let transfer;
  //   try {
  //     transfer = JSON.parse(event.dataTransfer.getData(CONTENT_TYPES.todoCard));
  //   } catch (error) {
  //     console.error("something went wrong with transfer data");
  //   }

  //   invariant(transfer.todoId, "missing todoId");

  //   if (acceptDrop !== "none") {
  //     console.log("previous", previousOrder, "next", nextOrder);
  //     // reorder the current list of todos
  //     const droppedOrder = acceptDrop === "top" ? previousOrder : nextOrder;
  //     const moveOrder = (droppedOrder + todo.order) / 2;

  //     console.log("moveOrder is ", moveOrder, "todoID", transfer.todoID);

  //     formSubmitter.submit({
  //       intent: INTENTS.updateTodoOrder,
  //       object: {
  //         todoId: String(transfer.todoId),
  //         order: String(moveOrder),
  //         category: todo.category,
  //       },
  //     });

  //     setAcceptDrop("none");
  //   }
  // };

  useEffect(() => {
    // This needs to be here because otherwise attempts to SSR - and can't.
    if (!audioPlayer) {
      setAudioPlayer(new Audio(soundEffect));
    }
  }, [audioPlayer]);

  const deleteTodoFormSubmission = () => {
    formSubmitter.submit({
      intent: INTENTS.deleteTodo,
      object: { todoId: todo.id },
    });

    setIsMenuOpen(false);
  };

  const handleOnFinishEdit = () => {
    setIsEditing(false);
  };

  return (
    <div
      className={` border-2 border-transparent ${
        dragAndDrop.acceptDrop === "top"
          ? " border-t-red-950"
          : dragAndDrop.acceptDrop === "bottom"
          ? "border-b-red-950"
          : ""
      }`}
    >
      <Link
        draggable
        className={` rounded-md cursor-pointer active:cursor-grabbing `}
        to={`/workspaces/${todo.workspaceId}/${todo.id}`}
        key={todo.id}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData(
            CONTENT_TYPES.todoCard,
            JSON.stringify({ todoId: todo.id }),
          );
        }}
        onDragOver={(e) => dragAndDrop.handleOnDragOver(e)}
        onDragLeave={() => {
          dragAndDrop.setAcceptDrop("none");
        }}
        onDrop={dragAndDrop.handleOnDrop}
      >
        <div className=" bg-my-primary-lighten-03  w-full  rounded flex h-12 box-border gap-5 relative group shadow-md hover:shadow-lg hover:bg-my-primary-lighten-03 hover:bg-opacity-60 bg-opacity">
          <TodoTitleEditor
            formSubmitter={formSubmitter}
            todo={todo}
            isEditing={isEditing}
            handleOnFinishEdit={handleOnFinishEdit}
          />
          <TimerComponent
            isTimerRunning={timer.isTimerRunning}
            handleOnTimeEnd={handleOnTimeEnd}
            todoId={todo.id}
            timers={todo.timers ?? []}
            goal={todo.goal}
          />
          <div className="absolute hidden top-0 right-20 bg-my-primary-lighten-03 bg-opacity-50 items-center h-1/2 w-1/4 text-sm rounded group-hover:flex group-hover:justify-between px-3 shadow-md">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <RiPencilLine className="hover:opacity-50" color="black" />
            </button>
            <button onClick={timer.toggleTimer}>
              <RiTimeLine
                className=" hover:opacity-50"
                size={20}
                color="black"
              />
            </button>
            <button onClick={handleMoreOptions} ref={optionsButtonRef}>
              <RiMoreFill
                className=" hover:opacity-50"
                size={20}
                color="black"
              />
            </button>
          </div>
        </div>

        <TodoOptionsMenu
          isOpen={isMenuOpen}
          menuPosition={menuPosition}
          deleteTodoFormSubmission={deleteTodoFormSubmission}
        />
      </Link>
    </div>
  );
}
