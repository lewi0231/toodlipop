import type { Timer } from "@prisma/client";
export function calculateTotalTime({ timings }: { timings: Timer[] }) {
  // Start times for day, week, and month
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0); // Start of the current day

  const weekStart = new Date();
  weekStart.setDate(dayStart.getDate() - dayStart.getDay()); // Start of the current week

  const monthStart = new Date();
  monthStart.setDate(1); // Start of the current month
  monthStart.setHours(0, 0, 0, 0);

  // Tally sum for each component
  let day = 0;
  let week = 0;
  let month = 0;

  // iterate through timings
  timings.forEach((period) => {
    const { startTime, endTime } = period;

    const difference = endTime.getTime() - startTime.getTime();

    if (endTime > monthStart) {
      month += difference;
    }
    if (endTime > weekStart) {
      week += difference;
    }
    if (endTime > dayStart) {
      day += difference;
    }
  });

  return { day, week, month };
}
