export type Role =
  | "SUPER_ADMIN"
  | "PRINCIPAL"
  | "TEACHER"
  | "ACCOUNTANT"
  | "HR_MANAGER"
  | "PARENT"
  | "STUDENT"
  | "STAFF";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  branchId: string; // 'all' or specific branch id
  roleLabel: string;
  title: string;
}

export type BranchStatus = "ACTIVE" | "EXPANDING" | "MAINTENANCE" | "INACTIVE";

export type BranchType =
  | "Main Campus"
  | "STEM Academy"
  | "Montessori & Prep"
  | "International"
  | "High School"
  | "Arts & Sports";

export interface BranchDepartment {
  name: string;
  head: string;
  staffCount: number;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  tagline: string;
  type: BranchType;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  establishedYear: number;
  status: BranchStatus;
  totalStudents: number;
  capacity: number;
  totalTeachers: number;
  totalStaff: number;
  totalWorkers: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  attendanceRate: number; // percentage
  feeCollectionRate: number; // percentage
  facilities: string[];
  departments: BranchDepartment[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

// ADMISSIONS
export type AdmissionStatus =
  | "NEW"
  | "UNDER_REVIEW"
  | "INTERVIEW_SCHEDULED"
  | "APPROVED"
  | "REJECTED"
  | "WAITLISTED";

export interface AdmissionDocumentItem {
  id: string;
  name: string;
  required: boolean;
  submitted: boolean;
  verified: boolean;
  fileUrl?: string;
}

export interface AdmissionApplication {
  id: string;
  applicationNumber: string; // e.g. ADM-2026-101
  applicantFirstName: string;
  applicantLastName: string;
  applicantFullName: string;
  avatar?: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  gradeApplied: string; // e.g. Grade 9
  branchId: string;
  branchName: string;
  academicYear: string; // 2026-2027
  submissionDate: string;
  status: AdmissionStatus;
  parentName: string;
  parentRelationship: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  previousSchool?: string;
  previousGrade?: string;
  previousGpa?: string;
  entranceTestScore?: number; // percentage e.g. 88%
  interviewDate?: string;
  interviewFeedback?: string;
  documents: AdmissionDocumentItem[];
  notes?: string;
  enrolledStudentId?: string;
  createdAt: string;
  updatedAt: string;
}

// STUDENTS
export type StudentStatus = "ACTIVE" | "GRADUATED" | "TRANSFERRED" | "SUSPENDED";

export interface GuardianInfo {
  name: string;
  relation: "Father" | "Mother" | "Guardian" | "Other";
  email: string;
  phone: string;
  occupation: string;
  address: string;
  emergencyContact: string;
}

export interface StudentAttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number; // e.g. 96.5%
}

export interface StudentFeeSummary {
  totalAssigned: number;
  totalPaid: number;
  totalPending: number;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  lastPaymentDate?: string;
}

export interface AcademicHistoryEntry {
  term: string; // e.g. Term 1 - 2025-26
  grade: string;
  gpa: number; // 3.8
  percentage: number;
  rank: number;
  remarks: string;
}

export interface StudentDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  verified: boolean;
  size: string;
}

