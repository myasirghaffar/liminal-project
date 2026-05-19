const MS_PER_DAY = 86400000;

export const toLocalDateOnly = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getWeek1Monday = (programmeStart) => {
  const start = toLocalDateOnly(programmeStart);
  const daysFromMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysFromMonday);
  return start;
};

export const getProgramWeekBounds = (programmeStart, weekIndex) => {
  const week1Monday = getWeek1Monday(programmeStart);
  const start = new Date(week1Monday);
  start.setDate(start.getDate() + weekIndex * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

export const getProgramWeekNumber = (programmeStart, referenceDate = new Date(), numWeeks) => {
  const week1Monday = getWeek1Monday(programmeStart);
  const ref = toLocalDateOnly(referenceDate);
  const daysSinceWeek1 = Math.floor((ref - week1Monday) / MS_PER_DAY);
  if (daysSinceWeek1 < 0) return null;
  const weekNumber = Math.floor(daysSinceWeek1 / 7) + 1;
  return Math.min(weekNumber, numWeeks);
};

export const formatProgramWeekLabel = (weekNumber) => `Week ${weekNumber}`;

export const computeProgramEndDate = (programmeStart, numWeeks) =>
  getProgramWeekBounds(programmeStart, numWeeks - 1).end;
