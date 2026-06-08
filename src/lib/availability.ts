import type { BusinessHours, BlockedDate, Appointment, TimeSlot } from './types';

export function dateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  const ds = dateStr(date);
  return blockedDates.some((b) => b.blocked_date === ds);
}

function getBusinessHoursForDate(
  date: Date,
  businessHours: BusinessHours[]
): BusinessHours | undefined {
  const weekday = date.getDay();
  const idx = weekday === 0 ? 6 : weekday - 1;
  return businessHours.find((h) => h.weekday === idx);
}

function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function isWithinBookingNotice(
  date: Date,
  slotStartMinutes: number,
  noticeHours: number
): boolean {
  const now = new Date();
  const slotDateTime = new Date(date);
  slotDateTime.setHours(0, 0, 0, 0);
  slotDateTime.setMinutes(slotStartMinutes);
  const diffMs = slotDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours >= noticeHours;
}

interface SlotInput {
  date: Date;
  businessHours: BusinessHours[];
  blockedDates: BlockedDate[];
  appointments: Appointment[];
  service: { duration_minutes: number };
  slotInterval?: number;
  bookingNoticeHours?: number;
}

export function getTimeSlots(input: SlotInput): TimeSlot[] {
  const {
    date,
    businessHours,
    blockedDates,
    appointments,
    service,
    slotInterval = 60,
    bookingNoticeHours = 2,
  } = input;

  if (isDateInPast(date)) return [];

  const bh = getBusinessHoursForDate(date, businessHours);
  if (!bh || !bh.is_open) return [];

  if (isDateBlocked(date, blockedDates)) return [];

  const ds = dateStr(date);
  const openMinutes = timeToMinutes(bh.start_time);
  const closeMinutes = timeToMinutes(bh.end_time);
  const durationMinutes = service.duration_minutes;

  const slots: TimeSlot[] = [];

  for (let m = openMinutes; m + durationMinutes <= closeMinutes; m += slotInterval) {
    const slotEnd = m + durationMinutes;

    if (!isWithinBookingNotice(date, m, bookingNoticeHours)) continue;

    const conflicting = appointments.some((appt) => {
      if (appt.status === 'cancelled') return false;
      if (appt.appointment_date !== ds) return false;
      const apptStart = timeToMinutes(appt.start_time);
      const apptEnd = timeToMinutes(appt.end_time);
      return m < apptEnd && slotEnd > apptStart;
    });

    if (!conflicting) {
      const startDate = new Date(date);
      startDate.setHours(Math.floor(m / 60), m % 60, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(Math.floor(slotEnd / 60), slotEnd % 60, 0, 0);
      const startH = String(Math.floor(m / 60)).padStart(2, '0');
      const startM = String(m % 60).padStart(2, '0');
      const endH = String(Math.floor(slotEnd / 60)).padStart(2, '0');
      const endM = String(slotEnd % 60).padStart(2, '0');
      slots.push({
        start: startDate,
        end: endDate,
        label: `${startH}:${startM} - ${endH}:${endM}`,
      });
    }
  }

  return slots;
}
