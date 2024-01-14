import { useEffect, useState } from "react";

interface LocalStorage {
  startTime: Date;
  pauseTime: Date;
  duration: number;
}

const CountdownTimer = ({
  todoId,
  durationSeconds,
  isTimerRunning = false,
  onTimeEnd,
}: {
  todoId: string;
  durationSeconds: number;
  isTimerRunning: boolean;
  onTimeEnd: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [startTime, setStartTime] = useState<Date>();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    // Save intervalId to clear the interval when the component unmounts
    if (isTimerRunning) {
      if (!startTime) {
        setStartTime(new Date());
      }

      intervalId = setInterval(() => {
        setTimeLeft((previousTimeLeft) => previousTimeLeft - 1);
      }, 1000);
    } else if (startTime) {
      // Pause logic: Save current state to LocalStorage

      saveToLocalStorage(
        {
          startTime,
          pauseTime: new Date(),
          duration: timeLeft,
        },
        todoId,
      );

      setStartTime(undefined);
    }

    if (timeLeft === 0) {
      onTimeEnd();
      //   clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
      // Save to databse.
    };
    //   Here is where I want to update the database or localStorage with time.
  }, [timeLeft, onTimeEnd, isTimerRunning, startTime, todoId]);

  return <div>{extractTimeFormat(timeLeft)}</div>;
};

function extractTimeFormat(timeLeft: number) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const minuteString = `${minutes < 10 ? "0" + minutes : minutes}`;
  const secondsString = `${seconds < 10 ? "0" + seconds : seconds}`;
  return `${minuteString}:${secondsString}`;
}

function saveToLocalStorage(data: LocalStorage, todoId: string) {
  const noteStorage = JSON.parse(localStorage[todoId] || "[]");

  noteStorage.push(data);
  console.debug("Data stored", noteStorage);

  localStorage[todoId] = JSON.stringify(noteStorage);
}

export default CountdownTimer;
