export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 10; h < 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

export function generateDateOptions(days: number = 14): { date: string; label: string; dayOfWeek: string }[] {
  const options: { date: string; label: string; dayOfWeek: string }[] = [];
  const today = new Date();

  const dayNamesRu = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthNamesRu = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip Sundays
    if (date.getDay() === 0) continue;

    const dateStr = date.toISOString().split('T')[0];
    const label = `${date.getDate()} ${monthNamesRu[date.getMonth()]}`;
    const dayOfWeek = dayNamesRu[date.getDay()];

    options.push({ date: dateStr, label, dayOfWeek });
  }

  return options;
}
