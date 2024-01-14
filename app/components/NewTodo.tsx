import { Form, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";

const NewTodo = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isSubmitting) {
      formRef.current?.reset();
    }
  }, [isSubmitting]);

  return (
    <Form
      className="flex flex-col text-left w-[800px]"
      ref={formRef}
      method="post"
    >
      <input
        type="text"
        id="title"
        name="title"
        required
        disabled={isSubmitting}
        placeholder="+ add a task and hit enter"
        className=" bg-my-tertiary bg-opacity-10 w-2/3 h-[40px] placeholder-my-tertiary placeholder-opacity-80 pl-10"
      />
    </Form>
  );
};

export default NewTodo;
