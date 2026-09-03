import { AttendanceRecord, AttendanceDaySummary, AttendanceReportEntry } from "@/types";

// Helper to generate dates for the current month
function generateDatesForMonth(year: number, month: number, count: number): string[] {
  const dates: string[] = [];
  for (let d = 1; d <= count && d <= 31; d++) {
    const date = new Date(year, month, d);
    if (date.getMonth() === month && date.getDay() !== 0) { // skip sundays
      dates.push(date.toISOString().split("T")[0]);
    }
  }
  return dates;
}

const currentDate = new Date();
const workingDates = generateDatesForMonth(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

const studentPeople = [
  { id: "stu-01", name: "Liam Chen", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A" },
  { id: "stu-02", name: "Maya Patel", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A" },
  { id: "stu-03", name: "Ethan Hawthorne", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section A" },
  { id: "stu-04", name: "Sophie Dubois", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80", classId: "cls-g11", className: "Grade 11", sectionId: "sec-g11-ib", sectionName: "IB Cohort" },
  { id: "stu-05", name: "Lucas Moretti", avatar: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80", classId: "cls-mont", className: "Montessori", sectionId: "sec-mont-a", sectionName: "Sunflowers" },
  { id: "stu-06", name: "Zoe Alvarez", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-arts", sectionName: "Section D" },
];

const teacherPeople = [
  { id: "tch-01", name: "Dr. Eleanor Voss", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
  { id: "tch-02", name: "Prof. James Whitmore", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" },
  { id: "tch-03", name: "Ms. Ayesha Rahman", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
  { id: "tch-04", name: "Mr. Carlos Mendez", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
];

const staffPeople = [
  { id: "stf-01", name: "Robert Matthews", avatar: "" },
  { id: "stf-02", name: "Linda Park", avatar: "" },
  { id: "stf-03", name: "Thomas Reed", avatar: "" },
];

const workerPeople = [
  { id: "wrk-01", name: "David Kumar", avatar: "" },
  { id: "wrk-02", name: "Maria Santos", avatar: "" },
  { id: "wrk-03", name: "Ahmed Hassan", avatar: "" },
];

const statuses: ("PRESENT" | "ABSENT" | "LATE" | "LEAVE")[] = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getStatus(personIndex: number, dateIndex: number): "PRESENT" | "ABSENT" | "LATE" | "LEAVE" {
  const r = pseudoRandom(personIndex * 100 + dateIndex);
  if (r < 0.78) return "PRESENT";
  if (r < 0.88) return "LATE";
  if (r < 0.95) return "ABSENT";
  return "LEAVE";
}

function generateRecords(
  people: { id: string; name: string; avatar: string; classId?: string; className?: string; sectionId?: string; sectionName?: string }[],
  category: "STUDENT" | "TEACHER" | "STAFF" | "WORKER",
  branchId: string,
  branchName: string
): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  people.forEach((person, pIdx) => {
    workingDates.forEach((date, dIdx) => {
      const status = getStatus(pIdx, dIdx);
      records.push({
        id: `att-${category.toLowerCase()}-${person.id}-${date}`,
        personId: person.id,
        personName: person.name,
        personAvatar: person.avatar || undefined,
        category,
        date,
        status,
        checkIn: status === "PRESENT" ? "08:15" : status === "LATE" ? "09:32" : undefined,
        checkOut: status === "PRESENT" || status === "LATE" ? "15:30" : undefined,
        branchId,
        branchName,
        classId: person.classId,
        className: person.className,
        sectionId: person.sectionId,
        sectionName: person.sectionName,
        markedBy: "System Auto / Admin",
        markedAt: `${date}T09:00:00.000Z`,
      });
    });
  });
  return records;
}

export const initialAttendanceRecords: AttendanceRecord[] = [
  ...generateRecords(studentPeople, "STUDENT", "br-apex-01", "Apex Global Campus"),
  ...generateRecords(teacherPeople, "TEACHER", "br-apex-01", "Apex Global Campus"),
  ...generateRecords(staffPeople, "STAFF", "br-apex-01", "Apex Global Campus"),
  ...generateRecords(workerPeople, "WORKER", "br-apex-01", "Apex Global Campus"),
];

// Pre-computed day summaries for heatmap
export function computeDaySummaries(records: AttendanceRecord[]): AttendanceDaySummary[] {
  const map = new Map<string, AttendanceDaySummary>();
  for (const r of records) {
    const key = `${r.date}-${r.category}-${r.branchId}`;
    if (!map.has(key)) {
      map.set(key, { date: r.date, category: r.category, branchId: r.branchId, total: 0, present: 0, absent: 0, late: 0, leave: 0, rate: 0 });
    }
    const s = map.get(key)!;
    s.total++;
    if (r.status === "PRESENT") s.present++;
    else if (r.status === "ABSENT") s.absent++;
    else if (r.status === "LATE") s.late++;
    else if (r.status === "LEAVE") s.leave++;
    s.rate = s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0;
  }
  return Array.from(map.values());
}

export function computeReportEntries(records: AttendanceRecord[]): AttendanceReportEntry[] {
  const map = new Map<string, AttendanceReportEntry>();
  for (const r of records) {
    const key = `${r.personId}-${r.category}`;
    if (!map.has(key)) {
      map.set(key, {
        personId: r.personId,
        personName: r.personName,
        personAvatar: r.personAvatar,
        category: r.category,
        classId: r.classId,
        className: r.className,
        branchId: r.branchId,
        branchName: r.branchName,
        totalDays: 0, present: 0, absent: 0, late: 0, leave: 0, rate: 0,
      });
    }
    const e = map.get(key)!;
    e.totalDays++;
    if (r.status === "PRESENT") e.present++;
    else if (r.status === "ABSENT") e.absent++;
    else if (r.status === "LATE") e.late++;
    else if (r.status === "LEAVE") e.leave++;
    e.rate = e.totalDays > 0 ? Math.round(((e.present + e.late) / e.totalDays) * 100) : 0;
  }
  return Array.from(map.values());
}

// Attendance trend data for charts
export const attendanceTrendData = [
  { date: "Week 1", students: 95, teachers: 98, staff: 97, workers: 93 },
  { date: "Week 2", students: 92, teachers: 96, staff: 95, workers: 91 },
  { date: "Week 3", students: 96, teachers: 99, staff: 98, workers: 94 },
  { date: "Week 4", students: 94, teachers: 97, staff: 96, workers: 92 },
];
