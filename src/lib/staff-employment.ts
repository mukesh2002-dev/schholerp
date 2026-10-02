// Canonical Staff Employment options — mirrors backend staff.constants.js.
// Backend stores staffType/employmentStatus as UPPERCASE codes; the form shows labels.

export const STAFF_TYPE_OPTIONS = [
  { value: "TEACHING", label: "Teaching" },
  { value: "NON_TEACHING", label: "Non-Teaching" },
  { value: "ADMIN", label: "Administrative" },
  { value: "SUPPORT", label: "Support Staff" },
] as const;

export const DEPARTMENTS = [
  "Administration",
  "Academics",
  "Accounts",
  "HR",
  "Library",
  "Laboratory",
  "IT / Computer",
  "Transport",
  "Security",
  "Medical",
  "Housekeeping",
  "Maintenance",
  "Sports",
  "Canteen",
  "Hostel",
  "Reception / Front Desk",
  "Other",
];

export const DESIGNATIONS_BY_DEPARTMENT: Record<string, string[]> = {
  Administration: ["School Administrator", "Office Manager", "Office Clerk", "Data Entry Operator"],
  Academics: ["Teacher", "Senior Teacher", "PGT", "TGT", "PRT", "Subject Teacher", "Class Teacher", "Head of Department", "Academic Coordinator"],
  "Subject Department": ["Teacher", "Senior Teacher", "PGT", "TGT", "PRT", "Subject Teacher", "Class Teacher", "Head of Department", "Academic Coordinator"],
  Examination: ["Examination Incharge", "Exam Coordinator", "Paper Checker"],
  Accounts: ["Accountant", "Cashier", "Accounts Executive"],
  HR: ["HR Manager", "HR Executive"],
  Library: ["Librarian", "Assistant Librarian", "Library Attendant"],
  Laboratory: ["Lab Assistant", "Lab Attendant"],
  "IT / Computer": ["IT Administrator", "Computer Operator", "IT Support Executive"],
  Transport: ["Transport Manager", "Driver", "Conductor", "Transport Assistant"],
  Security: ["Security Supervisor", "Security Guard"],
  Medical: ["School Nurse", "Doctor", "Medical Assistant"],
  Housekeeping: ["Housekeeping Staff", "Cleaner", "Sweeper"],
  Maintenance: ["Maintenance Supervisor", "Electrician", "Plumber", "Carpenter", "Maintenance Worker"],
  Sports: ["Sports Coach", "PT Assistant"],
  Canteen: ["Canteen Manager", "Cook", "Kitchen Helper", "Serving Staff"],
  Hostel: ["Hostel Warden", "Hostel Helper", "Hostel Cook"],
  "Reception / Front Desk": ["Receptionist", "Front Desk Executive"],
  Reception: ["Receptionist", "Front Desk Executive"],
  Management: ["Principal", "Vice Principal", "Administrator", "Department Head"],
  Other: [],
};

export const DEPARTMENTS_BY_STAFF_TYPE: Record<string, string[]> = {
  TEACHING: ["Academics", "Subject Department", "Examination", "Sports", "Other"],
  NON_TEACHING: ["Administration", "Accounts", "Library", "Laboratory", "IT / Computer", "Transport", "Security", "Medical", "Housekeeping", "Maintenance", "Canteen", "Hostel", "Reception / Front Desk", "Other"],
  ADMIN: ["Administration", "HR", "Accounts", "Management", "Reception / Front Desk"],
  SUPPORT: ["Transport", "Security", "Housekeeping", "Maintenance", "Canteen", "Hostel", "Other"],
};

export const EMPLOYMENT_TYPES = ["Permanent", "Contract", "Temporary", "Probation", "Intern"];

export const WORK_TYPES = ["Full Time", "Part Time", "Shift Based"];

export const WORK_LOCATIONS = ["Main Campus", "Branch Campus", "Hostel", "Office", "Other"];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "ON_LEAVE", label: "On Leave" },
  { value: "PROBATION", label: "Probation" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "RESIGNED", label: "Resigned" },
  { value: "TERMINATED", label: "Terminated" },
  { value: "RETIRED", label: "Retired" },
  { value: "INACTIVE", label: "Inactive" },
] as const;

export function designationsFor(department: string | null | undefined): string[] {
  if (!department) return [];
  return DESIGNATIONS_BY_DEPARTMENT[department] ?? [];
}

export function departmentsForStaffType(staffType: string | null | undefined): string[] {
  if (!staffType) return DEPARTMENTS;
  return DEPARTMENTS_BY_STAFF_TYPE[staffType] ?? DEPARTMENTS;
}

/** Normalize any label/code the form produces to the backend UPPERCASE staffType code. */
export function toStaffTypeCode(v: string | null | undefined): string {
  const n = String(v ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (n === "TEACHING" || n === "TEACHER") return "TEACHING";
  if (n === "NON_TEACHING" || n === "NONTEACHING" || n === "NON_TEACHER") return "NON_TEACHING";
  if (n === "ADMIN" || n === "ADMINISTRATIVE" || n === "ADMINISTRATION" || n === "MANAGEMENT") return "ADMIN";
  if (n === "SUPPORT" || n === "SUPPORT_STAFF" || n === "SUPPORTSTAFF") return "SUPPORT";
  return String(v ?? "TEACHING");
}

/** Normalize any label to the backend UPPERCASE employmentStatus code. */
export function toEmploymentStatusCode(v: string | null | undefined): string {
  const n = String(v ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
  const map: Record<string, string> = {
    ACTIVE: "ACTIVE",
    ON_LEAVE: "ON_LEAVE",
    ONLEAVE: "ON_LEAVE",
    LEAVE: "ON_LEAVE",
    PROBATION: "PROBATION",
    SUSPENDED: "SUSPENDED",
    SUSPEND: "SUSPENDED",
    RESIGNED: "RESIGNED",
    TERMINATED: "TERMINATED",
    RETIRED: "RETIRED",
    INACTIVE: "INACTIVE",
  };
  return map[n] ?? "ACTIVE";
}

export function employmentStatusLabel(code: string | null | undefined): string {
  const found = EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === code);
  return found?.label ?? String(code ?? "—");
}
