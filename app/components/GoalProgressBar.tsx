const GoalProgressBar = ({ height }: { height: number }) => {
  return (
    <div
      style={{ height: `${height}%` }}
      className={` bg-my-tertiary bg-opacity-20 w-1/3 `}
    ></div>
  );
};

export default GoalProgressBar;
