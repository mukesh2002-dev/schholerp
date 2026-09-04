/**
 * Central Indian reference library for Apex School ERP.
 *
 * Single source of truth for every India-specific dropdown option,
 * validation rule and code list used across forms, mock data and —
 * in future — backend API contracts. Keep option `value`s STABLE:
 * they double as the enum values the backend will expect.
 */

// ---------------------------------------------------------------------------
// States & Union Territories (ISO 3166-2:IN codes)
// ---------------------------------------------------------------------------
export interface IndianState {
  code: string; // e.g. "MH"
  name: string; // e.g. "Maharashtra"
}

export const INDIAN_STATES: IndianState[] = [
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu & Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
  { code: "AN", name: "Andaman & Nicobar Islands" },
  { code: "CH", name: "Chandigarh" },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "LK", name: "Lakshadweep" },
];

export const INDIAN_STATE_NAMES = INDIAN_STATES.map((s) => s.name);

// ---------------------------------------------------------------------------
// Education boards
// ---------------------------------------------------------------------------
export const SCHOOL_BOARDS = [
  "CBSE",
  "ICSE",
  "State Board",
  "IB",
  "Cambridge (CAIE)",
] as const;
export type SchoolBoard = (typeof SCHOOL_BOARDS)[number];

// ---------------------------------------------------------------------------
// Reservation / social category (as per Govt. of India + RTE)
// ---------------------------------------------------------------------------
export const SOCIAL_CATEGORIES = ["General", "EWS", "OBC", "SC", "ST"] as const;
export type SocialCategory = (typeof SOCIAL_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Religion / mother tongue / medium of instruction
// ---------------------------------------------------------------------------
export const RELIGIONS = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Buddhist",
  "Jain",
  "Parsi",
  "Other",
] as const;

export const MOTHER_TONGUES = [
  "Hindi",
  "English",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Odia",
  "Assamese",
  "Urdu",
  "Sanskrit",
  "Other",
] as const;

export const MEDIUMS_OF_INSTRUCTION = ["English", "Hindi", "Marathi", "Gujarati", "Semi-English"] as const;

// ---------------------------------------------------------------------------
// School houses (typical Indian convent / public school houses)
// ---------------------------------------------------------------------------
export const SCHOOL_HOUSES = ["Agni", "Prithvi", "Akash", "Vayu"] as const;
export type SchoolHouse = (typeof SCHOOL_HOUSES)[number];

// ---------------------------------------------------------------------------
// Classes offered (Pre-Primary → Senior Secondary, Indian pattern)
// ---------------------------------------------------------------------------
export const INDIAN_GRADES = [
  "Nursery",
  "LKG",
  "UKG",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
] as const;

// CBSE-aligned subject catalogue by stage
export const CBSE_SUBJECTS: Record<string, string[]> = {
  Primary: ["English", "Hindi", "Mathematics", "EVS", "Art & Craft", "Physical Education"],
  Middle: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Sanskrit", "Computer Science"],
  Secondary: ["English", "Hindi", "Mathematics", "Science", "Social Science", "Information Technology"],
  "Senior Secondary": ["English", "Physics", "Chemistry", "Mathematics", "Biology", "Accountancy", "Business Studies", "Economics", "Computer Science", "Physical Education"],
};

// ---------------------------------------------------------------------------
// Fee heads (Indian private-school chart, UDISE/RTE compatible)
// ---------------------------------------------------------------------------
export type FeeHeadCategory =
  | "TUITION"
  | "ADMISSION"
  | "EXAM"
  | "LAB"
  | "LIBRARY"
  | "TRANSPORT"
  | "SPORTS"
  | "ACTIVITY"
  | "DEVELOPMENT"
  | "MISC";

export interface IndianFeeHead {
  name: string;
  category: FeeHeadCategory;
  isRecurring: boolean;
}

