import { useEffect, useState } from "react";

import { usePrevious } from "./usePrevious";

export function useTimer(initialState = false) {
  const [isTimerRunning, setIsTimerRunning] = useState(initialState);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const prevIsTimerRunning = usePrevious(isTimerRunning);

  const toggleTimer = (event: React.MouseEvent) => {
    event.preventDefault();
    console.log("toggled the timer to", !isTimerRunning);
    setIsTimerRunning(!isTimerRunning);
  };

  const hasFinished = () => {
    console.log("timer start time is being set to null as it has finished");
    setIsTimerRunning(false);
    setStartTime(null);
  };

  useEffect(() => {
    if (isTimerRunning && !prevIsTimerRunning && !startTime) {
      console.log("I set a new start time");
      setStartTime(new Date());
    }
  }, [isTimerRunning, prevIsTimerRunning, startTime]);

  return { isTimerRunning, toggleTimer, startTime, hasFinished };
}
