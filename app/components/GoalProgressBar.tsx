const GoalProgressBar = ({
  height,
  width,
}: {
  height: number;
  width: number;
}) => {
  return (
    <div
      style={{ width: `${width}%` }}
      className={` bg-my-tertiary border-2 border-black bg-opacity-20 h-1/2 `}
    ></div>
  );
};

export default GoalProgressBar;