export const INDIAN_FEE_HEADS: IndianFeeHead[] = [
  { name: "Tuition Fee", category: "TUITION", isRecurring: true },
  { name: "Admission Fee (One-time)", category: "ADMISSION", isRecurring: false },
  { name: "Caution Deposit (Refundable)", category: "ADMISSION", isRecurring: false },
  { name: "Term / Exam Fee", category: "EXAM", isRecurring: true },
  { name: "Laboratory Fee", category: "LAB", isRecurring: true },
  { name: "Library Fee", category: "LIBRARY", isRecurring: true },
  { name: "Computer / Smart-Class Fee", category: "LAB", isRecurring: true },
  { name: "Transport Fee", category: "TRANSPORT", isRecurring: true },
  { name: "Sports & PT Fee", category: "SPORTS", isRecurring: true },
  { name: "Activity / Club Fee", category: "ACTIVITY", isRecurring: true },
  { name: "Development Fee", category: "DEVELOPMENT", isRecurring: true },
  { name: "Diary, ID Card & Misc", category: "MISC", isRecurring: false },
];

// ---------------------------------------------------------------------------
// Salary components (Indian payroll: PF / ESI / PT / TDS)
// ---------------------------------------------------------------------------
export const SALARY_ALLOWANCES = [
  "House Rent Allowance (HRA)",
  "Dearness Allowance (DA)",
  "Conveyance Allowance",
  "Medical Allowance",
  "Special Allowance",
  "Children Education Allowance",
] as const;

export const SALARY_DEDUCTIONS = [
  "Provident Fund (PF @12%)",
  "ESI Contribution",
  "Professional Tax (PT)",
  "Income Tax (TDS)",
  "Labour Welfare Fund",
] as const;

// ---------------------------------------------------------------------------
// Staff departments & designations (Indian school hierarchy)
// ---------------------------------------------------------------------------
export const STAFF_DEPARTMENTS = [
  "Academics",
  "Administration",
  "Accounts & Finance",
  "Admissions & Front Office",
  "Library",
  "Laboratory",
  "Sports",
  "Transport",
  "Housekeeping & Maintenance",
  "Security",
  "IT Support",
] as const;

export const TEACHING_DESIGNATIONS = [
  "Principal",
  "Vice Principal",
  "Headmistress / Headmaster",
  "PGT (Post Graduate Teacher)",
  "TGT (Trained Graduate Teacher)",
  "PRT (Primary Teacher)",
  "Pre-Primary Teacher",
  "PET (Physical Education Teacher)",
  "Librarian",
  "Lab Assistant",
  "Special Educator",
] as const;

// ---------------------------------------------------------------------------
// Indian school holidays / festivals (for events & calendars)
// ---------------------------------------------------------------------------
export const INDIAN_FESTIVALS = [
  "Diwali",
  "Dussehra",
  "Holi",
  "Ganesh Chaturthi",
  "Navratri",
  "Janmashtami",
  "Raksha Bandhan",
  "Eid",
  "Christmas",
  "Guru Nanak Jayanti",
  "Pongal / Makar Sankranti",
  "Baisakhi",
  "Onam",
  "Independence Day",
  "Republic Day",
  "Gandhi Jayanti",
  "Children's Day",
  "Teachers' Day",
  "Annual Day",
  "Sports Day",
] as const;

// ---------------------------------------------------------------------------
// Validation — Indian formats (match backend regexes 1:1)
// ---------------------------------------------------------------------------
/** 10-digit Indian mobile: starts 6-9. Store digits only, display +91 grouped. */
export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

/** 6-digit PIN code, cannot start with 0. */
export const INDIAN_PIN_REGEX = /^[1-9]\d{5}$/;

/** PAN: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F). */
export const INDIAN_PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** UDISE+ school code: 11 digits (SS DD BB VV SSS). */
export const UDISE_REGEX = /^\d{11}$/;

/** Indian vehicle plate: MH-12-AB-1234 (also accepts MH12AB1234). */
export const INDIAN_PLATE_REGEX = /^[A-Z]{2}-?\d{1,2}-?[A-Z]{1,3}-?\d{1,4}$/;