export interface Student {
  id: string;
  rollNumber: string; // e.g. STU-1042
  admissionNumber: string; // e.g. ADM-2026-101
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  bloodGroup: string; // O+, A+, B+, AB+, etc.
  branchId: string;
  branchName: string;
  classId: string;
  className: string; // e.g. Grade 10
  sectionId: string;
  sectionName: string; // Section A
  admissionDate: string;
  status: StudentStatus;
  guardian: GuardianInfo;
  attendanceSummary: StudentAttendanceSummary;
  feeSummary: StudentFeeSummary;
  academicHistory: AcademicHistoryEntry[];
  documents: StudentDocument[];
  address: string;
  city: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

// CLASSES & SECTIONS
export interface Section {
  id: string;
  name: string; // e.g. Section A
  roomNumber: string; // e.g. Room 204
  classTeacherId: string;
  classTeacherName: string;
  classTeacherAvatar?: string;
  studentCount: number;
  capacity: number;
}

export interface Subject {
  id: string;
  name: string; // Mathematics
  code: string; // MATH-10
  teacherId: string;
  teacherName: string;
  weeklyPeriods: number; // 6
  credits?: number;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. Grade 10
  gradeLevel: number; // 10
  category: "Kindergarten" | "Primary" | "Middle School" | "High School" | "Senior Secondary";
  branchId: string;
  branchName: string;
  sections: Section[];
  subjects: Subject[];
  totalStudents: number;
  capacity: number;
  description?: string;
}

// TEACHERS & FACULTY
export type TeacherStatus = "ACTIVE" | "ON_LEAVE" | "PROBATION" | "RESIGNED";

export interface TeacherAssignedClass {
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectName: string;
  weeklyPeriods: number;
}

export interface TeacherLeaveSummary {
  totalAllowed: number;
  used: number;
  balance: number;
  casualLeaves: number;
  medicalLeaves: number;
}

export interface TeacherSalarySummary {
  baseSalary: number;
  allowances: number;
  grossSalary: number;
  paymentStatus: "PAID" | "PENDING";
  lastDisbursedDate: string;
}

export interface Teacher {
  id: string;
  employeeId: string; // e.g. TCH-048
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  qualification: string; // e.g. M.Sc. Physics, B.Ed.
  joiningDate: string;
  branchId: string;
  branchName: string;
  department: string; // Science & Technology
  designation: string; // Senior Physics Instructor
  status: TeacherStatus;
  subjectsTaught: string[];
  assignedClasses: TeacherAssignedClass[];
  attendanceRate: number;
  leaveSummary: TeacherLeaveSummary;
  salarySummary: TeacherSalarySummary;
  bio?: string;
  experienceYears: number;
  createdAt: string;
  updatedAt: string;
}

// DASHBOARD & CHARTS
export interface DashboardMetric {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  period: string;
  description: string;
  icon: string;
  color: string;
}

export interface AttendanceTrendPoint {
  date: string;
  students: number;
  teachers: number;
  workers: number;
}

export interface FeeCollectionPoint {
  month: string;
  collected: number;
  target: number;
  pending: number;
}

export interface AdmissionFunnelPoint {
  stage: string;
  count: number;
  percentage: number;
  fill: string;
}

export interface BranchCapacityPoint {
  branchCode: string;
  branchName: string;
  enrolled: number;
  capacity: number;
  occupancyRate: number;
}

export type NoticePriority = "URGENT" | "HIGH" | "NORMAL" | "LOW";

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: NoticePriority;
  branchId: string;
  branchName?: string;
  category: "Academic" | "Administrative" | "Event" | "Holiday" | "Emergency" | "Transport";
  author: string;
  targetAudience: ("ALL" | "PARENTS" | "TEACHERS" | "STUDENTS" | "STAFF")[];
  isRead?: boolean;
}

export type ActivityAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "PAYMENT"
  | "LOGIN"
  | "EXPORT"
  | "SYNC";

export interface ActivityLog {
  id: string;
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  action: ActivityAction;
  module: string;
  entityName: string;
  entityId?: string;
  timestamp: string;
  branchId: string;
  branchName: string;
  details: string;
  status: "SUCCESS" | "WARNING" | "FAILED" | "PENDING";
}

