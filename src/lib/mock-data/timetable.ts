import { Period, Timetable, TimetableSlot } from "@/types";

export const defaultPeriods: Period[] = [
  { id: "per-1", number: 1, label: "Period 1", startTime: "08:00", endTime: "08:45", type: "LECTURE" },
  { id: "per-2", number: 2, label: "Period 2", startTime: "08:45", endTime: "09:30", type: "LECTURE" },
  { id: "per-break-1", number: 99, label: "Short Break", startTime: "09:30", endTime: "09:45", type: "BREAK", isBreak: true },
  { id: "per-3", number: 3, label: "Period 3", startTime: "09:45", endTime: "10:30", type: "LECTURE" },
  { id: "per-4", number: 4, label: "Period 4", startTime: "10:30", endTime: "11:15", type: "LECTURE" },
  { id: "per-break-2", number: 98, label: "Tea Break", startTime: "11:15", endTime: "11:30", type: "BREAK", isBreak: true },
  { id: "per-5", number: 5, label: "Period 5", startTime: "11:30", endTime: "12:15", type: "LECTURE" },
  { id: "per-6", number: 6, label: "Period 6", startTime: "12:15", endTime: "13:00", type: "LECTURE" },
  { id: "per-lunch", number: 0, label: "Lunch Break", startTime: "13:00", endTime: "14:00", type: "LUNCH", isBreak: true },
  { id: "per-7", number: 7, label: "Period 7", startTime: "14:00", endTime: "14:45", type: "LECTURE" },
  { id: "per-8", number: 8, label: "Period 8", startTime: "14:45", endTime: "15:30", type: "LECTURE" },
];