/** Verhoeff checksum → valid 12-digit Aadhaar (no 0/1 leading). */
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 7, 2, 5],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export function isValidAadhaar(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (!/^[2-9]\d{11}$/.test(digits)) return false;
  let checksum = 0;
  const reversed = digits.split("").reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    checksum = VERHOEFF_D[checksum][VERHOEFF_P[i % 8][reversed[i]]];
  }
  return checksum === 0;
}

/** Demo-safe Aadhaar pool (all Verhoeff-valid) for mock data. */
export const DEMO_AADHAAR_NUMBERS = [
  "234567890124",
  "345678901255",
  "456789012387",
  "567890123518",
  "678901234659",
  "789012345797",
];

/** Normalise any user-typed phone to 10 digits (strips +91, spaces, dashes). */
export function normaliseIndianMobile(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

/** Display helper: "9876543210" → "+91 98765 43210". */
export function formatIndianMobile(input: string): string {
  const digits = normaliseIndianMobile(input);
  if (digits.length !== 10) return input;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

// ---------------------------------------------------------------------------
// Demo pools (realistic Indian names / cities / contacts)
// ---------------------------------------------------------------------------
export const DEMO_INDIAN_CITIES: { city: string; state: string; pin: string }[] = [
  { city: "Pune", state: "Maharashtra", pin: "411001" },
  { city: "Mumbai", state: "Maharashtra", pin: "400001" },
  { city: "Nagpur", state: "Maharashtra", pin: "440001" },
  { city: "Bengaluru", state: "Karnataka", pin: "560001" },
  { city: "Jaipur", state: "Rajasthan", pin: "302001" },
  { city: "Ahmedabad", state: "Gujarat", pin: "380001" },
  { city: "Lucknow", state: "Uttar Pradesh", pin: "226001" },
  { city: "Chennai", state: "Tamil Nadu", pin: "600001" },
];

export const DEMO_INDIAN_MOBILES = [
  "9876543210",
  "9812345678",
  "9765432109",
  "9890123456",
  "9822011223",
  "9755123489",
  "9887766554",
  "9733112244",
];

export const DEMO_STUDENT_NAMES = [
  { first: "Aarav", last: "Sharma" },
  { first: "Diya", last: "Patel" },
  { first: "Arjun", last: "Nair" },
  { first: "Ananya", last: "Iyer" },
  { first: "Vihaan", last: "Gupta" },
  { first: "Ishita", last: "Verma" },
  { first: "Kabir", last: "Malhotra" },
  { first: "Meera", last: "Reddy" },
  { first: "Rohan", last: "Joshi" },
  { first: "Sanya", last: "Kulkarni" },
  { first: "Aditya", last: "Deshmukh" },
  { first: "Navya", last: "Agarwal" },
];

export const DEMO_TEACHER_NAMES = [
  { first: "Sunita", last: "Rao", title: "Mrs." },
  { first: "Rajesh", last: "Kulkarni", title: "Mr." },
  { first: "Priya", last: "Menon", title: "Ms." },
  { first: "Amit", last: "Shah", title: "Mr." },
  { first: "Kavitha", last: "Subramaniam", title: "Mrs." },
  { first: "Vikram", last: "Singh", title: "Mr." },
  { first: "Deepa", last: "Nair", title: "Dr." },
  { first: "Suresh", last: "Pillai", title: "Mr." },
];

export const DEMO_PARENT_NAMES = [
  { father: "Ramesh Sharma", mother: "Sunita Sharma" },
  { father: "Prakash Patel", mother: "Jaya Patel" },
  { father: "Suresh Nair", mother: "Lakshmi Nair" },
  { father: "Venkatesh Iyer", mother: "Divya Iyer" },
  { father: "Manoj Gupta", mother: "Rekha Gupta" },
  { father: "Ashok Verma", mother: "Poonam Verma" },
];

export const DEMO_OCCUPATIONS = [
  "Shop Owner",
  "Bank Clerk",
  "Primary Teacher",
  "Auto Driver",
  "Staff Nurse",
  "Railway Employee",
  "Accountant",
  "Farmer",
  "Police Constable",
  "Tailor",
  "Electrician",
  "Homemaker",
];