export interface BiometricDevice {
  id: string;
  name: string;
  location: string;
  branchId: string;
  branchName: string;
  ipAddress: string;
  status: "ONLINE" | "OFFLINE" | "SYNCING";
  lastSync: string;
  enrolledUsers: number;
  batteryLevel?: number;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
  action?: () => void;
  color: string;
  requiredRole?: Role[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Branch" | "Student" | "Teacher" | "Worker" | "Navigation" | "Notice" | "Finance" | "Class" | "Admission" | "Transport";
  href: string;
  icon: string;
  badge?: string;
}

// ==================== FEES ====================
export type FeePaymentStatus = "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
export type FeeFrequency = "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "ANNUAL" | "ONE_TIME";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CHEQUE" | "UPI" | "CARD" | "ONLINE";

export interface FeeHead {
  id: string;
  name: string;
  description: string;
  category: "TUITION" | "LAB" | "LIBRARY" | "TRANSPORT" | "SPORTS" | "EXAM" | "MISC";
  isRecurring: boolean;
  color: string;
}

export interface FeeStructureItem {
  feeHeadId: string;
  feeHeadName: string;
  amount: number;
  frequency: FeeFrequency;
}

export interface FeeStructure {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  applicableClasses: string[];
  academicYear: string;
  items: FeeStructureItem[];
  totalAmount: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
}

export interface FeeAssignment {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  classId: string;
  className: string;
  branchId: string;
  branchName: string;
  structureId: string;
  structureName: string;
  totalAssigned: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  status: FeePaymentStatus;
  dueDate: string;
  lastPaymentDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  classId: string;
  className: string;
  branchId: string;
  branchName: string;
  items: { feeHeadName: string; amount: number }[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: FeePaymentStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  academicYear: string;
  period: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  receiptNumber: string;
  date: string;
  branchId: string;
  branchName: string;
  notes?: string;
}

// ==================== ATTENDANCE ====================
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
export type AttendanceCategory = "STUDENT" | "TEACHER" | "STAFF" | "WORKER";

export interface AttendanceRecord {
  id: string;
  personId: string;
  personName: string;
  personAvatar?: string;
  category: AttendanceCategory;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  branchId: string;
  branchName: string;
  classId?: string;
  className?: string;
  sectionId?: string;
  sectionName?: string;
  markedBy: string;
  markedAt: string;
  note?: string;
}

export interface AttendanceDaySummary {
  date: string;
  category: AttendanceCategory;
  branchId: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  rate: number;
}

export interface AttendanceReportEntry {
  personId: string;
  personName: string;
  personAvatar?: string;
  category: AttendanceCategory;
  classId?: string;
  className?: string;
  branchId: string;
  branchName: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  rate: number;
}

// ==================== BIOMETRIC (Extended) ====================
export interface BiometricEnrolledUser {
  id: string;
  personId: string;
  personName: string;
  personAvatar?: string;
  category: AttendanceCategory;
  deviceId: string;
  deviceName: string;
  branchId: string;
  branchName: string;
  fingerprintId: string;
  enrolledAt: string;
  lastScan?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface BiometricSyncLog {
  id: string;
  deviceId: string;
  deviceName: string;
  branchId: string;
  branchName: string;
  syncType: "AUTO" | "MANUAL";
  recordsProcessed: number;
  recordsFailed: number;
  startedAt: string;
  completedAt: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  message: string;
}

// ==================== TIMETABLE ====================
export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";

export interface Period {
  id: string;
  number: number;
  label: string;
  startTime: string;
  endTime: string;
}

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  periodNumber: number;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  roomNumber: string;
  branchId: string;
  branchName: string;
}

export interface Timetable {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
  academicYear: string;
  effectiveFrom: string;
  slots: TimetableSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface RoomAssignment {
  roomNumber: string;
  building: string;
  floor: number;
  capacity: number;
  type: "CLASSROOM" | "LAB" | "STUDIO" | "HALL";
}

// ==================== HOMEWORK ====================
export type HomeworkStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type SubmissionStatus = "SUBMITTED" | "GRADED" | "LATE" | "NOT_SUBMITTED";

export interface Homework {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  branchId: string;
  branchName: string;
  teacherId: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  status: HomeworkStatus;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  submissionDate: string;
  status: SubmissionStatus;
  marksObtained?: number;
  remarks?: string;
  fileUrl?: string;
}

// ==================== EXAMS & RESULTS ====================
export type ExamTypeCategory = "UNIT_TEST" | "MIDTERM" | "FINAL" | "QUARTERLY" | "ANNUAL" | "CUSTOM";
export type ExamStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type ResultStatus = "PASS" | "FAIL" | "PENDING" | "DISQUALIFIED";

export interface ExamType {
  id: string;
  name: string;
  category: ExamTypeCategory;
  description: string;
  maxMarks: number;
  passingMarks: number;
  weightage: number; // percentage of final grade
  branchId: string;
}

export interface ExamSchedule {
  id: string;
  examName: string;
  examTypeId: string;
  examTypeName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
  branchId: string;
  branchName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  status: ExamStatus;
  totalMarks: number;
  passingMarks: number;
}

export interface MarkEntry {
  id: string;
  examScheduleId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  subjectId: string;
  subjectName: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: ResultStatus;
  remarks?: string;
  enteredBy: string;
  enteredAt: string;
}

export interface GradeScale {
  id: string;
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gpa: number;
  description: string;
  color: string;
}

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  branchId: string;
  branchName: string;
  examTypeId: string;
  examTypeName: string;
  academicYear: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  overallGrade: string;
  gpa: number;
  rank: number;
  totalStudents: number;
  status: ResultStatus;
  subjects: {
    subjectId: string;
    subjectName: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    status: ResultStatus;
  }[];
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== TRANSPORT ====================
export type VehicleType = "BUS" | "VAN" | "MINIBUS" | "CAR";
export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "RETIRED";
export type RouteStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type DriverStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE";
export type MaintenanceType = "ROUTINE" | "REPAIR" | "INSURANCE" | "EMISSION_TEST" | "BREAKDOWN";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  capacity: number;
  branchId: string;
  branchName: string;
  status: VehicleStatus;
  fuelType: string;
  insuranceExpiry: string;
  lastServiceDate: string;
  nextServiceDate: string;
  gpsDeviceId?: string;
  assignedRouteId?: string;
  assignedRouteName?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportStop {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  landmark?: string;
  branchId: string;
  arrivalTime: string;
  departureTime: string;
  studentCount: number;
}

export interface TransportRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  branchId: string;
  branchName: string;
  stops: TransportStop[];
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  vehicleId?: string;
  vehicleRegistration?: string;
  driverId?: string;
  driverName?: string;
  helperId?: string;
  helperName?: string;
  studentCount: number;
  capacity: number;
  status: RouteStatus;
  morningDeparture: string;
  eveningDeparture: string;
  createdAt: string;
  updatedAt: string;
}

export interface Driver {
  id: string;
  employeeId: string;
  name: string;
  avatar?: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  branchId: string;
  branchName: string;
  status: DriverStatus;
  assignedVehicleId?: string;
  assignedVehicleReg?: string;
  experienceYears: number;
  dateJoined: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusHelper {
  id: string;
  employeeId: string;
  name: string;
  avatar?: string;
  phone: string;
  branchId: string;
  branchName: string;
  assignedRouteId?: string;
  assignedRouteName?: string;
  assignedVehicleId?: string;
  dateJoined: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface StudentTransportAssignment {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  classId: string;
  className: string;
  branchId: string;
  routeId: string;
  routeName: string;
  stopId: string;
  stopName: string;
  vehicleId: string;
  vehicleRegistration: string;
  shift: "MORNING" | "EVENING" | "BOTH";
  feePerMonth: number;
  status: "ACTIVE" | "INACTIVE";
  assignedDate: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  vehicleRegistration: string;
  type: MaintenanceType;
  description: string;
  cost: number;
  vendor: string;
  date: string;
  nextDueDate?: string;
  mileage?: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  notes?: string;
  createdAt: string;
}

// ==================== COMMUNICATION ====================
export type AnnouncementPriority = "URGENT" | "HIGH" | "NORMAL" | "LOW";
export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AnnouncementTarget = "ALL" | "STUDENTS" | "TEACHERS" | "PARENTS" | "STAFF" | "CLASS" | "SECTION";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  authorRole: string;
  branchId: string;
  branchName: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  target: AnnouncementTarget;
  targetClassIds?: string[];
  targetClassNames?: string[];
  attachments?: string[];
  publishDate: string;
  expiryDate?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MessageChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";
export type MessageStatus = "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface Message {
  id: string;
  subject: string;
  body: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  recipientIds: string[];
  recipientNames: string[];
  recipientType: "INDIVIDUAL" | "GROUP" | "ALL_TEACHERS" | "ALL_PARENTS" | "ALL_STUDENTS";
  channel: MessageChannel;
  channelStatus: MessageStatus;
  branchId: string;
  branchName: string;
  isRead: boolean;
  isStarred: boolean;
  replyToId?: string;
  threadId?: string;
  attachments?: string[];
  sentAt: string;
  readAt?: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: { id: string; name: string; avatar?: string }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  branchId: string;
}

// ==================== NOTIFICATIONS ====================
export type NotificationCategory = "ACADEMIC" | "FINANCE" | "TRANSPORT" | "EVENT" | "ATTENDANCE" | "SYSTEM" | "MESSAGE";
export type NotificationChannelType = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
  isRead: boolean;
  isArchived: boolean;
  userId: string;
  branchId: string;
  branchName: string;
  actionUrl?: string;
  actionLabel?: string;
  icon: string;
  channels: NotificationChannelType[];
  deliveredChannels: NotificationChannelType[];
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  category: NotificationCategory;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

// ==================== EVENTS ====================
export type EventCategory = "ACADEMIC" | "CULTURAL" | "SPORTS" | "WORKSHOP" | "MEETING" | "HOLIDAY" | "EXCURSION" | "OTHER";
export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type EventVisibility = "PUBLIC" | "STAFF_ONLY" | "STUDENTS_ONLY" | "PARENTS_ONLY";

export interface EventVenue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  branchId: string;
  branchName: string;
  facilities: string[];
}

export interface EventReminder {
  id: string;
  eventId: string;
  remindBefore: number; // minutes
  channel: NotificationChannelType;
  sent: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  visibility: EventVisibility;
  branchId: string;
  branchName: string;
  venueId?: string;
  venueName?: string;
  venueAddress?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  organizer: string;
  organizerRole: string;
  participantCount: number;
  maxParticipants?: number;
  participantType: "STUDENTS" | "TEACHERS" | "PARENTS" | "ALL";
  classIds?: string[];
  classNames?: string[];
  reminders: EventReminder[];
  attachments?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== INVENTORY ====================
export type InventoryItemStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";
export type PurchaseStatus = "PENDING" | "APPROVED" | "RECEIVED" | "CANCELLED";
export type IssueReturnStatus = "ISSUED" | "RETURNED" | "OVERDUE";

export interface InventoryCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  color: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  description: string;
  quantity: number;
  minStock: number;
  unitPrice: number;
  totalValue: number;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  location: string;
  status: InventoryItemStatus;
  lastRestocked: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  rating: number;
  totalOrders: number;
  branchId: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface PurchaseEntry {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  branchId: string;
  branchName: string;
  purchaseDate: string;
  status: PurchaseStatus;
  approvedBy?: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: "PURCHASE" | "ISSUE" | "RETURN" | "ADJUSTMENT" | "DAMAGE";
  quantity: number;
  branchId: string;
  branchName: string;
  performedBy: string;
  recipientName?: string;
  reason: string;
  date: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  currentQuantity: number;
  minStock: number;
  branchId: string;
  branchName: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  createdAt: string;
  acknowledged: boolean;
}

// ==================== EXPENSES ====================
export type ExpenseStatus = "PENDING" | "APPROVED" | "REJECTED" | "PAID";
export type ExpenseApprovalLevel = "HOD" | "PRINCIPAL" | "ADMIN";

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  totalBudget: number;
  spent: number;
}

export interface ExpenseEntry {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  branchId: string;
  branchName: string;
  submittedBy: string;
  submittedByRole: string;
  approvedBy?: string;
  status: ExpenseStatus;
  approvalLevel: ExpenseApprovalLevel;
  expenseDate: string;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "UPI" | "CARD";
  invoiceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyExpenseSummary {
  month: string;
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

// ==================== PAYROLL ====================
export type PayrollStatus = "DRAFT" | "PROCESSING" | "COMPLETED" | "PAID";
export type PaymentMode = "BANK_TRANSFER" | "CASH" | "CHEQUE";

export interface SalaryStructure {
  id: string;
  name: string;
  description: string;
  baseSalary: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossSalary: number;
  netSalary: number;
  applicableTo: "TEACHER" | "STAFF" | "WORKER" | "ALL";
  branchId: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  employeeAvatar?: string;
  branchId: string;
  branchName: string;
  salaryStructureId: string;
  salaryStructureName: string;
  month: string;
  year: number;
  workingDays: number;
  presentDays: number;
  baseSalary: number;
  allowances: { name: string; amount: number }[];
  grossSalary: number;
  deductions: { name: string; amount: number }[];
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payslip {
  id: string;
  payrollId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  employeeAvatar?: string;
  branchName: string;
  month: string;
  year: number;
  salaryStructureName: string;
  workingDays: number;
  presentDays: number;
  baseSalary: number;
  allowances: { name: string; amount: number }[];
  grossSalary: number;
  deductions: { name: string; amount: number }[];
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  generatedAt: string;
}

// ==================== DOCUMENTS ====================
export type DocumentCategory = "IDENTITY" | "ACADEMIC" | "MEDICAL" | "FINANCIAL" | "LEGAL" | "EMPLOYMENT" | "OTHER";
export type DocumentVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";

export interface DocumentRecord {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  ownerId: string;
  ownerName: string;
  ownerType: "STUDENT" | "TEACHER" | "STAFF" | "WORKER";
  branchId: string;
  branchName: string;
  fileType: string;
  fileSize: string;
  uploadDate: string;
  expiryDate?: string;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== LIBRARY ====================
export type BookCategory = "TEXTBOOK" | "REFERENCE" | "FICTION" | "NON_FICTION" | "JOURNAL" | "MAGAZINE" | "DIGITAL" | "OTHER";
export type BookStatus = "AVAILABLE" | "ISSUED" | "RESERVED" | "LOST" | "DAMAGED";

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: BookCategory;
  branchId: string;
  branchName: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  issuedCopies: number;
  price: number;
  publishedYear: number;
  language: string;
  status: BookStatus;
  coverImage?: string;
  description: string;
  addedDate: string;
  createdAt: string;
  updatedAt: string;
}

export type IssueStatus = "ISSUED" | "RETURNED" | "OVERDUE" | "LOST";

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  bookIsbn: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  className: string;
  branchId: string;
  branchName: string;
  issuedDate: string;
  dueDate: string;
  returnedDate?: string;
  status: IssueStatus;
  fineAmount: number;
  finePaid: number;
  issuedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryFine {
  id: string;
  issueId: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  reason: "OVERDUE" | "LOST" | "DAMAGED";
  amount: number;
  paidAmount: number;
  status: "PENDING" | "PAID" | "WAIVED";
  dueDate: string;
  createdAt: string;
}

// ==================== STAFF / HR ====================
export type StaffType = "TEACHING" | "NON_TEACHING" | "ADMIN" | "SUPPORT";
export type StaffStatus = "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "PROBATION" | "SUSPENDED";
export type LeaveType = "CASUAL" | "MEDICAL" | "EARNED" | "MATERNITY" | "PATERNITY" | "UNPAID";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  joiningDate: string;
  branchId: string;
  branchName: string;
  department: string;
  designation: string;
  staffType: StaffType;
  status: StaffStatus;
  qualification: string;
  experienceYears: number;
  salaryStructureId?: string;
  salaryStructureName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffAvatar?: string;
  branchId: string;
  branchName: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  createdAt: string;
}

// ==================== REPORTS ====================
export interface ReportMetric {
  label: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: string;
}

export interface AttendanceReportPoint {
  month: string;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

export interface FeeReportPoint {
  month: string;
  collected: number;
  pending: number;
  target: number;
}

export interface AdmissionReportPoint {
  month: string;
  applied: number;
  approved: number;
  rejected: number;
  enrolled: number;
}

export interface ExpenseReportPoint {
  month: string;
  amount: number;
  category: string;
}

export interface PayrollReportPoint {
  month: string;
  total: number;
  teachers: number;
  staff: number;
  workers: number;
}

export interface InventoryReportPoint {
  category: string;
  value: number;
  items: number;
}

export interface AcademicReportPoint {
  className: string;
  averagePercentage: number;
  passRate: number;
  toppers: number;
  totalStudents: number;
}

// ==================== QA / TEST MANAGEMENT ====================
export type TestStatus = "DRAFT" | "READY" | "PASSED" | "FAILED" | "BLOCKED" | "SKIPPED";
export type TestPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type TestSeverity = "BLOCKER" | "CRITICAL" | "MAJOR" | "MINOR" | "TRIVIAL";

export interface TestCase {
  id: string;
  title: string;
  module: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  actualResult?: string;
  status: TestStatus;
  priority: TestPriority;
  severity: TestSeverity;
  assignee: string;
  assigneeRole: string;
  environment: string;
  suiteId?: string;
  suiteName?: string;
  planId?: string;
  planName?: string;
  lastRunDate?: string;
  lastRunBy?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  module: string;
  testCaseCount: number;
  passedCount: number;
  failedCount: number;
  blockedCount: number;
  passRate: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestPlan {
  id: string;
  name: string;
  description: string;
  modules: string[];
  totalCases: number;
  executedCases: number;
  passedCases: number;
  failedCases: number;
  blockedCases: number;
  passRate: number;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  environment: string;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestRun {
  id: string;
  planId: string;
  planName: string;
  runNumber: number;
  environment: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABORTED";
  totalCases: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  executedBy: string;
  startedAt: string;
  completedAt?: string;
  notes?: string;
}

// ==================== BUG / ISSUE TRACKING ====================
export type BugStatus = "OPEN" | "IN_PROGRESS" | "FIXED" | "RETEST" | "REOPENED" | "CLOSED" | "REJECTED";
export type BugPriority = "P1_CRITICAL" | "P2_HIGH" | "P3_MEDIUM" | "P4_LOW";
export type BugSeverityLevel = "S1_BLOCKER" | "S2_CRITICAL" | "S3_MAJOR" | "S4_MINOR" | "S5_TRIVIAL";

export interface Bug {
  id: string;
  title: string;
  description: string;
  module: string;
  status: BugStatus;
  priority: BugPriority;
  severity: BugSeverityLevel;
  assignee: string;
  assigneeRole: string;
  reporter: string;
  reporterRole: string;
  environment: string;
  browser?: string;
  os?: string;
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  linkedTestCaseId?: string;
  linkedTestCaseTitle?: string;
  attachments?: string[];
  comments: BugComment[];
  resolution?: string;
  fixedBy?: string;
  fixedDate?: string;
  retestDate?: string;
  closedDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BugComment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  timestamp: string;
}

export interface BugActivityLog {
  id: string;
  bugId: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  timestamp: string;
}

export interface QADashboardMetrics {
  totalTestCases: number;
  passedTests: number;
  failedTests: number;
  blockedTests: number;
  passRate: number;
  failRate: number;
  totalBugs: number;
  openBugs: number;
  criticalBugs: number;
  resolvedBugs: number;
  bugsByModule: { module: string; count: number }[];
  executionTrend: { date: string; passed: number; failed: number; blocked: number }[];
  bugsByPriority: { priority: string; count: number }[];
  bugsBySeverity: { severity: string; count: number }[];
}

// ==================== BUILD & DEPLOYMENT ====================
export type BuildStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type DeploymentStatus = "PENDING" | "DEPLOYING" | "SUCCESS" | "FAILED" | "ROLLED_BACK" | "CANCELLED";
export type Environment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";
export type CICDPlatform = "GITHUB_ACTIONS" | "GITLAB_CI" | "JENKINS" | "DOCKER" | "KUBERNETES" | "VERCEL" | "AWS" | "AZURE";

export interface Build {
  id: string;
  buildNumber: number;
  branch: string;
  commitHash: string;
  commitMessage: string;
  commitAuthor: string;
  environment: Environment;
  status: BuildStatus;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  triggeredBy: string;
  pipeline: CICDPlatform;
  logs: BuildLogEntry[];
  testsPassed?: number;
  testsFailed?: number;
  testsSkipped?: number;
  coveragePercent?: number;
  artifacts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BuildLogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  message: string;
  step?: string;
}

export interface Deployment {
  id: string;
  deploymentNumber: number;
  buildId: string;
  buildNumber: number;
  environment: Environment;
  status: DeploymentStatus;
  version: string;
  releaseNotes: string;
  deployedBy: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  rollbackAvailable: boolean;
  rollbackDeploymentId?: string;
  deployedByRole: string;
  services: string[];
  healthCheckUrl?: string;
  commitHash: string;
  branch: string;
  timeline: DeploymentTimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentTimelineEntry {
  id: string;
  status: DeploymentStatus;
  message: string;
  timestamp: string;
  performedBy: string;
}

export interface CICDIntegration {
  id: string;
  platform: CICDPlatform;
  name: string;
  description: string;
  status: "CONNECTED" | "DISCONNECTED" | "ERROR";
  lastSync?: string;
  projectCount?: number;
  pipelineCount?: number;
  icon: string;
}

export interface BuildMetrics {
  totalBuilds: number;
  successfulBuilds: number;
  failedBuilds: number;
  avgBuildTime: number;
  successRate: number;
  buildsByBranch: { branch: string; count: number; successRate: number }[];
  buildTrend: { date: string; success: number; failed: number }[];
  deploymentsByEnv: { environment: string; count: number; successRate: number }[];
}

// ==================== AUDIT LOG ====================
export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "APPROVAL" | "PAYMENT" | "STATUS_CHANGE";

export interface AuditLog {
  id: string;
  user: string;
  userRole: string;
  action: AuditAction;
  module: string;
  recordId: string;
  recordName: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  beforeSummary?: string;
  afterSummary?: string;
  details?: string;
}

export interface ModuleHealth {
  module: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN" | "MAINTENANCE";
  uptime: number;
  avgResponseMs: number;
  errorRate: number;
  lastChecked: string;
}

export interface EngineeringDashboardData {
  currentBuild: { number: number; branch: string; status: string; commit: string; startedAt: string };
  deploymentStatus: { environment: string; version: string; status: string; deployedAt: string }[];
  testPassRate: number;
  failedTests: number;
  openBugs: number;
  criticalBugs: number;
  recentDeployments: { version: string; environment: string; status: string; date: string }[];
  recentAuditEvents: AuditLog[];
  moduleHealth: ModuleHealth[];
}
