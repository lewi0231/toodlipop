import { useEffect, useRef, useState } from "react";

import { INTENTS, TodoProp } from "~/types/types";

export interface FormSubmission {
  submit: ({
    intent,
    object,
  }: {
    intent: string;
    object: Record<string, unknown>;
  }) => void;
}

export const TodoTitleEditor = ({
  isEditing,
  formSubmitter,
  todo,
  handleOnFinishEdit,
}: {
  isEditing: boolean;
  formSubmitter: FormSubmission;
  todo: TodoProp;
  handleOnFinishEdit: () => void;
}) => {
  const [title, setTitle] = useState(todo.title);
  const editTodoInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = () => {
    formSubmitter.submit({
      intent: INTENTS.updateTodoTitle,
      object: { title, todoId: todo.id },
    });
  };

  useEffect(() => {
    if (isEditing) {
      editTodoInputRef.current?.focus();
    }
  }, [editTodoInputRef, isEditing]);

  return (
    <div className="flex items-center absolute top-0 left-0 h-full w-full">
      {isEditing ? (
        <input
          ref={editTodoInputRef}
          className=" w-full h-full outline-none pl-10 cursor-text bg-my-primary-lighten-03 bg-opacity-70"
          type="text"
          value={title}
          onBlur={() => {
            handleSubmit();
            handleOnFinishEdit();
          }}
          onChange={(e) => setTitle(e.target.value)}
          onClick={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
              handleOnFinishEdit();
            }
          }}
        />
      ) : (
        <h1 className="cursor-pointer w-full pl-10 text-my-primary-darken-04">
          {title}
        </h1>
      )}
    </div>
  );
};
