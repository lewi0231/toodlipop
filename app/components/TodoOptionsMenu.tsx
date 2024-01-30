import { RiDeleteBin3Line } from "@remixicon/react";

const TodoOptionsMenu = ({
  menuPosition,
  isOpen = false,
  deleteTodoFormSubmission,
}: {
  menuPosition: { top: number; right: number };
  isOpen: boolean;
  deleteTodoFormSubmission: () => void;
}) => {
  const handleOnDelete = (event: React.MouseEvent) => {
    event.preventDefault();

    deleteTodoFormSubmission();
  };
  return (
    <div
      className={`absolute p-4 z-10 w-300 shadow-md bg-gray-200 hover:bg-gray-100 ${
        isOpen ? "" : "hidden"
      }`}
      style={{
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right - 200}px`,
        width: "200px",
      }}
    >
      <button
        className="w-full flex justify-between items-center gap-2"
        onClick={handleOnDelete}
      >
        <RiDeleteBin3Line
          className="hover:opacity-50"
          size={20}
          color="black"
        />
        delete
      </button>
    </div>
  );
};

export default TodoOptionsMenu;
