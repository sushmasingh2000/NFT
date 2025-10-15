export const getRemainingTime = (endDate) => {
  const total = endDate - new Date();
  const totalSec = Math.max(Math.floor(total / 1000), 0);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  return {
    hrs: String(hrs).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
    totalSec,
  };
};