export const initialTimetableSlots: TimetableSlot[] = [
  // Grade 10 Section A - Monday
  { id: "ts-001", day: "MONDAY", periodNumber: 1, subjectId: "sub-101", subjectName: "Mathematics", subjectCode: "MATH-10", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-002", day: "MONDAY", periodNumber: 2, subjectId: "sub-102", subjectName: "Science", subjectCode: "SCI-10", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-003", day: "MONDAY", periodNumber: 3, subjectId: "sub-103", subjectName: "Computer Science", subjectCode: "CS-10", teacherId: "tch-03", teacherName: "Ms. Priya Menon", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Tech Lab 12", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-004", day: "MONDAY", periodNumber: 4, subjectId: "sub-104", subjectName: "English", subjectCode: "ENG-10", teacherId: "tch-05", teacherName: "Mrs. Kavitha Subramaniam", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-005", day: "MONDAY", periodNumber: 5, subjectId: "sub-101", subjectName: "Mathematics", subjectCode: "MATH-10", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-006", day: "MONDAY", periodNumber: 6, subjectId: "sub-105", subjectName: "Art Education", subjectCode: "ART-10", teacherId: "tch-06", teacherName: "Ms. Neha Kapoor", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Studio 105", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-007", day: "MONDAY", periodNumber: 7, subjectId: "sub-102", subjectName: "Science", subjectCode: "SCI-10", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Physics Lab 3", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-008", day: "MONDAY", periodNumber: 8, subjectId: "sub-103", subjectName: "Computer Science", subjectCode: "CS-10", teacherId: "tch-03", teacherName: "Ms. Priya Menon", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Tech Lab 12", branchId: "br-apex-01", branchName: "Apex Global Campus" },

  // Grade 10 Section A - Tuesday
  { id: "ts-009", day: "TUESDAY", periodNumber: 1, subjectId: "sub-102", subjectName: "Science", subjectCode: "SCI-10", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-010", day: "TUESDAY", periodNumber: 2, subjectId: "sub-101", subjectName: "Mathematics", subjectCode: "MATH-10", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-011", day: "TUESDAY", periodNumber: 3, subjectId: "sub-104", subjectName: "English", subjectCode: "ENG-10", teacherId: "tch-05", teacherName: "Mrs. Kavitha Subramaniam", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-012", day: "TUESDAY", periodNumber: 4, subjectId: "sub-103", subjectName: "Computer Science", subjectCode: "CS-10", teacherId: "tch-03", teacherName: "Ms. Priya Menon", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Tech Lab 12", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-013", day: "TUESDAY", periodNumber: 5, subjectId: "sub-105", subjectName: "Art Education", subjectCode: "ART-10", teacherId: "tch-06", teacherName: "Ms. Neha Kapoor", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Studio 105", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-014", day: "TUESDAY", periodNumber: 6, subjectId: "sub-101", subjectName: "Mathematics", subjectCode: "MATH-10", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-015", day: "TUESDAY", periodNumber: 7, subjectId: "sub-102", subjectName: "Science", subjectCode: "SCI-10", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Physics Lab 3", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-016", day: "TUESDAY", periodNumber: 8, subjectId: "sub-104", subjectName: "English", subjectCode: "ENG-10", teacherId: "tch-05", teacherName: "Mrs. Kavitha Subramaniam", classId: "cls-g10", className: "Grade 10", sectionId: "sec-g10-a", sectionName: "Section A (STEM Honors)", roomNumber: "Room 301", branchId: "br-apex-01", branchName: "Apex Global Campus" },

  // Grade 9 Section A - Monday
  { id: "ts-017", day: "MONDAY", periodNumber: 1, subjectId: "sub-901", subjectName: "Mathematics", subjectCode: "MATH-09", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-018", day: "MONDAY", periodNumber: 2, subjectId: "sub-902", subjectName: "Science", subjectCode: "SCI-09", teacherId: "tch-03", teacherName: "Ms. Priya Menon", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-019", day: "MONDAY", periodNumber: 3, subjectId: "sub-903", subjectName: "Social Science", subjectCode: "SST-09", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Bio Lab 14", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-020", day: "MONDAY", periodNumber: 4, subjectId: "sub-901", subjectName: "Mathematics", subjectCode: "MATH-09", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-021", day: "MONDAY", periodNumber: 5, subjectId: "sub-902", subjectName: "Science", subjectCode: "SCI-09", teacherId: "tch-03", teacherName: "Ms. Priya Menon", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-022", day: "MONDAY", periodNumber: 6, subjectId: "sub-903", subjectName: "Social Science", subjectCode: "SST-09", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Bio Lab 14", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },

  // Grade 9 Section A - Wednesday
  { id: "ts-023", day: "WEDNESDAY", periodNumber: 1, subjectId: "sub-902", subjectName: "Science", subjectCode: "SCI-09", teacherId: "tch-03", teacherName: "Ms. Priya Menon", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-024", day: "WEDNESDAY", periodNumber: 2, subjectId: "sub-901", subjectName: "Mathematics", subjectCode: "MATH-09", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-025", day: "WEDNESDAY", periodNumber: 3, subjectId: "sub-903", subjectName: "Social Science", subjectCode: "SST-09", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Bio Lab 14", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-026", day: "WEDNESDAY", periodNumber: 4, subjectId: "sub-902", subjectName: "Science", subjectCode: "SCI-09", teacherId: "tch-03", teacherName: "Ms. Priya Menon", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-027", day: "WEDNESDAY", periodNumber: 5, subjectId: "sub-901", subjectName: "Mathematics", subjectCode: "MATH-09", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Tech Lab 12", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },
  { id: "ts-028", day: "WEDNESDAY", periodNumber: 6, subjectId: "sub-903", subjectName: "Social Science", subjectCode: "SST-09", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g9", className: "Grade 9", sectionId: "sec-g9-a", sectionName: "Section Alpha (Robotics Core)", roomNumber: "Bio Lab 14", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy" },

  // Grade 12 Section A - Thursday
  { id: "ts-029", day: "THURSDAY", periodNumber: 1, subjectId: "sub-1201", subjectName: "Mathematics", subjectCode: "MATH-12", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g12", className: "Grade 12", sectionId: "sec-g12-a", sectionName: "Section A (Ivy Placement)", roomNumber: "Senior Quad 1", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-030", day: "THURSDAY", periodNumber: 2, subjectId: "sub-1202", subjectName: "Physics", subjectCode: "PHY-12", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g12", className: "Grade 12", sectionId: "sec-g12-a", sectionName: "Section A (Ivy Placement)", roomNumber: "Physics Lab 3", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-031", day: "THURSDAY", periodNumber: 3, subjectId: "sub-1203", subjectName: "Chemistry", subjectCode: "CHEM-12", teacherId: "tch-05", teacherName: "Mrs. Kavitha Subramaniam", classId: "cls-g12", className: "Grade 12", sectionId: "sec-g12-a", sectionName: "Section A (Ivy Placement)", roomNumber: "Senior Quad 1", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-032", day: "THURSDAY", periodNumber: 4, subjectId: "sub-1201", subjectName: "Mathematics", subjectCode: "MATH-12", teacherId: "tch-01", teacherName: "Mrs. Sunita Rao", classId: "cls-g12", className: "Grade 12", sectionId: "sec-g12-a", sectionName: "Section A (Ivy Placement)", roomNumber: "Senior Quad 1", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-033", day: "THURSDAY", periodNumber: 5, subjectId: "sub-1202", subjectName: "Physics", subjectCode: "PHY-12", teacherId: "tch-02", teacherName: "Mr. Rajesh Kulkarni", classId: "cls-g12", className: "Grade 12", sectionId: "sec-g12-a", sectionName: "Section A (Ivy Placement)", roomNumber: "Physics Lab 3", branchId: "br-apex-01", branchName: "Apex Global Campus" },
  { id: "ts-034", day: "THURSDAY", periodNumber: 6, subjectId: "sub-1203", subjectName: "Chemistry", subjectCode: "CHEM-12", teacherId: "tch-05", teacherName: "Mrs. Kavitha Subramaniam", classId: "cls-g12", className: "Grade 12", sectionId: "sec-g12-a", sectionName: "Section A (Ivy Placement)", roomNumber: "Senior Quad 1", branchId: "br-apex-01", branchName: "Apex Global Campus" },
];

export const initialTimetables: Timetable[] = [
  {
    id: "tt-001",
    name: "Grade 10 - Section A Weekly Schedule",
    branchId: "br-apex-01",
    branchName: "Apex Global Campus",
    academicYear: "2026-2027",
    effectiveFrom: "2026-04-01",
    slots: initialTimetableSlots.filter((s) => s.classId === "cls-g10"),
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-20T14:30:00Z",
  },
  {
    id: "tt-002",
    name: "Grade 9 - Section Alpha Weekly Schedule",
    branchId: "br-west-02",
    branchName: "Westside STEM & Innovation Academy",
    academicYear: "2026-2027",
    effectiveFrom: "2026-04-01",
    slots: initialTimetableSlots.filter((s) => s.classId === "cls-g9"),
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-20T14:30:00Z",
  },
  {
    id: "tt-003",
    name: "Grade 12 - Section A Weekly Schedule",
    branchId: "br-apex-01",
    branchName: "Apex Global Campus",
    academicYear: "2026-2027",
    effectiveFrom: "2026-04-01",
    slots: initialTimetableSlots.filter((s) => s.classId === "cls-g12"),
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-20T14:30:00Z",
  },
];
