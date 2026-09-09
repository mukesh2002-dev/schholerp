"use client";

import {
  Branch,
  Notice,
  ActivityLog,
  BiometricDevice,
  UserSession,
  SearchResultItem,
  AdmissionApplication,
  Student,
  ClassRoom,
  Subject,
  SubjectTopic,
  Section,
  Teacher,
  AdmissionStatus,
  FeeHead,
  FeeStructure,
  FeeAssignment,
  Invoice,
  PaymentRecord,
  AttendanceRecord,
  AttendanceCategory,
  AttendanceDaySummary,
  AttendanceReportEntry,
  BiometricEnrolledUser,
  BiometricSyncLog,
  Timetable,
  TimetableSlot,
  Homework,
  HomeworkSubmission,
  Exam,
  ExamType,
  ExamSchedule,
  MarkEntry,
  GradeScale,
  Result,
  Vehicle,
  TransportRoute,
  TransportFeeSlab,
  Driver,
  BusHelper,
  StudentTransportAssignment,
  VehicleMaintenance,
  Announcement,
  Message,
  MessageThread,
  Notification,
  NotificationPreference,
  CalendarEvent,
  EventVenue,
  InventoryCategory,
  InventoryItem,
  InventorySupplier,
  PurchaseEntry,
  InventoryTransaction,
  StockAlert,
  StoreLocation,
  StoreSale,
  SaleItem,
  ReturnExchangeRecord,
  StockTransfer,
  StockAdjustment,
  StoreSalePaymentMethod,
  PurchaseRequest,
  Asset,
  AssetMaintenance,
  ExpenseCategory,
  ExpenseEntry,
  MonthlyExpenseSummary,
  SalaryStructure,
  PayrollRecord,
  DocumentRecord,
  TestCase,
  TestSuite,
  TestPlan,
  TestRun,
  Bug,
  BugComment,
  Build,
  Deployment,
  CICDIntegration,
  BuildMetrics,
  AuditLog,
  ModuleHealth,
  LibraryBook,
  BookIssue,
  LibraryFine,
  StaffMember,
  LeaveRecord,
} from "@/types";
import { initialBranches } from "../mock-data/branches";
import {
  initialActivities,
  initialBiometricDevices,
  initialNotices,
  defaultUserSession,
} from "../mock-data/dashboard";
import { initialTeachers } from "../mock-data/teachers";
import { initialClasses } from "../mock-data/classes";
import { initialStudents } from "../mock-data/students";
import { initialAdmissions } from "../mock-data/admissions";
import { initialFeeHeads, initialFeeStructures, initialFeeAssignments, initialInvoices, initialPayments } from "../mock-data/fees";
import { initialAttendanceRecords, computeDaySummaries, computeReportEntries } from "../mock-data/attendance";
import { initialEnrolledUsers, initialSyncLogs } from "../mock-data/biometric";
import { initialTimetables, initialTimetableSlots, defaultPeriods } from "../mock-data/timetable";
import { initialHomework, initialHomeworkSubmissions } from "../mock-data/homework";
import { initialExams, initialExamTypes, initialExamSchedules, initialMarkEntries, initialGradeScale, initialResults } from "../mock-data/exams";
import { initialVehicles, initialTransportRoutes, initialDrivers, initialBusHelpers, initialStudentTransportAssignments, initialVehicleMaintenance, initialTransportFeeSlabs } from "../mock-data/transport";
import { proratedFee as calcProratedFee } from "../transport/transport-fee-utils";
import { initialAnnouncements, initialMessages, initialMessageThreads, initialNotifications, initialNotificationPreferences } from "../mock-data/notifications";
import { initialCalendarEvents, initialEventVenues } from "../mock-data/events";
import { initialInventoryCategories, initialInventoryItems, initialInventorySuppliers, initialPurchaseEntries, initialInventoryTransactions, initialStockAlerts, initialStoreLocations, initialPurchaseRequests, initialAssets, initialAssetMaintenance } from "../mock-data/inventory";
import { initialExpenseCategories, initialExpenseEntries, initialMonthlyExpenseSummary } from "../mock-data/expenses";
import { initialSalaryStructures, initialPayrollRecords } from "../mock-data/payroll";
import { initialDocuments } from "../mock-data/documents";
import { initialTestCases, initialTestSuites, initialTestPlans, initialTestRuns } from "../mock-data/test-cases";
import { initialBugs, initialBugActivityLogs, initialQADashboardMetrics } from "../mock-data/bugs";
import { initialBuilds, initialDeployments, initialCICDIntegrations, initialBuildMetrics } from "../mock-data/builds";
import { initialAuditLogs, initialModuleHealth } from "../mock-data/audit-logs";
import { initialLibraryBooks, initialBookIssues, initialLibraryFines } from "../mock-data/library";
import { initialStaffMembers, initialLeaveRecords } from "../mock-data/staff";

const BRANCHES_STORAGE_KEY = "school_erp_branches_v1";
const NOTICES_STORAGE_KEY = "school_erp_notices_v1";
const ACTIVITIES_STORAGE_KEY = "school_erp_activities_v1";
const SESSION_STORAGE_KEY = "school_erp_session_v1";
const BIOMETRIC_STORAGE_KEY = "school_erp_biometric_v1";
const TEACHERS_STORAGE_KEY = "school_erp_teachers_v1";
const CLASSES_STORAGE_KEY = "school_erp_classes_v1";
const STUDENTS_STORAGE_KEY = "school_erp_students_v1";
const ADMISSIONS_STORAGE_KEY = "school_erp_admissions_v1";
const TIMETABLE_STORAGE_KEY = "school_erp_timetable_v1";
const HOMEWORK_STORAGE_KEY = "school_erp_homework_v1";
const HOMEWORK_SUBMISSIONS_STORAGE_KEY = "school_erp_homework_submissions_v1";
const EXAMS_STORAGE_KEY = "school_erp_exams_v1";
const EXAM_TYPES_STORAGE_KEY = "school_erp_exam_types_v1";
const EXAM_SCHEDULES_STORAGE_KEY = "school_erp_exam_schedules_v1";
const MARK_ENTRIES_STORAGE_KEY = "school_erp_mark_entries_v1";
const GRADE_SCALE_STORAGE_KEY = "school_erp_grade_scale_v1";
const RESULTS_STORAGE_KEY = "school_erp_results_v1";
const VEHICLES_STORAGE_KEY = "school_erp_vehicles_v1";
const TRANSPORT_ROUTES_STORAGE_KEY = "school_erp_transport_routes_v1";
const DRIVERS_STORAGE_KEY = "school_erp_drivers_v1";
const BUS_HELPERS_STORAGE_KEY = "school_erp_bus_helpers_v1";
const STUDENT_TRANSPORT_STORAGE_KEY = "school_erp_student_transport_v1";
const VEHICLE_MAINTENANCE_STORAGE_KEY = "school_erp_vehicle_maintenance_v1";
const ANNOUNCEMENTS_STORAGE_KEY = "school_erp_announcements_v1";
const MESSAGES_STORAGE_KEY = "school_erp_messages_v1";
const MESSAGE_THREADS_STORAGE_KEY = "school_erp_message_threads_v1";
const NOTIFICATIONS_STORAGE_KEY = "school_erp_notifications_v1";
const NOTIFICATION_PREFS_STORAGE_KEY = "school_erp_notification_prefs_v1";
const EVENTS_STORAGE_KEY = "school_erp_events_v1";
const INVENTORY_CATEGORIES_STORAGE_KEY = "school_erp_inventory_categories_v1";
const INVENTORY_ITEMS_STORAGE_KEY = "school_erp_inventory_items_v1";
const INVENTORY_SUPPLIERS_STORAGE_KEY = "school_erp_inventory_suppliers_v1";
const PURCHASE_ENTRIES_STORAGE_KEY = "school_erp_purchase_entries_v1";
const INVENTORY_TRANSACTIONS_STORAGE_KEY = "school_erp_inventory_transactions_v1";
const STOCK_ALERTS_STORAGE_KEY = "school_erp_stock_alerts_v1";
const STORE_LOCATIONS_STORAGE_KEY = "school_erp_store_locations_v1";
const STORE_SALES_STORAGE_KEY = "school_erp_store_sales_v1";
const STOCK_TRANSFERS_STORAGE_KEY = "school_erp_stock_transfers_v1";
const STOCK_ADJUSTMENTS_STORAGE_KEY = "school_erp_stock_adjustments_v1";
const RETURN_EXCHANGE_STORAGE_KEY = "school_erp_return_exchange_v1";
const PURCHASE_REQUESTS_STORAGE_KEY = "school_erp_purchase_requests_v1";
const ASSETS_STORAGE_KEY = "school_erp_assets_v1";
const ASSET_MAINT_STORAGE_KEY = "school_erp_asset_maint_v1";
const EXPENSE_CATEGORIES_STORAGE_KEY = "school_erp_expense_categories_v1";
const EXPENSE_ENTRIES_STORAGE_KEY = "school_erp_expense_entries_v1";
const SALARY_STRUCTURES_STORAGE_KEY = "school_erp_salary_structures_v1";
const PAYROLL_RECORDS_STORAGE_KEY = "school_erp_payroll_records_v1";
const DOCUMENTS_STORAGE_KEY = "school_erp_documents_v1";
const TEST_CASES_STORAGE_KEY = "school_erp_test_cases_v1";
const TEST_SUITES_STORAGE_KEY = "school_erp_test_suites_v1";
const TEST_PLANS_STORAGE_KEY = "school_erp_test_plans_v1";
const TEST_RUNS_STORAGE_KEY = "school_erp_test_runs_v1";
const BUGS_STORAGE_KEY = "school_erp_bugs_v1";
const BUG_ACTIVITY_STORAGE_KEY = "school_erp_bug_activity_v1";
const BUILDS_STORAGE_KEY = "school_erp_builds_v1";
const DEPLOYMENTS_STORAGE_KEY = "school_erp_deployments_v1";
const AUDIT_LOGS_STORAGE_KEY = "school_erp_audit_logs_v1";
const LIBRARY_BOOKS_STORAGE_KEY = "school_erp_library_books_v1";
const LIBRARY_ISSUES_STORAGE_KEY = "school_erp_library_issues_v1";
const LIBRARY_FINES_STORAGE_KEY = "school_erp_library_fines_v1";
const STAFF_MEMBERS_STORAGE_KEY = "school_erp_staff_members_v1";
const LEAVE_RECORDS_STORAGE_KEY = "school_erp_leave_records_v1";
const TRANSPORT_SLABS_STORAGE_KEY = "school_erp_transport_slabs_v1";

class MockDatabaseService {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // ==================== BRANCHES ====================
  public getBranches(): Branch[] {
    if (!this.isBrowser()) return initialBranches;
    try {
      const stored = localStorage.getItem(BRANCHES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(initialBranches));
      return initialBranches;
    } catch {
      return initialBranches;
    }
  }

  public getBranchById(id: string): Branch | undefined {
    return this.getBranches().find((b) => b.id === id);
  }

  public saveBranch(branchData: Omit<Branch, "id" | "createdAt" | "updatedAt"> & { id?: string }): Branch {
    const branches = this.getBranches();
    const now = new Date().toISOString();

    if (branchData.id) {
      const index = branches.findIndex((b) => b.id === branchData.id);
      if (index !== -1) {
        const updatedBranch: Branch = {
          ...branches[index],
          ...branchData,
          id: branchData.id,
          updatedAt: now,
        };
        branches[index] = updatedBranch;
        if (this.isBrowser()) {
          localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
        }
        this.addActivity({
          user: { name: "Current Admin", avatar: "", role: "ADMIN" },
          action: "UPDATE",
          module: "Branches",
          entityName: updatedBranch.name,
          entityId: updatedBranch.id,
          branchId: updatedBranch.id,
          branchName: updatedBranch.name,
          details: `Updated branch settings, principal and capacity info.`,
          status: "SUCCESS",
        });
        return updatedBranch;
      }
    }

    const newId = `br-${Date.now().toString(36)}`;
    const newBranch: Branch = {
      ...branchData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    branches.unshift(newBranch);
    if (this.isBrowser()) {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
    }
    this.addActivity({
      user: { name: "Current Admin", avatar: "", role: "ADMIN" },
      action: "CREATE",
      module: "Branches",
      entityName: newBranch.name,
      entityId: newBranch.id,
      branchId: newBranch.id,
      branchName: newBranch.name,
      details: `Registered new campus branch: ${newBranch.name} (${newBranch.code}).`,
      status: "SUCCESS",
    });
    return newBranch;
  }

  public deleteBranch(id: string): boolean {
    const branches = this.getBranches();
    const target = branches.find((b) => b.id === id);
    if (!target) return false;
    const filtered = branches.filter((b) => b.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(filtered));
    }
    this.addActivity({
      user: { name: "Current Admin", avatar: "", role: "ADMIN" },
      action: "DELETE",
      module: "Branches",
      entityName: target.name,
      entityId: target.id,
      branchId: target.id,
      branchName: target.name,
      details: `Deactivated and archived branch record ${target.name}.`,
      status: "WARNING",
    });
    return true;
  }

  // ==================== TEACHERS ====================
  public getTeachers(branchId?: string): Teacher[] {
    let teachers = initialTeachers;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TEACHERS_STORAGE_KEY);
        if (stored) teachers = JSON.parse(stored);
        else localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(initialTeachers));
      } catch {
        teachers = initialTeachers;
      }
    }
    if (!branchId || branchId === "all") return teachers;
    return teachers.filter((t) => t.branchId === branchId);
  }

  public getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find((t) => t.id === id);
  }

  public saveTeacher(teacherData: Omit<Teacher, "id" | "createdAt" | "updatedAt"> & { id?: string }): Teacher {
    const teachers = this.getTeachers();
    const now = new Date().toISOString();

    if (teacherData.id) {
      const index = teachers.findIndex((t) => t.id === teacherData.id);
      if (index !== -1) {
        const updated: Teacher = {
          ...teachers[index],
          ...teacherData,
          id: teacherData.id,
          updatedAt: now,
        };
        teachers[index] = updated;
        if (this.isBrowser()) {
          localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
        }
        this.addActivity({
          user: { name: "Current Admin", avatar: "", role: "ADMIN" },
          action: "UPDATE",
          module: "Teachers",
          entityName: updated.fullName,
          entityId: updated.id,
          branchId: updated.branchId,
          branchName: updated.branchName,
          details: `Updated faculty profile and assigned classes for ${updated.fullName}.`,
          status: "SUCCESS",
        });
        return updated;
      }
    }

    const newId = `tch-${Date.now().toString(36)}`;
    const newTeacher: Teacher = {
      ...teacherData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    teachers.unshift(newTeacher);
    if (this.isBrowser()) {
      localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
    }
    this.addActivity({
      user: { name: "Current Admin", avatar: "", role: "ADMIN" },
      action: "CREATE",
      module: "Teachers",
      entityName: newTeacher.fullName,
      entityId: newTeacher.id,
      branchId: newTeacher.branchId,
      branchName: newTeacher.branchName,
      details: `Appointed new faculty instructor: ${newTeacher.fullName} (${newTeacher.department}).`,
      status: "SUCCESS",
    });
    return newTeacher;
  }

  // ==================== CLASSES ====================
  public getClasses(branchId?: string): ClassRoom[] {
    let classes = initialClasses;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(CLASSES_STORAGE_KEY);
        if (stored) classes = JSON.parse(stored);
        else localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(initialClasses));
      } catch {
        classes = initialClasses;
      }
    }
    if (!branchId || branchId === "all") return classes;
    return classes.filter((c) => c.branchId === branchId);
  }

  public getClassById(id: string): ClassRoom | undefined {
    return this.getClasses().find((c) => c.id === id);
  }

  public saveClass(classData: Omit<ClassRoom, "id"> & { id?: string }): ClassRoom {
    const classes = this.getClasses();
    if (classData.id) {
      const index = classes.findIndex((c) => c.id === classData.id);
      if (index !== -1) {
        const updated = { ...classes[index], ...classData, id: classData.id };
        classes[index] = updated;
        if (this.isBrowser()) {
          localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
        }
        return updated;
      }
    }
    const newId = `cls-${Date.now().toString(36)}`;
    const newClass: ClassRoom = { ...classData, id: newId };
    classes.push(newClass);
    if (this.isBrowser()) {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    }
    return newClass;
  }

  public deleteClass(id: string): boolean {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    classes.splice(idx, 1);
    if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return true;
  }

  // ── Subjects & Topics nested inside ClassRoom ──
  public getAllSubjects(branchId?: string): (Subject & { classId: string; className: string; branchId: string; branchName: string })[] {
    const classes = this.getClasses(branchId);
    const out: any[] = [];
    for (const c of classes) {
      for (const s of c.subjects) out.push({ ...s, classId: c.id, className: c.name, branchId: c.branchId, branchName: c.branchName });
    }
    return out;
  }

  public saveSubject(classId: string, subject: Omit<Subject, "id"> & { id?: string }): Subject | null {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === classId);
    if (idx === -1) return null;
    const cls = classes[idx];
    if (subject.id) {
      const sIdx = cls.subjects.findIndex((s) => s.id === subject.id);
      if (sIdx !== -1) {
        const updated: Subject = { ...cls.subjects[sIdx], ...subject, id: subject.id };
        cls.subjects[sIdx] = updated;
        if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
        return updated;
      }
    }
    const newSub: Subject = { ...subject, id: subject.id || `sub-${Date.now().toString(36)}`, topics: subject.topics || [] } as Subject;
    cls.subjects.push(newSub);
    if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return newSub;
  }

  public deleteSubject(classId: string, subjectId: string): boolean {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === classId);
    if (idx === -1) return false;
    const before = classes[idx].subjects.length;
    classes[idx].subjects = classes[idx].subjects.filter((s) => s.id !== subjectId);
    if (classes[idx].subjects.length === before) return false;
    if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return true;
  }

  public saveTopic(classId: string, subjectId: string, topic: Omit<SubjectTopic, "id" | "createdAt" | "updatedAt"> & { id?: string }): SubjectTopic | null {
    const classes = this.getClasses();
    const cIdx = classes.findIndex((c) => c.id === classId);
    if (cIdx === -1) return null;
    const sIdx = classes[cIdx].subjects.findIndex((s) => s.id === subjectId);
    if (sIdx === -1) return null;
    const subj = classes[cIdx].subjects[sIdx];
    if (!subj.topics) subj.topics = [];
    const now = new Date().toISOString();
    if (topic.id) {
      const tIdx = subj.topics.findIndex((t) => t.id === topic.id);
      if (tIdx !== -1) {
        const updated: SubjectTopic = { ...subj.topics[tIdx], ...topic, id: topic.id, updatedAt: now };
        subj.topics[tIdx] = updated;
        if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
        return updated;
      }
    }
    const newTopic: SubjectTopic = { id: `top-${Date.now().toString(36)}`, title: topic.title, description: topic.description, order: topic.order ?? subj.topics.length + 1, status: topic.status || "PLANNED", createdAt: now, updatedAt: now };
    subj.topics.push(newTopic);
    if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return newTopic;
  }

  public deleteTopic(classId: string, subjectId: string, topicId: string): boolean {
    const classes = this.getClasses();
    const cIdx = classes.findIndex((c) => c.id === classId);
    if (cIdx === -1) return false;
    const sIdx = classes[cIdx].subjects.findIndex((s) => s.id === subjectId);
    if (sIdx === -1) return false;
    const subj = classes[cIdx].subjects[sIdx];
    if (!subj.topics) return false;
    const before = subj.topics.length;
    subj.topics = subj.topics.filter((t) => t.id !== topicId);
    if (subj.topics.length === before) return false;
    if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return true;
  }

  public updateSection(classId: string, section: Section): boolean {
    const classes = this.getClasses();
    const cIdx = classes.findIndex((c) => c.id === classId);
    if (cIdx === -1) return false;
    const sIdx = classes[cIdx].sections.findIndex((s) => s.id === section.id);
    if (sIdx !== -1) {
      classes[cIdx].sections[sIdx] = section;
    } else {
      classes[cIdx].sections.push(section);
    }
    if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return true;
  }

  public deleteSection(classId: string, sectionId: string): boolean {
    const classes = this.getClasses();
    const cIdx = classes.findIndex((c) => c.id === classId);
    if (cIdx === -1) return false;
    const before = classes[cIdx].sections.length;
    classes[cIdx].sections = classes[cIdx].sections.filter((s) => s.id !== sectionId);
    if (classes[cIdx].sections.length === before) return false;
    if (this.isBrowser()) localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
    return true;
  }

  // ==================== STUDENTS ====================
  public getStudents(branchId?: string): Student[] {
    let students = initialStudents;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STUDENTS_STORAGE_KEY);
        if (stored) students = JSON.parse(stored);
        else localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(initialStudents));
      } catch {
        students = initialStudents;
      }
    }
    if (!branchId || branchId === "all") return students;
    return students.filter((s) => s.branchId === branchId);
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find((s) => s.id === id);
  }

  public saveStudent(studentData: Omit<Student, "id" | "createdAt" | "updatedAt"> & { id?: string }): Student {
    const students = this.getStudents();
    const now = new Date().toISOString();

    if (studentData.id) {
      const index = students.findIndex((s) => s.id === studentData.id);
      if (index !== -1) {
        const updated: Student = {
          ...students[index],
          ...studentData,
          id: studentData.id,
          updatedAt: now,
        };
        students[index] = updated;
        if (this.isBrowser()) {
          localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
        }
        this.addActivity({
          user: { name: "Current Admin", avatar: "", role: "ADMIN" },
          action: "UPDATE",
          module: "Students",
          entityName: updated.fullName,
          entityId: updated.id,
          branchId: updated.branchId,
          branchName: updated.branchName,
          details: `Updated student records and class assignment for ${updated.fullName}.`,
          status: "SUCCESS",
        });
        return updated;
      }
    }

    const newId = `stu-${Date.now().toString(36)}`;
    const newStudent: Student = {
      ...studentData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    students.unshift(newStudent);
    if (this.isBrowser()) {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    }
    this.addActivity({
      user: { name: "Admissions Officer", avatar: "", role: "ADMIN" },
      action: "CREATE",
      module: "Students",
      entityName: newStudent.fullName,
      entityId: newStudent.id,
      branchId: newStudent.branchId,
      branchName: newStudent.branchName,
      details: `Enrolled new student: ${newStudent.fullName} (${newStudent.rollNumber}) in ${newStudent.className}.`,
      status: "SUCCESS",
    });
    return newStudent;
  }

  // ==================== ADMISSIONS ====================
  public getAdmissions(branchId?: string): AdmissionApplication[] {
    let admissions = initialAdmissions;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(ADMISSIONS_STORAGE_KEY);
        if (stored) admissions = JSON.parse(stored);
        else localStorage.setItem(ADMISSIONS_STORAGE_KEY, JSON.stringify(initialAdmissions));
      } catch {
        admissions = initialAdmissions;
      }
    }
    if (!branchId || branchId === "all") return admissions;
    return admissions.filter((a) => a.branchId === branchId);
  }

  public getAdmissionById(id: string): AdmissionApplication | undefined {
    return this.getAdmissions().find((a) => a.id === id);
  }

  public saveAdmission(admissionData: Omit<AdmissionApplication, "id" | "createdAt" | "updatedAt"> & { id?: string }): AdmissionApplication {
    const admissions = this.getAdmissions();
    const now = new Date().toISOString();

    if (admissionData.id) {
      const index = admissions.findIndex((a) => a.id === admissionData.id);
      if (index !== -1) {
        const updated: AdmissionApplication = {
          ...admissions[index],
          ...admissionData,
          id: admissionData.id,
          updatedAt: now,
        };
        admissions[index] = updated;
        if (this.isBrowser()) {
          localStorage.setItem(ADMISSIONS_STORAGE_KEY, JSON.stringify(admissions));
        }
        this.addActivity({
          user: { name: "Admissions Head", avatar: "", role: "ADMIN" },
          action: "UPDATE",
          module: "Admissions",
          entityName: `${updated.applicantFullName} (${updated.applicationNumber})`,
          entityId: updated.id,
          branchId: updated.branchId,
          branchName: updated.branchName,
          details: `Updated application status to ${updated.status}.`,
          status: "SUCCESS",
        });
        return updated;
      }
    }

    const newId = `adm-${Date.now().toString(36)}`;
    const count = admissions.length + 101;
    const newAdmission: AdmissionApplication = {
      ...admissionData,
      id: newId,
      applicationNumber: admissionData.applicationNumber || `ADM-2026-${count}`,
      createdAt: now,
      updatedAt: now,
    };
    admissions.unshift(newAdmission);
    if (this.isBrowser()) {
      localStorage.setItem(ADMISSIONS_STORAGE_KEY, JSON.stringify(admissions));
    }
    this.addActivity({
      user: { name: "Applicant Portal", avatar: "", role: "PARENT" },
      action: "CREATE",
      module: "Admissions",
      entityName: `${newAdmission.applicantFullName} (${newAdmission.applicationNumber})`,
      entityId: newAdmission.id,
      branchId: newAdmission.branchId,
      branchName: newAdmission.branchName,
      details: `Received new admission application for ${newAdmission.gradeApplied}.`,
      status: "SUCCESS",
    });
    return newAdmission;
  }

  public updateAdmissionStatus(id: string, status: AdmissionStatus, feedback?: string): AdmissionApplication | null {
    const application = this.getAdmissionById(id);
    if (!application) return null;
    return this.saveAdmission({
      ...application,
      status,
      interviewFeedback: feedback !== undefined ? feedback : application.interviewFeedback,
    });
  }

  public enrollApplicantAsStudent(applicationId: string, classId: string, sectionId: string): Student | null {
    const app = this.getAdmissionById(applicationId);
    if (!app) return null;

    const classes = this.getClasses();
    const targetClass = classes.find((c) => c.id === classId) || classes[0];
    const targetSection = targetClass.sections.find((s) => s.id === sectionId) || targetClass.sections[0];

    const studentCount = this.getStudents().length + 1040;
    const newStudent = this.saveStudent({
      rollNumber: `STU-${studentCount}`,
      admissionNumber: app.applicationNumber,
      firstName: app.applicantFirstName,
      lastName: app.applicantLastName,
      fullName: app.applicantFullName,
      avatar: app.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      dateOfBirth: app.dateOfBirth,
      gender: app.gender,
      bloodGroup: "O+",
      branchId: app.branchId,
      branchName: app.branchName,
      classId: targetClass.id,
      className: targetClass.name,
      sectionId: targetSection.id,
      sectionName: targetSection.name,
      admissionDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      guardian: {
        name: app.parentName,
        relation: "Father",
        email: app.parentEmail,
        phone: app.parentPhone,
        occupation: "Professional",
        address: app.address,
        emergencyContact: app.parentPhone,
      },
      attendanceSummary: {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendanceRate: 100,
      },
      feeSummary: {
        totalAssigned: 12000,
        totalPaid: 0,
        totalPending: 12000,
        status: "PENDING",
      },
      academicHistory: [],
      documents: app.documents.map((d) => ({
        id: d.id,
        name: d.name,
        type: "PDF",
        uploadedAt: new Date().toISOString().split("T")[0],
        verified: d.verified,
        size: "1.5 MB",
      })),
      address: app.address,
      city: app.city,
      state: app.state,
    });

    // Mark application as Approved and linked
    this.saveAdmission({
      ...app,
      status: "APPROVED",
      enrolledStudentId: newStudent.id,
    });

    return newStudent;
  }

  // ==================== FEES ====================
  public getFeeHeads(): FeeHead[] { return initialFeeHeads; }
  public getFeeStructures(branchId?: string): FeeStructure[] {
    let structures = initialFeeStructures;
    if (typeof window !== "undefined") {
      try {
        const s = localStorage.getItem("school_erp_fee_structures_v1");
        if (s) structures = JSON.parse(s);
        else localStorage.setItem("school_erp_fee_structures_v1", JSON.stringify(initialFeeStructures));
      } catch {}
    }
    if (branchId && branchId !== "all") structures = structures.filter((s) => s.branchId === branchId);
    return structures;
  }
  public saveFeeStructure(data: FeeStructure): FeeStructure {
    const list = this.getFeeStructures();
    const idx = list.findIndex((s) => s.id === data.id);
    const rec = { ...data, totalAmount: data.items.reduce((a, b) => a + b.amount, 0) } as FeeStructure;
    if (idx >= 0) list[idx] = rec;
    else list.unshift(rec);
    const gIdx = initialFeeStructures.findIndex((s) => s.id === data.id);
    if (gIdx >= 0) initialFeeStructures[gIdx] = rec;
    else initialFeeStructures.unshift(rec);
    if (typeof window !== "undefined") localStorage.setItem("school_erp_fee_structures_v1", JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("fees:updated"));
    return rec;
  }
  private recomputeAssignment(a: FeeAssignment): FeeAssignment {
    const due = Math.max(0, a.totalAssigned - (a.discount ?? 0) - a.totalPaid + (a.lateFee ?? 0));
    a.totalPending = due;
    // overdue detection: >15 days past due
    const overdue = (() => {
      if (!a.dueDate) return false;
      const diff = Math.floor((Date.now() - new Date(a.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return diff > 15 && due > 0;
    })();
    if (overdue) {
      if (a.lateFee === 0) {
        // auto apply 5% late fee if not set
        a.lateFee = Math.round(((a.totalAssigned - (a.discount ?? 0) - a.totalPaid) * 0.05));
        a.totalPending = Math.max(0, a.totalAssigned - (a.discount ?? 0) - a.totalPaid + a.lateFee);
      }
      a.totalOverdue = a.totalPending;
      a.status = "OVERDUE";
    } else if (due <= 0) {
      a.status = "PAID";
      a.totalOverdue = 0;
    } else if (a.totalPaid > 0) {
      a.status = "PARTIAL";
      a.totalOverdue = 0;
    } else {
      a.status = "PENDING";
      a.totalOverdue = 0;
    }
    return a;
  }

  public getFeeAssignments(branchId?: string): FeeAssignment[] {
    let assignments = initialFeeAssignments.map((a) => this.recomputeAssignment({ ...a, feeHeads: a.feeHeads ? [...a.feeHeads] : undefined }));
    // also recompute original references to keep in sync
    initialFeeAssignments.forEach((a) => this.recomputeAssignment(a));
    if (branchId && branchId !== "all") assignments = assignments.filter((a) => a.branchId === branchId);
    return assignments;
  }
  public getFeeAssignmentByStudentId(studentId: string): FeeAssignment | undefined {
    return this.getFeeAssignments().find((a) => a.studentId === studentId);
  }
  public getInvoices(branchId?: string): Invoice[] {
    let invoices = initialInvoices;
    if (branchId && branchId !== "all") invoices = invoices.filter((i) => i.branchId === branchId);
    return invoices;
  }
  public getPayments(branchId?: string): PaymentRecord[] {
    let payments = initialPayments;
    if (branchId && branchId !== "all") payments = payments.filter((p) => p.branchId === branchId);
    return payments;
  }
  public getPaymentsByStudentId(studentId: string): PaymentRecord[] {
    return initialPayments.filter((p) => p.studentId === studentId);
  }
  private nextReceiptNumber(): string {
    const year = new Date().getFullYear();
    const key = "school_erp_receipt_counter_v1";
    let counter = 1;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : {};
        counter = (parsed[year] ?? initialPayments.filter((p) => p.receiptNumber.startsWith(`RCP-${year}-`)).length) + 1;
        parsed[year] = counter;
        localStorage.setItem(key, JSON.stringify(parsed));
      } catch {
        counter = initialPayments.length + 1;
      }
    } else {
      counter = initialPayments.length + 1;
    }
    return `RCP-${year}-${String(counter).padStart(5, "0")}`;
  }
  public recordPayment(invoiceId: string, amount: number, method: PaymentRecord["method"], feeHeadIds?: string[]): PaymentRecord | null {
    const invoice = initialInvoices.find((i) => i.id === invoiceId);
    if (!invoice) return null;
    const nowDate = new Date().toISOString().split("T")[0];
    const feeHeadNames = feeHeadIds
      ? feeHeadIds.map((id) => initialFeeHeads.find((h) => h.id === id)?.name ?? id)
      : undefined;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now().toString(36)}`,
      invoiceId, invoiceNumber: invoice.invoiceNumber, studentId: invoice.studentId, studentName: invoice.studentName,
      amount, method, transactionId: `TXN-${Math.random().toString(36).slice(2,8).toUpperCase()}`, receiptNumber: this.nextReceiptNumber(),
      date: nowDate, branchId: invoice.branchId, branchName: invoice.branchName,
      feeHeadIds, feeHeadNames,
    };
    initialPayments.unshift(newPayment);
    invoice.paidAmount += amount;
    invoice.balanceAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    if (invoice.balanceAmount === 0) invoice.status = "PAID";
    else if (invoice.paidAmount > 0) {
      // check overdue
      const diff = Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      invoice.status = diff > 15 ? "OVERDUE" : "PARTIAL";
    }
    // update assignments with discount-aware formula Due = Assigned - Discount - Paid + LateFee
    const assignment = initialFeeAssignments.find((a) => a.studentId === invoice.studentId);
    if (assignment) {
      assignment.totalPaid += amount;
      assignment.lastPaymentDate = nowDate;
      // update feeHeads breakdown if present
      if (assignment.feeHeads && feeHeadIds) {
        for (const fh of assignment.feeHeads) {
          if (feeHeadIds.includes(fh.feeHeadId)) {
            const perHead = Math.round(amount / feeHeadIds.length);
            fh.paidAmount += perHead;
            fh.dueAmount = Math.max(0, fh.amount - fh.discount - fh.paidAmount);
          }
        }
      } else if (assignment.feeHeads) {
        // distribute proportionally to first pending head
        const pendingHeads = assignment.feeHeads.filter((h) => h.dueAmount > 0);
        let remain = amount;
        for (const h of pendingHeads) {
          if (remain <= 0) break;
          const pay = Math.min(h.dueAmount, remain);
          h.paidAmount += pay;
          h.dueAmount = Math.max(0, h.amount - h.discount - h.paidAmount);
          remain -= pay;
        }
      }
      this.recomputeAssignment(assignment);
    }
    this.addActivity({ user: { name: "Accounts Officer", avatar: "", role: "ACCOUNTANT" }, action: "PAYMENT", module: "Fees", entityName: invoice.invoiceNumber, entityId: invoice.id, branchId: invoice.branchId, branchName: invoice.branchName, details: `Recorded ${method} payment of ₹${amount} for ${invoice.studentName}. Receipt ${newPayment.receiptNumber}`, status: "SUCCESS" });
    return newPayment;
  }
  public recordDirectPayment(studentId: string, amount: number, method: PaymentRecord["method"], feeHeadIds?: string[]): PaymentRecord | null {
    const assignment = initialFeeAssignments.find((a) => a.studentId === studentId);
    if (!assignment) return null;
    // find first pending invoice for student or create ad-hoc
    const pendingInv = initialInvoices.find((i) => i.studentId === studentId && i.balanceAmount > 0);
    if (pendingInv) {
      return this.recordPayment(pendingInv.id, Math.min(amount, pendingInv.balanceAmount), method, feeHeadIds);
    }
    // no invoice: create payment against assignment directly
    const nowDate = new Date().toISOString().split("T")[0];
    const feeHeadNames = feeHeadIds ? feeHeadIds.map((id) => initialFeeHeads.find((h) => h.id === id)?.name ?? id) : undefined;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now().toString(36)}`,
      invoiceId: `inv-ad-hoc-${studentId}`, invoiceNumber: `INV-ADHOC-${studentId.slice(-4).toUpperCase()}`,
      studentId, studentName: assignment.studentName,
      amount, method, transactionId: `TXN-${Math.random().toString(36).slice(2,8).toUpperCase()}`, receiptNumber: this.nextReceiptNumber(),
      date: nowDate, branchId: assignment.branchId, branchName: assignment.branchName,
      feeHeadIds, feeHeadNames,
    };
    initialPayments.unshift(newPayment);
    assignment.totalPaid += amount;
    assignment.lastPaymentDate = nowDate;
    this.recomputeAssignment(assignment);
    this.addActivity({ user: { name: "Accounts Officer", avatar: "", role: "ACCOUNTANT" }, action: "PAYMENT", module: "Fees", entityName: assignment.studentName, entityId: assignment.id, branchId: assignment.branchId, branchName: assignment.branchName, details: `Direct payment ₹${amount} (${method}) for ${assignment.studentName}. Receipt ${newPayment.receiptNumber}`, status: "SUCCESS" });
    return newPayment;
  }
  public getTodayCollection(branchId?: string): number {
    const today = new Date().toISOString().split("T")[0];
    return this.getPayments(branchId).filter((p) => p.date === today).reduce((s, p) => s + p.amount, 0);
  }
  public getDefaulters(branchId?: string): FeeAssignment[] {
    return this.getFeeAssignments(branchId).filter((a) => a.status === "OVERDUE" || (a.totalPending > 0 && a.status !== "PAID"));
  }

  // ==================== ATTENDANCE ====================
  public getAttendanceRecords(branchId?: string, category?: AttendanceCategory, date?: string): AttendanceRecord[] {
    let records = initialAttendanceRecords;
    if (branchId && branchId !== "all") records = records.filter((r) => r.branchId === branchId);
    if (category) records = records.filter((r) => r.category === category);
    if (date) records = records.filter((r) => r.date === date);
    return records;
  }
  public getAttendanceDaySummaries(branchId?: string): AttendanceDaySummary[] {
    return computeDaySummaries(this.getAttendanceRecords(branchId));
  }
  public getAttendanceReportEntries(branchId?: string, category?: AttendanceCategory): AttendanceReportEntry[] {
    let records = this.getAttendanceRecords(branchId);
    if (category) records = records.filter((r) => r.category === category);
    return computeReportEntries(records);
  }
  public markAttendance(record: Omit<AttendanceRecord, "id" | "markedAt">): AttendanceRecord {
    const newRec: AttendanceRecord = { ...record, id: `att-${Date.now().toString(36)}`, markedAt: new Date().toISOString() };
    initialAttendanceRecords.unshift(newRec);
    return newRec;
  }

  // ==================== LIBRARY ====================
  public getLibraryBooks(branchId?: string): LibraryBook[] {
    let books = initialLibraryBooks;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(LIBRARY_BOOKS_STORAGE_KEY);
        if (stored) books = JSON.parse(stored);
        else localStorage.setItem(LIBRARY_BOOKS_STORAGE_KEY, JSON.stringify(initialLibraryBooks));
      } catch { books = initialLibraryBooks; }
    }
    if (branchId && branchId !== "all") books = books.filter((b) => b.branchId === branchId);
    return books;
  }
  public getLibraryBookById(id: string): LibraryBook | undefined { return this.getLibraryBooks().find((b) => b.id === id); }
  public getBookIssues(branchId?: string): BookIssue[] {
    let issues = initialBookIssues;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(LIBRARY_ISSUES_STORAGE_KEY);
        if (stored) issues = JSON.parse(stored);
        else localStorage.setItem(LIBRARY_ISSUES_STORAGE_KEY, JSON.stringify(initialBookIssues));
      } catch { issues = initialBookIssues; }
    }
    if (branchId && branchId !== "all") issues = issues.filter((i) => i.branchId === branchId);
    return issues;
  }
  public getLibraryFines(branchId?: string): LibraryFine[] {
    let fines = initialLibraryFines;
    if (branchId && branchId !== "all") fines = fines.filter((f) => {
      const issue = this.getBookIssues().find((iss) => iss.id === f.issueId);
      return issue?.branchId === branchId;
    });
    return fines;
  }
  public issueBook(data: Omit<BookIssue, "id" | "createdAt" | "updatedAt">): BookIssue {
    const newIssue: BookIssue = { ...data, id: `iss-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const issues = this.getBookIssues();
    issues.unshift(newIssue);
    if (this.isBrowser()) localStorage.setItem(LIBRARY_ISSUES_STORAGE_KEY, JSON.stringify(issues));
    // decrement available copies
    const book = initialLibraryBooks.find((b) => b.id === data.bookId);
    if (book) { book.availableCopies = Math.max(0, book.availableCopies - 1); book.issuedCopies += 1; }
    return newIssue;
  }
  public returnBook(issueId: string): BookIssue | null {
    const issue = this.getBookIssues().find((i) => i.id === issueId);
    if (!issue) return null;
    issue.status = "RETURNED";
    issue.returnedDate = new Date().toISOString().split("T")[0];
    issue.updatedAt = new Date().toISOString();
    const issues = this.getBookIssues();
    if (this.isBrowser()) localStorage.setItem(LIBRARY_ISSUES_STORAGE_KEY, JSON.stringify(issues));
    const book = initialLibraryBooks.find((b) => b.id === issue.bookId);
    if (book) { book.availableCopies += 1; book.issuedCopies = Math.max(0, book.issuedCopies - 1); }
    return issue;
  }

  public saveLibraryBook(data: Omit<LibraryBook, "id" | "createdAt" | "updatedAt"> & { id?: string }): LibraryBook {
    const books = this.getLibraryBooks();
    const now = new Date().toISOString();
    if (data.id) {
      const idx = books.findIndex((b) => b.id === data.id);
      if (idx !== -1) {
        const updated: LibraryBook = { ...books[idx], ...data, id: data.id, updatedAt: now };
        books[idx] = updated;
        // update initial array
        const gIdx = initialLibraryBooks.findIndex((b) => b.id === data.id);
        if (gIdx !== -1) initialLibraryBooks[gIdx] = updated;
        if (this.isBrowser()) localStorage.setItem(LIBRARY_BOOKS_STORAGE_KEY, JSON.stringify(books));
        return updated;
      }
    }
    const newBook: LibraryBook = { ...data, id: data.id || `lib-${Date.now().toString(36)}`, createdAt: now, updatedAt: now };
    books.unshift(newBook);
    initialLibraryBooks.unshift(newBook);
    if (this.isBrowser()) localStorage.setItem(LIBRARY_BOOKS_STORAGE_KEY, JSON.stringify(books));
    return newBook;
  }

  public deleteLibraryBook(id: string): boolean {
    const books = this.getLibraryBooks();
    const idx = books.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    books.splice(idx, 1);
    const gIdx = initialLibraryBooks.findIndex((b) => b.id === id);
    if (gIdx !== -1) initialLibraryBooks.splice(gIdx, 1);
    if (this.isBrowser()) localStorage.setItem(LIBRARY_BOOKS_STORAGE_KEY, JSON.stringify(books));
    return true;
  }

  // ==================== STAFF / HR ====================
  public getStaffMembers(branchId?: string): StaffMember[] {
    let staff = initialStaffMembers;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STAFF_MEMBERS_STORAGE_KEY);
        if (stored) staff = JSON.parse(stored);
        else localStorage.setItem(STAFF_MEMBERS_STORAGE_KEY, JSON.stringify(initialStaffMembers));
      } catch { staff = initialStaffMembers; }
    }
    if (branchId && branchId !== "all") staff = staff.filter((s) => s.branchId === branchId);
    return staff;
  }
  public getStaffById(id: string): StaffMember | undefined { return this.getStaffMembers().find((s) => s.id === id); }
  public saveStaff(data: Omit<StaffMember, "id" | "createdAt" | "updatedAt"> & { id?: string }): StaffMember {
    const staff = this.getStaffMembers();
    const now = new Date().toISOString();
    if (data.id) {
      const idx = staff.findIndex((s) => s.id === data.id);
      if (idx !== -1) { const updated: StaffMember = { ...staff[idx], ...data, id: data.id, updatedAt: now }; staff[idx]=updated; if (this.isBrowser()) localStorage.setItem(STAFF_MEMBERS_STORAGE_KEY, JSON.stringify(staff)); return updated; }
    }
    const newStaff: StaffMember = { ...data, id: `stf-${Date.now().toString(36)}`, createdAt: now, updatedAt: now };
    staff.unshift(newStaff);
    if (this.isBrowser()) localStorage.setItem(STAFF_MEMBERS_STORAGE_KEY, JSON.stringify(staff));
    return newStaff;
  }
  public getLeaveRecords(branchId?: string): LeaveRecord[] {
    let leaves = initialLeaveRecords;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(LEAVE_RECORDS_STORAGE_KEY);
        if (stored) leaves = JSON.parse(stored);
        else localStorage.setItem(LEAVE_RECORDS_STORAGE_KEY, JSON.stringify(initialLeaveRecords));
      } catch { leaves = initialLeaveRecords; }
    }
    if (branchId && branchId !== "all") leaves = leaves.filter((l) => l.branchId === branchId);
    return leaves;
  }
  public saveLeave(data: Omit<LeaveRecord, "id" | "createdAt"> & { id?: string }): LeaveRecord {
    const leaves = this.getLeaveRecords();
    const now = new Date().toISOString();
    if (data.id) {
      const idx = leaves.findIndex((l) => l.id === data.id);
      if (idx !== -1) { const updated: LeaveRecord = { ...leaves[idx], ...data, id: data.id, createdAt: leaves[idx].createdAt }; leaves[idx]=updated; if (this.isBrowser()) localStorage.setItem(LEAVE_RECORDS_STORAGE_KEY, JSON.stringify(leaves)); return updated; }
    }
    const newLeave: LeaveRecord = { ...data, id: `lv-${Date.now().toString(36)}`, createdAt: now };
    leaves.unshift(newLeave);
    if (this.isBrowser()) localStorage.setItem(LEAVE_RECORDS_STORAGE_KEY, JSON.stringify(leaves));
    return newLeave;
  }
  public updateLeaveStatus(id: string, status: LeaveRecord["status"], approver?: string): LeaveRecord | null {
    const leave = this.getLeaveRecords().find((l) => l.id === id);
    if (!leave) return null;
    return this.saveLeave({ ...leave, status, approvedBy: approver, approvedDate: new Date().toISOString().split("T")[0] });
  }

  // ==================== NOTICES ====================
  public getNotices(branchId?: string): Notice[] {
    let notices = initialNotices;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(NOTICES_STORAGE_KEY);
        if (stored) notices = JSON.parse(stored);
        else localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(initialNotices));
      } catch {
        notices = initialNotices;
      }
    }
    if (!branchId || branchId === "all") return notices;
    return notices.filter((n) => n.branchId === "all" || n.branchId === branchId);
  }

  public addNotice(notice: Omit<Notice, "id" | "date">): Notice {
    const notices = this.getNotices();
    const newNotice: Notice = {
      ...notice,
      id: `not-${Date.now().toString(36)}`,
      date: new Date().toISOString(),
    };
    notices.unshift(newNotice);
    if (this.isBrowser()) {
      localStorage.setItem(NOTICES_STORAGE_KEY, JSON.stringify(notices));
    }
    return newNotice;
  }

  // ==================== ACTIVITIES ====================
  public getActivities(branchId?: string): ActivityLog[] {
    let activities = initialActivities;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
        if (stored) activities = JSON.parse(stored);
        else localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(initialActivities));
      } catch {
        activities = initialActivities;
      }
    }
    if (!branchId || branchId === "all") return activities;
    return activities.filter((a) => a.branchId === branchId || a.branchId === "all");
  }

  public addActivity(activity: Omit<ActivityLog, "id" | "timestamp">): ActivityLog {
    const activities = this.getActivities();
    const newActivity: ActivityLog = {
      ...activity,
      id: `act-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };
    activities.unshift(newActivity);
    if (this.isBrowser()) {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities.slice(0, 100)));
    }
    return newActivity;
  }

  // ==================== BIOMETRIC ====================
  public getBiometricDevices(branchId?: string): BiometricDevice[] {
    let devices = initialBiometricDevices;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
        if (stored) devices = JSON.parse(stored);
        else localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(initialBiometricDevices));
      } catch {
        devices = initialBiometricDevices;
      }
    }
    if (!branchId || branchId === "all") return devices;
    return devices.filter((d) => d.branchId === "all" || d.branchId === branchId);
  }

  public triggerBiometricSync(deviceId?: string): { success: boolean; syncedCount: number; message: string } {
    const count = Math.floor(Math.random() * 200) + 50;
    this.addActivity({
      user: { name: "Biometric Auto-Sync", avatar: "", role: "SYSTEM" },
      action: "SYNC",
      module: "Biometric",
      entityName: deviceId ? `Device ${deviceId}` : "All Gateways",
      branchId: "all",
      branchName: "All Campuses",
      details: `Simulated attendance hardware sync completed (${count} punch records processed).`,
      status: "SUCCESS",
    });
    return {
      success: true,
      syncedCount: count,
      message: `Successfully synchronized ${count} biometric punches.`,
    };
  }

  // ==================== TIMETABLE ====================
  public getTimetables(branchId?: string): Timetable[] {
    let timetables = initialTimetables;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TIMETABLE_STORAGE_KEY);
        if (stored) timetables = JSON.parse(stored);
        else localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(initialTimetables));
      } catch { timetables = initialTimetables; }
    }
    if (!branchId || branchId === "all") return timetables;
    return timetables.filter((t) => t.branchId === branchId);
  }

  public getTimetableById(id: string): Timetable | undefined {
    return this.getTimetables().find((t) => t.id === id);
  }

  public getTimetableSlots(branchId?: string, classId?: string): TimetableSlot[] {
    let slots = initialTimetableSlots;
    if (this.isBrowser()) {
      const timetables = this.getTimetables(branchId);
      slots = timetables.flatMap((t) => t.slots);
    }
    if (classId) slots = slots.filter((s) => s.classId === classId);
    return slots;
  }

  public saveTimetable(data: Omit<Timetable, "id" | "createdAt" | "updatedAt"> & { id?: string }): Timetable {
    const timetables = this.getTimetables();
    const now = new Date().toISOString();
    if (data.id) {
      const index = timetables.findIndex((t) => t.id === data.id);
      if (index !== -1) {
        const updated: Timetable = { ...timetables[index], ...data, id: data.id, updatedAt: now };
        timetables[index] = updated;
        if (this.isBrowser()) localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetables));
        return updated;
      }
    }
    const newId = `tt-${Date.now().toString(36)}`;
    const newTt: Timetable = { ...data, id: newId, createdAt: now, updatedAt: now };
    timetables.unshift(newTt);
    if (this.isBrowser()) localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetables));
    return newTt;
  }

  public getDefaultPeriods() { return defaultPeriods; }

  public saveTimetableSlot(slot: TimetableSlot): TimetableSlot {
    const timetables = this.getTimetables();
    // Find timetable that matches classId or create new one
    let target = timetables.find((t) => t.slots.some((s) => s.id === slot.id));
    if (target) {
      const idx = target.slots.findIndex((s) => s.id === slot.id);
      if (idx !== -1) target.slots[idx] = slot;
      else target.slots.push(slot);
    } else {
      // find or create timetable for class
      target = timetables.find((t) => t.branchId === slot.branchId && t.slots.some((s) => s.classId === slot.classId));
      if (!target) {
        const newTt: Timetable = {
          id: `tt-${Date.now().toString(36)}`,
          name: `${slot.className} Weekly Schedule`,
          branchId: slot.branchId,
          branchName: slot.branchName,
          academicYear: "2026-2027",
          effectiveFrom: new Date().toISOString().split("T")[0],
          slots: [slot],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        timetables.unshift(newTt);
        if (this.isBrowser()) localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetables));
        return slot;
      } else {
        target.slots.push(slot);
      }
    }
    if (this.isBrowser()) localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetables));
    // also update initialTimetableSlots for non-browser fallback
    const gIdx = initialTimetableSlots.findIndex((s) => s.id === slot.id);
    if (gIdx !== -1) initialTimetableSlots[gIdx] = slot;
    else initialTimetableSlots.push(slot);
    return slot;
  }

  public deleteTimetableSlot(slotId: string): boolean {
    const timetables = this.getTimetables();
    let found = false;
    for (const tt of timetables) {
      const before = tt.slots.length;
      tt.slots = tt.slots.filter((s) => s.id !== slotId);
      if (tt.slots.length !== before) found = true;
    }
    if (found && this.isBrowser()) localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(timetables));
    const gIdx = initialTimetableSlots.findIndex((s) => s.id === slotId);
    if (gIdx !== -1) { initialTimetableSlots.splice(gIdx, 1); found = true; }
    return found;
  }

  public createTimetableSlot(data: Omit<TimetableSlot, "id">): TimetableSlot {
    const newSlot: TimetableSlot = { ...data, id: `ts-${Date.now().toString(36)}` };
    return this.saveTimetableSlot(newSlot);
  }

  // ==================== HOMEWORK ====================
  public getHomeworkList(branchId?: string): Homework[] {
    let hw = initialHomework;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(HOMEWORK_STORAGE_KEY);
        if (stored) hw = JSON.parse(stored);
        else localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(initialHomework));
      } catch { hw = initialHomework; }
    }
    if (!branchId || branchId === "all") return hw;
    return hw.filter((h) => h.branchId === branchId);
  }

  public getHomeworkById(id: string): Homework | undefined {
    return this.getHomeworkList().find((h) => h.id === id);
  }

  public saveHomework(data: Omit<Homework, "id" | "createdAt" | "updatedAt"> & { id?: string }): Homework {
    const hw = this.getHomeworkList();
    const now = new Date().toISOString();
    if (data.id) {
      const index = hw.findIndex((h) => h.id === data.id);
      if (index !== -1) {
        const updated: Homework = { ...hw[index], ...data, id: data.id, updatedAt: now };
        hw[index] = updated;
        if (this.isBrowser()) localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(hw));
        return updated;
      }
    }
    const newId = `hw-${Date.now().toString(36)}`;
    const newHw: Homework = { ...data, id: newId, createdAt: now, updatedAt: now };
    hw.unshift(newHw);
    if (this.isBrowser()) localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(hw));
    return newHw;
  }

  public getHomeworkSubmissions(homeworkId: string): HomeworkSubmission[] {
    let subs = initialHomeworkSubmissions;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(HOMEWORK_SUBMISSIONS_STORAGE_KEY);
        if (stored) subs = JSON.parse(stored);
        else localStorage.setItem(HOMEWORK_SUBMISSIONS_STORAGE_KEY, JSON.stringify(initialHomeworkSubmissions));
      } catch { subs = initialHomeworkSubmissions; }
    }
    return subs.filter((s) => s.homeworkId === homeworkId);
  }

  public saveHomeworkSubmission(data: Omit<HomeworkSubmission, "id"> & { id?: string }): HomeworkSubmission {
    let subs = initialHomeworkSubmissions;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(HOMEWORK_SUBMISSIONS_STORAGE_KEY);
        if (stored) subs = JSON.parse(stored);
        else localStorage.setItem(HOMEWORK_SUBMISSIONS_STORAGE_KEY, JSON.stringify(initialHomeworkSubmissions));
      } catch { subs = initialHomeworkSubmissions; }
    }
    const newSub: HomeworkSubmission = { ...data, id: data.id || `sub-${Date.now().toString(36)}` };
    subs.push(newSub);
    if (this.isBrowser()) localStorage.setItem(HOMEWORK_SUBMISSIONS_STORAGE_KEY, JSON.stringify(subs));
    return newSub;
  }

  // ==================== EXAMS & RESULTS ====================
  // Exams (header) — spec §1
  public getExams(branchId?: string): Exam[] {
    let exams = initialExams;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(EXAMS_STORAGE_KEY);
        if (stored) exams = JSON.parse(stored);
        else localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(initialExams));
      } catch { exams = initialExams; }
    }
    if (!branchId || branchId === "all") return exams;
    return exams.filter((e) => e.branchId === branchId);
  }
  public getExamById(id: string): Exam | undefined { return this.getExams().find((e) => e.id === id); }
  public saveExam(data: Omit<Exam, "id" | "createdAt" | "updatedAt"> & { id?: string }): Exam {
    const exams = this.getExams();
    const now = new Date().toISOString();
    if (data.startDate > data.endDate) throw new Error("Start Date cannot be after End Date");
    if (data.id) {
      const idx = exams.findIndex((e) => e.id === data.id);
      if (idx !== -1) {
        const updated: Exam = { ...exams[idx], ...data, id: data.id, updatedAt: now };
        exams[idx] = updated;
        initialExams[idx] = updated;
        if (this.isBrowser()) localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
        this.addActivity({ user: { name: "Admin", avatar: "", role: "ADMIN" }, action: "UPDATE", module: "Exams", entityName: updated.name, entityId: updated.id, branchId: updated.branchId, branchName: updated.branchName, details: `Updated exam ${updated.name} (${updated.className}) ${updated.startDate}→${updated.endDate}`, status: "SUCCESS" });
        return updated;
      }
    }
    const newExam: Exam = { ...data, id: data.id || `ex-${Date.now().toString(36)}`, createdAt: now, updatedAt: now };
    exams.unshift(newExam);
    initialExams.unshift(newExam);
    if (this.isBrowser()) localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    this.addActivity({ user: { name: "Admin", avatar: "", role: "ADMIN" }, action: "CREATE", module: "Exams", entityName: newExam.name, entityId: newExam.id, branchId: newExam.branchId, branchName: newExam.branchName, details: `Created exam ${newExam.name} for ${newExam.className} ${newExam.sectionName} (${newExam.academicYear}) ${newExam.startDate}–${newExam.endDate}`, status: "SUCCESS" });
    // notify students/parents
    this.pushExamNotification(`New Exam: ${newExam.name}`, `${newExam.className} ${newExam.sectionName} — ${newExam.startDate} to ${newExam.endDate}`, newExam.branchId, newExam.branchName);
    return newExam;
  }
  public deleteExam(id: string): boolean {
    const exams = this.getExams();
    const idx = exams.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    exams.splice(idx, 1);
    const g = initialExams.findIndex((e) => e.id === id);
    if (g !== -1) initialExams.splice(g, 1);
    if (this.isBrowser()) localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    return true;
  }

  public getExamTypes(): ExamType[] {
    let types = initialExamTypes;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(EXAM_TYPES_STORAGE_KEY);
        if (stored) types = JSON.parse(stored);
        else localStorage.setItem(EXAM_TYPES_STORAGE_KEY, JSON.stringify(initialExamTypes));
      } catch { types = initialExamTypes; }
    }
    return types;
  }

  public saveExamType(data: Omit<ExamType, "id"> & { id?: string }): ExamType {
    const types = this.getExamTypes();
    const item: ExamType = { ...data, id: data.id || `ety-${Date.now().toString(36)}` } as ExamType;
    const idx = types.findIndex((t) => t.id === item.id);
    if (idx !== -1) types[idx] = item;
    else types.unshift(item);
    const gIdx = initialExamTypes.findIndex((t) => t.id === item.id);
    if (gIdx !== -1) initialExamTypes[gIdx] = item;
    else initialExamTypes.unshift(item);
    if (this.isBrowser()) localStorage.setItem(EXAM_TYPES_STORAGE_KEY, JSON.stringify(types));
    // notify Create Exam dropdowns
    if (this.isBrowser()) window.dispatchEvent(new CustomEvent("exam-types:updated"));
    return item;
  }

  public deleteExamType(id: string): boolean {
    const types = this.getExamTypes();
    const idx = types.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    types.splice(idx, 1);
    const g = initialExamTypes.findIndex((t) => t.id === id);
    if (g !== -1) initialExamTypes.splice(g, 1);
    if (this.isBrowser()) localStorage.setItem(EXAM_TYPES_STORAGE_KEY, JSON.stringify(types));
    if (this.isBrowser()) window.dispatchEvent(new CustomEvent("exam-types:updated"));
    return true;
  }

  public getGradeScale(): GradeScale[] {
    let scale = initialGradeScale;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(GRADE_SCALE_STORAGE_KEY);
        if (stored) scale = JSON.parse(stored);
        else localStorage.setItem(GRADE_SCALE_STORAGE_KEY, JSON.stringify(initialGradeScale));
      } catch { scale = initialGradeScale; }
    }
    return scale;
  }

  public getExamSchedules(branchId?: string, examId?: string): ExamSchedule[] {
    let schedules = initialExamSchedules;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(EXAM_SCHEDULES_STORAGE_KEY);
        if (stored) schedules = JSON.parse(stored);
        else localStorage.setItem(EXAM_SCHEDULES_STORAGE_KEY, JSON.stringify(initialExamSchedules));
      } catch { schedules = initialExamSchedules; }
    }
    if (branchId && branchId !== "all") schedules = schedules.filter((s) => s.branchId === branchId);
    if (examId) schedules = schedules.filter((s) => s.examId === examId);
    return schedules;
  }

  public getExamScheduleById(id: string): ExamSchedule | undefined {
    return this.getExamSchedules().find((s) => s.id === id);
  }

  private isOverlapping(s1: ExamSchedule, s2: ExamSchedule): boolean {
    if (s1.classId !== s2.classId || s1.sectionId !== s2.sectionId || s1.examDate !== s2.examDate) return false;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const aStart = toMin(s1.startTime), aEnd = toMin(s1.endTime), bStart = toMin(s2.startTime), bEnd = toMin(s2.endTime);
    return aStart < bEnd && bStart < aEnd;
  }

  public saveExamSchedule(data: Omit<ExamSchedule, "id"> & { id?: string }): ExamSchedule {
    // validate no overlap for same class+section+date+time
    const schedules = this.getExamSchedules();
    const candidate: ExamSchedule = { ...data, id: data.id || `es-${Date.now().toString(36)}` } as ExamSchedule;
    for (const s of schedules) {
      if (s.id === candidate.id) continue;
      if (this.isOverlapping(candidate, s)) throw new Error(`Overlapping exam: ${s.subjectName} at ${s.startTime}-${s.endTime} on ${s.examDate} for ${s.className} ${s.sectionName}`);
    }
    const index = schedules.findIndex((s) => s.id === candidate.id);
    const isNew = index === -1;
    if (index !== -1) schedules[index] = candidate;
    else schedules.unshift(candidate);
    // sync initial
    const gIdx = initialExamSchedules.findIndex((s) => s.id === candidate.id);
    if (gIdx !== -1) initialExamSchedules[gIdx] = candidate;
    else if (isNew) initialExamSchedules.unshift(candidate);
    if (this.isBrowser()) localStorage.setItem(EXAM_SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    if (isNew) {
      this.addActivity({ user: { name: "Admin", avatar: "", role: "ADMIN" }, action: "CREATE", module: "Exams", entityName: candidate.examName, entityId: candidate.id, branchId: candidate.branchId, branchName: candidate.branchName, details: `Published schedule ${candidate.subjectName} on ${candidate.examDate} ${candidate.startTime}-${candidate.endTime} ${candidate.room} for ${candidate.className}`, status: "SUCCESS" });
      this.pushExamNotification("Exam Schedule Published", `${candidate.examName} — ${candidate.subjectName} on ${candidate.examDate} ${candidate.startTime} ${candidate.room}`, candidate.branchId, candidate.branchName);
    }
    return candidate;
  }

  public publishExamNotice(examId: string, by?: string, instructions?: string): Exam | null {
    const ex = this.getExamById(examId);
    if (!ex) return null;
    const updated: Exam = { ...ex, status: "PUBLISHED", instructions: instructions ?? ex.instructions, noticePublishedAt: new Date().toISOString(), noticePublishedBy: by || "Admin", updatedAt: new Date().toISOString() };
    this.saveExam(updated as any);
    this.pushExamNotification("Exam Notice Published", `${updated.name} (${updated.examTypeName} - ${updated.examMode}) — ${updated.className} ${updated.sectionName} ${updated.startDate}→${updated.endDate}. ${instructions || ""}`.trim(), updated.branchId, updated.branchName);
    this.addActivity({ user: { name: by || "Admin", avatar: "", role: "ADMIN" }, action: "APPROVE", module: "Exams", entityName: updated.name, entityId: updated.id, branchId: updated.branchId, branchName: updated.branchName, details: `Published exam notice for ${updated.name} — notified students/parents`, status: "SUCCESS" });
    return updated;
  }

  public publishTimetable(examId: string, by?: string): number {
    const schedules = this.getExamSchedules(undefined, examId);
    if (schedules.length === 0) throw new Error("No timetable to publish");
    let count = 0;
    for (const s of schedules) {
      if (!s.isPublished) {
        this.saveExamSchedule({ ...s, publicationStatus: "PUBLISHED", isPublished: true } as any);
        count++;
      }
    }
    const ex = this.getExamById(examId);
    if (ex) {
      this.pushExamNotification("Exam Timetable Published", `${ex.name} — ${ex.className} ${ex.sectionName} timetable (${schedules.length} subjects) is live`, ex.branchId, ex.branchName);
      this.addActivity({ user: { name: by || "Admin", avatar: "", role: "ADMIN" }, action: "APPROVE", module: "Exams", entityName: ex.name, entityId: ex.id, branchId: ex.branchId, branchName: ex.branchName, details: `Published timetable for ${ex.name} — ${count} subjects`, status: "SUCCESS" });
    }
    return count;
  }

  public rescheduleExam(scheduleId: string, newDate: string, newStart?: string, newEnd?: string, reason?: string, by?: string): ExamSchedule | null {
    const s = this.getExamScheduleById(scheduleId);
    if (!s) return null;
    if (!reason || !reason.trim()) throw new Error("Reschedule reason is required");
    const prev = s.examDate;
    const prevStart = s.startTime;
    const prevEnd = s.endTime;
    const updated: ExamSchedule = { ...s, examDate: newDate, startTime: newStart || s.startTime, endTime: newEnd || s.endTime, previousDate: prev, previousStartTime: prevStart, previousEndTime: prevEnd, rescheduleReason: reason, rescheduledAt: new Date().toISOString(), rescheduledBy: by || "Admin" };
    // validate overlap after change
    const schedules = this.getExamSchedules();
    for (const o of schedules) {
      if (o.id === updated.id) continue;
      if (this.isOverlapping(updated, o)) throw new Error(`Reschedule conflicts with ${o.subjectName} ${o.startTime}-${o.endTime} on ${newDate}`);
    }
    this.saveExamSchedule(updated);
    this.addActivity({ user: { name: by || "Admin", avatar: "", role: "ADMIN" }, action: "UPDATE", module: "Exams", entityName: s.examName, entityId: s.id, branchId: s.branchId, branchName: s.branchName, details: `Rescheduled ${s.subjectName} from ${prev} to ${newDate}: ${reason}`, status: "WARNING" });
    this.pushExamNotification("Exam Rescheduled", `${updated.subjectName} moved from ${prev} to ${newDate} — ${reason}`, updated.branchId, updated.branchName);
    return updated;
  }

  public getMarkEntries(examScheduleId?: string): MarkEntry[] {
    let entries = initialMarkEntries;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(MARK_ENTRIES_STORAGE_KEY);
        if (stored) entries = JSON.parse(stored);
        else localStorage.setItem(MARK_ENTRIES_STORAGE_KEY, JSON.stringify(initialMarkEntries));
      } catch { entries = initialMarkEntries; }
    }
    if (examScheduleId) entries = entries.filter((e) => e.examScheduleId === examScheduleId);
    return entries;
  }

  public saveMarkEntry(data: Omit<MarkEntry, "id" | "enteredAt"> & { id?: string }): MarkEntry {
    let entries = initialMarkEntries;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(MARK_ENTRIES_STORAGE_KEY);
        if (stored) entries = JSON.parse(stored);
        else localStorage.setItem(MARK_ENTRIES_STORAGE_KEY, JSON.stringify(initialMarkEntries));
      } catch { entries = initialMarkEntries; }
    }
    // validation: marks cannot exceed max, handle AB
    if (!data.isAbsent && (data.marksObtained < 0 || data.marksObtained > data.totalMarks)) throw new Error(`Marks ${data.marksObtained} exceeds max ${data.totalMarks}`);
    if (data.isAbsent) { data.marksObtained = 0; data.percentage = 0; data.grade = "E"; data.status = "FAIL"; }
    // lock check
    if (data.id) {
      const existing = entries.find((e) => e.id === data.id);
      if (existing?.workflowStatus === "LOCKED") throw new Error("Locked marks require authorization to edit");
      // history when corrected
      if (existing && (existing.marksObtained !== data.marksObtained || existing.grade !== data.grade)) {
        const hist = existing.history || [];
        hist.push({ marksObtained: existing.marksObtained, grade: existing.grade, status: existing.status, correctedAt: new Date().toISOString(), correctedBy: data.enteredBy, reason: (data as any).correctionReason });
        (data as any).history = hist;
      }
    }
    if (!data.workflowStatus) (data as any).workflowStatus = "DRAFT";
    const newEntry: MarkEntry = { ...data, id: data.id || `mk-${Date.now().toString(36)}`, enteredAt: new Date().toISOString() } as MarkEntry;
    const index = entries.findIndex((e) => e.id === newEntry.id);
    if (index !== -1) entries[index] = newEntry;
    else entries.unshift(newEntry);
    // sync initial
    const gIdx = initialMarkEntries.findIndex((e) => e.id === newEntry.id);
    if (gIdx !== -1) initialMarkEntries[gIdx] = newEntry;
    else if (index === -1) initialMarkEntries.unshift(newEntry);
    if (this.isBrowser()) localStorage.setItem(MARK_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  }

  public updateMarkWorkflow(id: string, to: MarkEntry["workflowStatus"], by?: string): MarkEntry | null {
    const e = this.getMarkEntries().find((x) => x.id === id);
    if (!e) return null;
    const order: MarkEntry["workflowStatus"][] = ["DRAFT", "SUBMITTED", "VERIFIED", "LOCKED"];
    const curIdx = order.indexOf(e.workflowStatus || "DRAFT");
    const nextIdx = order.indexOf(to as any);
    if (nextIdx < curIdx) throw new Error("Cannot move backwards in workflow without correction");
    if (to === "LOCKED" && (by !== "Admin" && by !== "ADMIN")) throw new Error("Only Admin can lock marks");
    return this.saveMarkEntry({ ...e, workflowStatus: to, verifiedBy: by || e.verifiedBy } as any);
  }

  public getResults(branchId?: string, examTypeId?: string): Result[] {
    let results = initialResults;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(RESULTS_STORAGE_KEY);
        if (stored) results = JSON.parse(stored);
        else localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(initialResults));
      } catch { results = initialResults; }
    }
    if (branchId && branchId !== "all") results = results.filter((r) => r.branchId === branchId);
    if (examTypeId) results = results.filter((r) => r.examTypeId === examTypeId);
    return results;
  }

  public getResultById(id: string): Result | undefined {
    return this.getResults().find((r) => r.id === id);
  }

  public getResultByStudent(studentId: string): Result[] {
    return this.getResults().filter((r) => r.studentId === studentId);
  }

  public getPublishedResultsForStudent(studentId: string): Result[] {
    return this.getResultByStudent(studentId).filter((r) => r.isPublished);
  }

  public saveResult(data: Omit<Result, "id" | "createdAt" | "updatedAt"> & { id?: string }): Result {
    const results = this.getResults();
    const now = new Date().toISOString();
    if (data.id) {
      const index = results.findIndex((r) => r.id === data.id);
      if (index !== -1) {
        const updated: Result = { ...results[index], ...data, id: data.id, updatedAt: now };
        results[index] = updated;
        const g = initialResults.findIndex((r) => r.id === data.id);
        if (g !== -1) initialResults[g] = updated;
        if (this.isBrowser()) localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
        return updated;
      }
    }
    const newId = `res-${Date.now().toString(36)}`;
    const newResult: Result = { ...data, id: newId, createdAt: now, updatedAt: now };
    results.unshift(newResult);
    initialResults.unshift(newResult);
    if (this.isBrowser()) localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    return newResult;
  }

  // Result Generation — spec: class/section-wise, configurable grading, status GENERATED -> PUBLISHED
  public generateResultsForExam(examId: string, classId?: string, sectionId?: string): Result[] {
    const exam = this.getExamById(examId);
    if (!exam) throw new Error("Exam not found");
    const filterClass = classId || exam.classId;
    const filterSection = sectionId || exam.sectionId;
    const schedules = this.getExamSchedules(undefined, examId).filter((s) => s.classId === filterClass && s.sectionId === filterSection);
    if (schedules.length === 0) throw new Error("No schedules for this exam/class/section — create subject-wise timetable first");
    const classStudents = this.getStudents(exam.branchId).filter((s) => s.classId === filterClass && s.sectionId === filterSection);
    const allMarks = schedules.flatMap((es) => this.getMarkEntries(es.id));
    if (allMarks.length === 0) throw new Error("No marks entered yet — teachers must submit marks first");
    const byStudent = new Map<string, MarkEntry[]>();
    for (const m of allMarks) {
      const arr = byStudent.get(m.studentId) || [];
      arr.push(m);
      byStudent.set(m.studentId, arr);
    }
    const gradeScale = this.getGradeScale();
    const toGrade = (p: number) => gradeScale.find((g) => p >= g.minPercentage && p <= g.maxPercentage)?.grade || "E";
    const toGpa = (p: number) => gradeScale.find((g) => p >= g.minPercentage && p <= g.maxPercentage)?.gpa ?? 0;
    const generated: Result[] = [];
    for (const [sid, marks] of byStudent.entries()) {
      const stu = this.getStudents().find((s) => s.id === sid) || classStudents.find((s) => s.id === sid);
      if (!stu) continue;
      const totalMarks = marks.reduce((a, m) => a + m.totalMarks, 0);
      const obtained = marks.reduce((a, m) => a + (m.isAbsent ? 0 : m.marksObtained), 0);
      const pct = totalMarks ? (obtained / totalMarks) * 100 : 0;
      const hasFail = marks.some((m) => m.status === "FAIL" || m.isAbsent);
      const overallGrade = toGrade(pct);
      const result: Omit<Result, "id" | "createdAt" | "updatedAt"> = {
        studentId: sid,
        studentName: stu.fullName,
        studentRoll: stu.rollNumber,
        admissionNumber: (stu as any).admissionNumber || stu.rollNumber,
        classId: filterClass,
        className: clsName(filterClass),
        sectionId: filterSection,
        sectionName: secName(filterClass, filterSection),
        branchId: exam.branchId,
        branchName: exam.branchName,
        examId: exam.id,
        examTypeId: exam.examTypeId,
        examTypeName: exam.examTypeName,
        examMode: exam.examMode,
        academicYear: exam.academicYear,
        totalMarks,
        marksObtained: obtained,
        percentage: Number(pct.toFixed(2)),
        overallGrade,
        gpa: toGpa(pct),
        rank: 0,
        totalStudents: byStudent.size,
        status: hasFail ? "FAIL" : "PASS",
        isPublished: false,
        publicationStatus: "GENERATED",
        generatedAt: new Date().toISOString(),
        subjects: marks.map((m) => ({ subjectId: m.subjectId, subjectName: m.subjectName, marksObtained: m.isAbsent ? 0 : m.marksObtained, totalMarks: m.totalMarks, percentage: m.percentage, grade: m.grade, status: m.isAbsent ? "FAIL" : m.status })),
        remarks: hasFail ? "Needs improvement" : "Good performance",
      };
      const existing = this.getResults().find((r) => r.studentId === sid && r.examId === examId && r.classId === filterClass && r.sectionId === filterSection);
      const saved = this.saveResult({ ...result, id: existing?.id } as any);
      generated.push(saved);
    }
    generated.sort((a, b) => b.percentage - a.percentage);
    generated.forEach((r, idx) => { r.rank = idx + 1; this.saveResult(r as any); });
    this.addActivity({ user: { name: "Admin", avatar: "", role: "ADMIN" }, action: "CREATE", module: "Results", entityName: exam!.name, entityId: exam!.id, branchId: exam!.branchId, branchName: exam!.branchName, details: `Generated ${generated.length} results for ${exam!.name} ${exam!.className} (${exam!.academicYear}) class ${filterClass} sec ${filterSection}`, status: "SUCCESS" });
    return generated;
    function clsName(id: string) { const cls = mockDb.getClasses().find((x) => x.id === id); return cls?.name || exam!.className; }
    function secName(cId: string, sId: string) { const cls = mockDb.getClasses().find((x) => x.id === cId); return cls?.sections.find((s) => s.id === sId)?.name || exam!.sectionName; }
  }

  public publishResults(examId: string, by?: string): number {
    const exam = this.getExamById(examId);
    if (!exam) throw new Error("Exam not found");
    const results = this.getResults().filter((r) => r.examId === examId);
    if (results.length === 0) throw new Error("No results to publish — generate first");
    let count = 0;
    for (const r of results) {
      if (!r.isPublished) {
        this.saveResult({ ...r, isPublished: true, publicationStatus: "PUBLISHED", publishedAt: new Date().toISOString(), verifiedBy: by || "Admin" } as any);
        count++;
      }
    }
    this.pushExamNotification("Result Published", `${exam.name} — ${exam.className} ${exam.sectionName} (${exam.academicYear}) results are live`, exam.branchId, exam.branchName);
    this.addActivity({ user: { name: by || "Admin", avatar: "", role: "ADMIN" }, action: "APPROVE", module: "Results", entityName: exam.name, entityId: exam.id, branchId: exam.branchId, branchName: exam.branchName, details: `Published ${count} results for ${exam.name}`, status: "SUCCESS" });
    return count;
  }

  private pushExamNotification(title: string, message: string, branchId: string, branchName: string) {
    // reuse notifications storage
    try {
      const existing = this.getNotifications();
      const n: any = { id: `notif-${Date.now().toString(36)}`, title, message, category: "ACADEMIC", priority: "HIGH", isRead: false, isArchived: false, userId: "all", branchId, branchName, icon: "GraduationCap", channels: ["IN_APP"], deliveredChannels: ["IN_APP"], createdAt: new Date().toISOString() };
      existing.unshift(n);
      initialNotifications?.unshift?.(n);
      if (this.isBrowser()) localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existing.slice(0, 100)));
    } catch {}
  }

  // ==================== TRANSPORT ====================
  public getVehicles(branchId?: string): Vehicle[] {
    let vehicles = initialVehicles;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(VEHICLES_STORAGE_KEY);
        if (stored) vehicles = JSON.parse(stored);
        else localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(initialVehicles));
      } catch { vehicles = initialVehicles; }
    }
    if (!branchId || branchId === "all") return vehicles;
    return vehicles.filter((v) => v.branchId === branchId);
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.getVehicles().find((v) => v.id === id);
  }

  public saveVehicle(data: Omit<Vehicle, "id" | "createdAt" | "updatedAt"> & { id?: string }): Vehicle {
    const vehicles = this.getVehicles();
    const now = new Date().toISOString();
    if (data.id) {
      const index = vehicles.findIndex((v) => v.id === data.id);
      if (index !== -1) {
        const updated: Vehicle = { ...vehicles[index], ...data, id: data.id, updatedAt: now };
        vehicles[index] = updated;
        if (this.isBrowser()) localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
        return updated;
      }
    }
    const newId = `veh-${Date.now().toString(36)}`;
    const newVehicle: Vehicle = { ...data, id: newId, createdAt: now, updatedAt: now };
    vehicles.unshift(newVehicle);
    if (this.isBrowser()) localStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
    return newVehicle;
  }

  public getTransportRoutes(branchId?: string): TransportRoute[] {
    let routes = initialTransportRoutes;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TRANSPORT_ROUTES_STORAGE_KEY);
        if (stored) routes = JSON.parse(stored);
        else localStorage.setItem(TRANSPORT_ROUTES_STORAGE_KEY, JSON.stringify(initialTransportRoutes));
      } catch { routes = initialTransportRoutes; }
    }
    if (!branchId || branchId === "all") return routes;
    return routes.filter((r) => r.branchId === branchId);
  }

  public getTransportRouteById(id: string): TransportRoute | undefined {
    return this.getTransportRoutes().find((r) => r.id === id);
  }

  public saveTransportRoute(data: Omit<TransportRoute, "id" | "createdAt" | "updatedAt"> & { id?: string }): TransportRoute {
    const routes = this.getTransportRoutes();
    const now = new Date().toISOString();
    if (data.id) {
      const index = routes.findIndex((r) => r.id === data.id);
      if (index !== -1) {
        const updated: TransportRoute = { ...routes[index], ...data, id: data.id, updatedAt: now };
        routes[index] = updated;
        if (this.isBrowser()) localStorage.setItem(TRANSPORT_ROUTES_STORAGE_KEY, JSON.stringify(routes));
        return updated;
      }
    }
    const newId = `tr-${Date.now().toString(36)}`;
    const newRoute: TransportRoute = { ...data, id: newId, createdAt: now, updatedAt: now };
    routes.unshift(newRoute);
    if (this.isBrowser()) localStorage.setItem(TRANSPORT_ROUTES_STORAGE_KEY, JSON.stringify(routes));
    return newRoute;
  }

  public getDrivers(branchId?: string): Driver[] {
    let drivers = initialDrivers;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(DRIVERS_STORAGE_KEY);
        if (stored) drivers = JSON.parse(stored);
        else localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(initialDrivers));
      } catch { drivers = initialDrivers; }
    }
    if (!branchId || branchId === "all") return drivers;
    return drivers.filter((d) => d.branchId === branchId);
  }

  public getDriverById(id: string): Driver | undefined {
    return this.getDrivers().find((d) => d.id === id);
  }

  public saveDriver(data: Omit<Driver, "id" | "createdAt" | "updatedAt"> & { id?: string }): Driver {
    const drivers = this.getDrivers();
    const now = new Date().toISOString();
    if (data.id) {
      const index = drivers.findIndex((d) => d.id === data.id);
      if (index !== -1) {
        const updated: Driver = { ...drivers[index], ...data, id: data.id, updatedAt: now };
        drivers[index] = updated;
        if (this.isBrowser()) localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
        return updated;
      }
    }
    const newId = `drv-${Date.now().toString(36)}`;
    const newDriver: Driver = { ...data, id: newId, createdAt: now, updatedAt: now };
    drivers.unshift(newDriver);
    if (this.isBrowser()) localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
    return newDriver;
  }

  public getBusHelpers(branchId?: string): BusHelper[] {
    let helpers = initialBusHelpers;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(BUS_HELPERS_STORAGE_KEY);
        if (stored) helpers = JSON.parse(stored);
        else localStorage.setItem(BUS_HELPERS_STORAGE_KEY, JSON.stringify(initialBusHelpers));
      } catch { helpers = initialBusHelpers; }
    }
    if (!branchId || branchId === "all") return helpers;
    return helpers.filter((h) => h.branchId === branchId);
  }

  public saveBusHelper(data: Omit<BusHelper, "id" | "createdAt" | "updatedAt"> & { id?: string }): BusHelper {
    const helpers = this.getBusHelpers();
    const now = new Date().toISOString();
    if (data.id) {
      const index = helpers.findIndex((h) => h.id === data.id);
      if (index !== -1) {
        const updated: BusHelper = { ...helpers[index], ...data, id: data.id, updatedAt: now };
        helpers[index] = updated;
        if (this.isBrowser()) localStorage.setItem(BUS_HELPERS_STORAGE_KEY, JSON.stringify(helpers));
        return updated;
      }
    }
    const newId = `bhl-${Date.now().toString(36)}`;
    const newHelper: BusHelper = { ...data, id: newId, createdAt: now, updatedAt: now };
    helpers.unshift(newHelper);
    if (this.isBrowser()) localStorage.setItem(BUS_HELPERS_STORAGE_KEY, JSON.stringify(helpers));
    return newHelper;
  }

  // ---- Transport Fee Slabs (zone → fee) ----
  public getTransportFeeSlabs(branchId?: string): import("@/types").TransportFeeSlab[] {
    let slabs = initialTransportFeeSlabs;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TRANSPORT_SLABS_STORAGE_KEY);
        if (stored) slabs = JSON.parse(stored);
        else localStorage.setItem(TRANSPORT_SLABS_STORAGE_KEY, JSON.stringify(initialTransportFeeSlabs));
      } catch { slabs = initialTransportFeeSlabs; }
    }
    if (!branchId || branchId === "all") return slabs;
    return slabs.filter((s) => s.branchId === "all" || s.branchId === branchId);
  }

  public saveTransportFeeSlab(data: Omit<import("@/types").TransportFeeSlab, "id"> & { id?: string }): import("@/types").TransportFeeSlab {
    const slabs = this.getTransportFeeSlabs();
    const now = new Date().toISOString();
    if (data.id) {
      const idx = slabs.findIndex((s) => s.id === data.id);
      if (idx !== -1) {
        const updated = { ...slabs[idx], ...data, id: data.id };
        slabs[idx] = updated;
        if (this.isBrowser()) localStorage.setItem(TRANSPORT_SLABS_STORAGE_KEY, JSON.stringify(slabs));
        const gIdx = initialTransportFeeSlabs.findIndex((s) => s.id === data.id);
        if (gIdx !== -1) initialTransportFeeSlabs[gIdx] = updated;
        return updated;
      }
    }
    const newSlab = { ...data, id: data.id || `slab-${Date.now().toString(36)}` } as import("@/types").TransportFeeSlab;
    slabs.unshift(newSlab);
    initialTransportFeeSlabs.unshift(newSlab);
    if (this.isBrowser()) localStorage.setItem(TRANSPORT_SLABS_STORAGE_KEY, JSON.stringify(slabs));
    return newSlab;
  }

  public getTransportFeeForDistance(km: number, branchId?: string): import("@/types").TransportFeeSlab | undefined {
    return this.getTransportFeeSlabs(branchId).find((s) => s.isActive && km >= s.minDistance && km < s.maxDistance);
  }

  public getTransportFeeForZone(zone: "A" | "B" | "C" | "D", branchId?: string): import("@/types").TransportFeeSlab | undefined {
    return this.getTransportFeeSlabs(branchId).find((s) => s.isActive && s.zone === zone);
  }

  public getStudentTransportAssignments(branchId?: string): StudentTransportAssignment[] {
    let assignments = initialStudentTransportAssignments;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STUDENT_TRANSPORT_STORAGE_KEY);
        if (stored) assignments = JSON.parse(stored);
        else localStorage.setItem(STUDENT_TRANSPORT_STORAGE_KEY, JSON.stringify(initialStudentTransportAssignments));
      } catch { assignments = initialStudentTransportAssignments; }
    }
    if (!branchId || branchId === "all") return assignments;
    return assignments.filter((a) => a.branchId === branchId);
  }

  public getStudentTransportAssignmentByStudentId(studentId: string): StudentTransportAssignment | undefined {
    return this.getStudentTransportAssignments().find((a) => a.studentId === studentId && a.status === "ACTIVE");
  }

  private syncTransportFeeToAssignment(studentId: string, transportFee: number, zone: string): void {
    const fa = initialFeeAssignments.find((a) => a.studentId === studentId);
    if (!fa) return;
    // Ensure transport head exists or update
    if (!fa.feeHeads) fa.feeHeads = [];
    let th = fa.feeHeads.find((h) => h.feeHeadId === "fh-04");
    if (!th) {
      th = { feeHeadId: "fh-04", feeHeadName: "Transport Fee", amount: transportFee, discount: 0, paidAmount: 0, dueAmount: transportFee, isRecurring: true, frequency: "MONTHLY" };
      fa.feeHeads.push(th);
      fa.totalAssigned += transportFee;
    } else {
      const delta = transportFee - th.amount;
      th.amount = transportFee;
      th.dueAmount = Math.max(0, transportFee - th.discount - th.paidAmount);
      fa.totalAssigned += delta;
    }
    // recompute pending with discount/lateFee
    (fa as any).totalPending = Math.max(0, fa.totalAssigned - (fa.discount ?? 0) - fa.totalPaid + (fa.lateFee ?? 0));
    this.recomputeAssignment(fa);
  }

  public saveStudentTransportAssignment(data: Omit<StudentTransportAssignment, "id"> & { id?: string }): StudentTransportAssignment {
    let assignments = initialStudentTransportAssignments;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STUDENT_TRANSPORT_STORAGE_KEY);
        if (stored) assignments = JSON.parse(stored);
        else localStorage.setItem(STUDENT_TRANSPORT_STORAGE_KEY, JSON.stringify(initialStudentTransportAssignments));
      } catch { assignments = initialStudentTransportAssignments; }
    }
    const existingIdx = assignments.findIndex((a) => a.id === (data as any).id);
    const existing = existingIdx !== -1 ? assignments[existingIdx] : undefined;

    // capacity check for new assignments
    if (!existing) {
      const route = initialTransportRoutes.find((r) => r.id === data.routeId);
      if (route && route.studentCount >= route.capacity) {
        throw new Error(`Route ${route.routeName} is at capacity (${route.capacity}). Cannot assign more students.`);
      }
    }

    // zone-derived fee slab — auto amount if not provided
    let feePerMonth = (data as any).feePerMonth;
    if (feePerMonth === undefined || feePerMonth === null) {
      const slab = this.getTransportFeeForZone((data.zone as any) || "A");
      feePerMonth = slab?.feePerMonth ?? 800;
    }

    // prorated for mid-month join
    let isProrated = (data as any).isProrated ?? false;
    let proratedFee: number | undefined = (data as any).proratedFee;
    const eff = (data as any).effectiveFrom || data.assignedDate;
    if (!isProrated) {
      // auto-detect mid-month join (>1st)
      const d = new Date(eff);
      if (!isNaN(d.getTime()) && d.getDate() > 1) {
        const calc = calcProratedFee(feePerMonth, eff);
        if (calc !== feePerMonth) {
          isProrated = true;
          proratedFee = calc;
        }
      }
    }

    // versioned history on route/stop change
    let history = (data as any).history || existing?.history || [];
    if (existing && (existing.routeId !== data.routeId || existing.stopId !== data.stopId)) {
      history = [...history, { routeId: existing.routeId, routeName: existing.routeName, stopId: existing.stopId, stopName: existing.stopName, zone: existing.zone, feePerMonth: existing.feePerMonth, changedAt: new Date().toISOString(), reason: (data as any).historyReason || "Stop/route change" }];
    }

    const newAssignment: StudentTransportAssignment = {
      ...(existing || {}),
      ...data,
      id: (data as any).id || `sta-${Date.now().toString(36)}`,
      feePerMonth,
      isProrated,
      proratedFee,
      effectiveFrom: eff,
      history,
    } as StudentTransportAssignment;

    if (existingIdx !== -1) assignments[existingIdx] = newAssignment;
    else {
      assignments.unshift(newAssignment);
      // bump route studentCount
      const route = initialTransportRoutes.find((r) => r.id === data.routeId);
      if (route) route.studentCount += 1;
      const stop = route?.stops.find((s) => s.id === data.stopId);
      if (stop) stop.studentCount += 1;
    }
    if (this.isBrowser()) localStorage.setItem(STUDENT_TRANSPORT_STORAGE_KEY, JSON.stringify(assignments));
    // sync to Fee Assignment as conditional Transport Fee head
    this.syncTransportFeeToAssignment(newAssignment.studentId, feePerMonth, newAssignment.zone);
    this.addActivity({ user: { name: "Transport Admin", avatar: "", role: "ADMIN" }, action: existing ? "UPDATE" : "CREATE", module: "Transport", entityName: newAssignment.studentName, entityId: newAssignment.id, branchId: newAssignment.branchId, branchName: newAssignment.branchName, details: existing ? `Reassigned ${newAssignment.studentName} to ${newAssignment.routeName} / ${newAssignment.stopName} (${newAssignment.zone} → ₹${feePerMonth}/mo${isProrated ? ` prorated ₹${proratedFee}` : ""})` : `Assigned ${newAssignment.studentName} to ${newAssignment.routeName} ${newAssignment.stopName} Zone ${newAssignment.zone} ₹${feePerMonth}/mo`, status: "SUCCESS" });
    return newAssignment;
  }

  public removeStudentTransportAssignment(studentId: string): { success: boolean; refundAmount: number } {
    const assignments = this.getStudentTransportAssignments();
    const idx = assignments.findIndex((a) => a.studentId === studentId && a.status === "ACTIVE");
    if (idx === -1) return { success: false, refundAmount: 0 };
    const a = assignments[idx];
    a.status = "INACTIVE";
    // refund — remaining months at annual 2000 example simplified to 2 months as per issue spec
    const monthsRemaining = 2; // could be dynamic
    const refund = a.feePerMonth * monthsRemaining;
    a.refundAmount = refund;
    if (this.isBrowser()) localStorage.setItem(STUDENT_TRANSPORT_STORAGE_KEY, JSON.stringify(assignments));
    // adjust fee assignment — reduce transport fee and track refund adjustment
    const fa = initialFeeAssignments.find((f) => f.studentId === studentId);
    if (fa && fa.feeHeads) {
      const th = fa.feeHeads.find((h) => h.feeHeadId === "fh-04");
      if (th) {
        fa.totalAssigned = Math.max(0, fa.totalAssigned - th.amount);
        th.amount = 0;
        th.dueAmount = 0;
        fa.totalPending = Math.max(0, fa.totalAssigned - (fa.discount ?? 0) - fa.totalPaid + (fa.lateFee ?? 0));
        this.recomputeAssignment(fa);
      }
    }
    // decrement route counts
    const route = initialTransportRoutes.find((r) => r.id === a.routeId);
    if (route) route.studentCount = Math.max(0, route.studentCount - 1);
    this.addActivity({ user: { name: "Transport Admin", avatar: "", role: "ADMIN" }, action: "DELETE", module: "Transport", entityName: a.studentName, entityId: a.id, branchId: a.branchId, branchName: a.branchName, details: `Dropped transport for ${a.studentName} — refund ₹${refund} for prepaid months`, status: "WARNING" });
    return { success: true, refundAmount: refund };
  }

  public getVehicleMaintenance(vehicleId?: string): VehicleMaintenance[] {
    let maintenance = initialVehicleMaintenance;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(VEHICLE_MAINTENANCE_STORAGE_KEY);
        if (stored) maintenance = JSON.parse(stored);
        else localStorage.setItem(VEHICLE_MAINTENANCE_STORAGE_KEY, JSON.stringify(initialVehicleMaintenance));
      } catch { maintenance = initialVehicleMaintenance; }
    }
    if (vehicleId) maintenance = maintenance.filter((m) => m.vehicleId === vehicleId);
    return maintenance;
  }

  public saveVehicleMaintenance(data: Omit<VehicleMaintenance, "id" | "createdAt"> & { id?: string }): VehicleMaintenance {
    let maintenance = initialVehicleMaintenance;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(VEHICLE_MAINTENANCE_STORAGE_KEY);
        if (stored) maintenance = JSON.parse(stored);
        else localStorage.setItem(VEHICLE_MAINTENANCE_STORAGE_KEY, JSON.stringify(initialVehicleMaintenance));
      } catch { maintenance = initialVehicleMaintenance; }
    }
    const newRecord: VehicleMaintenance = { ...data, id: data.id || `vm-${Date.now().toString(36)}`, createdAt: new Date().toISOString() };
    const index = maintenance.findIndex((m) => m.id === newRecord.id);
    if (index !== -1) maintenance[index] = newRecord;
    else maintenance.unshift(newRecord);
    if (this.isBrowser()) localStorage.setItem(VEHICLE_MAINTENANCE_STORAGE_KEY, JSON.stringify(maintenance));
    return newRecord;
  }

  // ==================== ANNOUNCEMENTS ====================
  public getAnnouncements(branchId?: string): Announcement[] {
    let announcements = initialAnnouncements;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
        if (stored) announcements = JSON.parse(stored);
        else localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(initialAnnouncements));
      } catch { announcements = initialAnnouncements; }
    }
    if (!branchId || branchId === "all") return announcements;
    return announcements.filter((a) => a.branchId === branchId || a.branchId === "all");
  }

  public getAnnouncementById(id: string): Announcement | undefined {
    return this.getAnnouncements().find((a) => a.id === id);
  }

  public saveAnnouncement(data: Omit<Announcement, "id" | "createdAt" | "updatedAt"> & { id?: string }): Announcement {
    const announcements = this.getAnnouncements();
    const now = new Date().toISOString();
    if (data.id) {
      const index = announcements.findIndex((a) => a.id === data.id);
      if (index !== -1) {
        const updated: Announcement = { ...announcements[index], ...data, id: data.id, updatedAt: now };
        announcements[index] = updated;
        if (this.isBrowser()) localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
        return updated;
      }
    }
    const newId = `ann-${Date.now().toString(36)}`;
    const newAnn: Announcement = { ...data, id: newId, createdAt: now, updatedAt: now };
    announcements.unshift(newAnn);
    if (this.isBrowser()) localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements));
    return newAnn;
  }

  // ==================== MESSAGES ====================
  public getMessages(branchId?: string, userId?: string): Message[] {
    let messages = initialMessages;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
        if (stored) messages = JSON.parse(stored);
        else localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(initialMessages));
      } catch { messages = initialMessages; }
    }
    if (branchId && branchId !== "all") messages = messages.filter((m) => m.branchId === branchId || m.branchId === "all");
    return messages;
  }

  public getMessageById(id: string): Message | undefined {
    return this.getMessages().find((m) => m.id === id);
  }

  public getMessageThreads(): MessageThread[] {
    let threads = initialMessageThreads;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(MESSAGE_THREADS_STORAGE_KEY);
        if (stored) threads = JSON.parse(stored);
        else localStorage.setItem(MESSAGE_THREADS_STORAGE_KEY, JSON.stringify(initialMessageThreads));
      } catch { threads = initialMessageThreads; }
    }
    return threads;
  }

  public saveMessage(data: Omit<Message, "id" | "sentAt"> & { id?: string }): Message {
    let messages = initialMessages;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
        if (stored) messages = JSON.parse(stored);
        else localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(initialMessages));
      } catch { messages = initialMessages; }
    }
    const newMsg: Message = { ...data, id: data.id || `msg-${Date.now().toString(36)}`, sentAt: new Date().toISOString() };
    messages.unshift(newMsg);
    if (this.isBrowser()) localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    return newMsg;
  }

  public markMessageRead(id: string): void {
    const messages = this.getMessages();
    const msg = messages.find((m) => m.id === id);
    if (msg) {
      msg.isRead = true;
      msg.readAt = new Date().toISOString();
      msg.channelStatus = "READ";
      if (this.isBrowser()) localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
  }

  public markAllNotificationsRead(): void {
    const notifications = this.getNotifications();
    notifications.forEach((n) => {
      if (!n.isRead) {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      }
    });
    if (this.isBrowser()) localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }

  // ==================== NOTIFICATIONS ====================
  public getNotifications(branchId?: string): Notification[] {
    let notifications = initialNotifications;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (stored) notifications = JSON.parse(stored);
        else localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(initialNotifications));
      } catch { notifications = initialNotifications; }
    }
    if (branchId && branchId !== "all") notifications = notifications.filter((n) => n.branchId === branchId || n.branchId === "all");
    return notifications;
  }

  public getUnreadNotificationCount(branchId?: string): number {
    return this.getNotifications(branchId).filter((n) => !n.isRead).length;
  }

  public markNotificationRead(id: string): void {
    const notifications = this.getNotifications();
    const noti = notifications.find((n) => n.id === id);
    if (noti) {
      noti.isRead = true;
      noti.readAt = new Date().toISOString();
      if (this.isBrowser()) localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    }
  }

  public archiveNotification(id: string): void {
    const notifications = this.getNotifications();
    const noti = notifications.find((n) => n.id === id);
    if (noti) {
      noti.isArchived = true;
      if (this.isBrowser()) localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    }
  }

  public getNotificationPreferences(): NotificationPreference[] {
    let prefs = initialNotificationPreferences;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(NOTIFICATION_PREFS_STORAGE_KEY);
        if (stored) prefs = JSON.parse(stored);
        else localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(initialNotificationPreferences));
      } catch { prefs = initialNotificationPreferences; }
    }
    return prefs;
  }

  public saveNotificationPreference(pref: NotificationPreference): void {
    let prefs = this.getNotificationPreferences();
    const index = prefs.findIndex((p) => p.category === pref.category);
    if (index !== -1) prefs[index] = pref;
    else prefs.push(pref);
    if (this.isBrowser()) localStorage.setItem(NOTIFICATION_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  }

  // ==================== EVENTS ====================
  public getEvents(branchId?: string): CalendarEvent[] {
    let events = initialCalendarEvents;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (stored) events = JSON.parse(stored);
        else localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(initialCalendarEvents));
      } catch { events = initialCalendarEvents; }
    }
    if (!branchId || branchId === "all") return events;
    return events.filter((e) => e.branchId === branchId || e.branchId === "all");
  }

  public getEventById(id: string): CalendarEvent | undefined {
    return this.getEvents().find((e) => e.id === id);
  }

  public saveEvent(data: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt"> & { id?: string }): CalendarEvent {
    const events = this.getEvents();
    const now = new Date().toISOString();
    if (data.id) {
      const index = events.findIndex((e) => e.id === data.id);
      if (index !== -1) {
        const updated: CalendarEvent = { ...events[index], ...data, id: data.id, updatedAt: now };
        events[index] = updated;
        if (this.isBrowser()) localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
        return updated;
      }
    }
    const newId = `evt-${Date.now().toString(36)}`;
    const newEvent: CalendarEvent = { ...data, id: newId, createdAt: now, updatedAt: now };
    events.unshift(newEvent);
    if (this.isBrowser()) localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    return newEvent;
  }

  public deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const filtered = events.filter((e) => e.id !== id);
    if (filtered.length === events.length) return false;
    if (this.isBrowser()) localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  public getEventVenues(branchId?: string): EventVenue[] {
    let venues = initialEventVenues;
    if (!branchId || branchId === "all") return venues;
    return venues.filter((v) => v.branchId === branchId || v.branchId === "all");
  }

  // ==================== INVENTORY ====================
  public getInventoryCategories(): InventoryCategory[] { return initialInventoryCategories; }

  public getInventoryItems(branchId?: string, storeLocationId?: string): InventoryItem[] {
    let items = initialInventoryItems;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(INVENTORY_ITEMS_STORAGE_KEY);
        if (stored) items = JSON.parse(stored);
        else localStorage.setItem(INVENTORY_ITEMS_STORAGE_KEY, JSON.stringify(initialInventoryItems));
      } catch { items = initialInventoryItems; }
    }
    // normalize legacy data (before unified spec)
    const catMap: Record<string, string> = { "Uniform & Dress": "Uniform", "Books & Diary": "Books", "Stationery": "Stationery", "Lab Equipment": "Laboratory Items", "IT Hardware": "Office Supplies", "Furniture": "Office Supplies", "Sports Equipment": "Sports Items", "Cleaning Supplies": "Cleaning Supplies" };
    for (const it of items as any[]) {
      if (catMap[it.categoryName]) it.categoryName = catMap[it.categoryName];
      if (!it.unit) it.unit = "pcs";
      if (it.sellingPrice == null) it.sellingPrice = it.unitPrice ?? 0;
      if (it.purchasePrice == null) it.purchasePrice = Math.round((it.sellingPrice || it.unitPrice) * 0.85) || it.sellingPrice || 0;
      if (!it.storeLocationId) it.storeLocationId = it.location === "Uniform Store" || it.location === "Uniform Counter" ? "loc-uniform" : it.location === "Stationery Counter" || it.location === "Store Room A" ? "loc-stationery" : it.location === "Science Lab" || it.location?.includes("Lab") ? "loc-lab" : it.location === "Sports Store" ? "loc-sports" : "loc-main";
      if (!it.storeLocationName) it.storeLocationName = this.getStoreLocations().find((l) => l.id === it.storeLocationId)?.name || it.location;
    }
    if (branchId && branchId !== "all") items = items.filter((i) => i.branchId === branchId || (i as any).branchId === "all");
    if (storeLocationId && storeLocationId !== "ALL") items = items.filter((i) => (i.storeLocationId || "loc-main") === storeLocationId);
    return items;
  }

  public getInventoryItemById(id: string): InventoryItem | undefined {
    return this.getInventoryItems().find((i) => i.id === id);
  }

  public saveInventoryItem(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt"> & { id?: string }): InventoryItem {
    const items = this.getInventoryItems();
    const now = new Date().toISOString();
    // normalize quantity from variants if present
    if (data.variants && data.variants.length > 0) {
      const total = data.variants.reduce((a, v) => a + (v.quantity || 0), 0);
      (data as any).quantity = total;
      (data as any).totalValue = total * ((data as any).purchasePrice || (data as any).unitPrice || 0);
    }
    if ((data as any).sellingPrice && !(data as any).unitPrice) (data as any).unitPrice = (data as any).sellingPrice;
    if ((data as any).unitPrice && !(data as any).sellingPrice) (data as any).sellingPrice = (data as any).unitPrice;
    if ((data as any).purchasePrice == null) (data as any).purchasePrice = (data as any).unitPrice || 0;
    if (!(data as any).unit) (data as any).unit = "pcs";
    if (data.id) {
      const index = items.findIndex((i) => i.id === data.id);
      if (index !== -1) {
        const updated: InventoryItem = { ...items[index], ...data, id: data.id, updatedAt: now } as InventoryItem;
        // status recalc
        updated.status = updated.quantity === 0 ? "OUT_OF_STOCK" : updated.quantity <= updated.minStock ? "LOW_STOCK" : "IN_STOCK";
        items[index] = updated;
        if (this.isBrowser()) localStorage.setItem(INVENTORY_ITEMS_STORAGE_KEY, JSON.stringify(items));
        // keep initial array in sync for SSR fallback
        const gIdx = initialInventoryItems.findIndex((i) => i.id === data.id);
        if (gIdx !== -1) initialInventoryItems[gIdx] = updated;
        return updated;
      }
    }
    const newId = `inv-${Date.now().toString(36)}`;
    const newItem: InventoryItem = { ...data, id: newId, createdAt: now, updatedAt: now } as InventoryItem;
    newItem.status = newItem.quantity === 0 ? "OUT_OF_STOCK" : newItem.quantity <= newItem.minStock ? "LOW_STOCK" : "IN_STOCK";
    items.unshift(newItem);
    initialInventoryItems.unshift(newItem);
    if (this.isBrowser()) localStorage.setItem(INVENTORY_ITEMS_STORAGE_KEY, JSON.stringify(items));
    return newItem;
  }

  public getStoreLocations(branchId?: string): StoreLocation[] {
    let locs = initialStoreLocations;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STORE_LOCATIONS_STORAGE_KEY);
        if (stored) locs = JSON.parse(stored);
        else localStorage.setItem(STORE_LOCATIONS_STORAGE_KEY, JSON.stringify(initialStoreLocations));
      } catch { locs = initialStoreLocations; }
    }
    if (!branchId || branchId === "all") return locs;
    return locs.filter((l) => l.branchId === "all" || l.branchId === branchId);
  }

  public getStoreLocationById(id: string): StoreLocation | undefined { return this.getStoreLocations().find((l) => l.id === id); }

  public saveStoreLocation(data: Omit<StoreLocation, "id"> & { id?: string }): StoreLocation {
    const locs = this.getStoreLocations();
    if (data.id) {
      const idx = locs.findIndex((l) => l.id === data.id);
      if (idx !== -1) { locs[idx] = { ...locs[idx], ...data, id: data.id } as StoreLocation; if (this.isBrowser()) localStorage.setItem(STORE_LOCATIONS_STORAGE_KEY, JSON.stringify(locs)); return locs[idx]; }
    }
    const newLoc: StoreLocation = { ...data, id: data.id || `loc-${Date.now().toString(36)}` } as StoreLocation;
    locs.push(newLoc);
    initialStoreLocations.push(newLoc);
    if (this.isBrowser()) localStorage.setItem(STORE_LOCATIONS_STORAGE_KEY, JSON.stringify(locs));
    return newLoc;
  }

  public getInventorySuppliers(): InventorySupplier[] {
    let sups = initialInventorySuppliers;
    if (this.isBrowser()) { try { const s = localStorage.getItem(INVENTORY_SUPPLIERS_STORAGE_KEY); if (s) sups = JSON.parse(s); else localStorage.setItem(INVENTORY_SUPPLIERS_STORAGE_KEY, JSON.stringify(initialInventorySuppliers)); } catch { sups = initialInventorySuppliers; } }
    return sups;
  }

  public saveInventorySupplier(data: Omit<InventorySupplier, "id" | "createdAt"> & { id?: string }): InventorySupplier {
    const sups = this.getInventorySuppliers();
    const now = new Date().toISOString();
    if (data.id) { const idx = sups.findIndex((s) => s.id === data.id); if (idx !== -1) { const upd = { ...sups[idx], ...data, id: data.id } as InventorySupplier; sups[idx] = upd; if (this.isBrowser()) localStorage.setItem(INVENTORY_SUPPLIERS_STORAGE_KEY, JSON.stringify(sups)); return upd; } }
    const newSup: InventorySupplier = { ...data, id: data.id || `sup-${Date.now().toString(36)}`, createdAt: now } as InventorySupplier;
    sups.push(newSup);
    initialInventorySuppliers.push(newSup);
    if (this.isBrowser()) localStorage.setItem(INVENTORY_SUPPLIERS_STORAGE_KEY, JSON.stringify(sups));
    return newSup;
  }

  public getPurchaseEntries(branchId?: string): PurchaseEntry[] {
    let entries = initialPurchaseEntries;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(PURCHASE_ENTRIES_STORAGE_KEY);
        if (stored) entries = JSON.parse(stored);
        else localStorage.setItem(PURCHASE_ENTRIES_STORAGE_KEY, JSON.stringify(initialPurchaseEntries));
      } catch { entries = initialPurchaseEntries; }
    }
    if (!branchId || branchId === "all") return entries;
    return entries.filter((e) => e.branchId === branchId);
  }

  public getInventoryTransactions(itemId?: string, branchId?: string): InventoryTransaction[] {
    let txns = initialInventoryTransactions;
    if (this.isBrowser()) { try { const stored = localStorage.getItem(INVENTORY_TRANSACTIONS_STORAGE_KEY); if (stored) txns = JSON.parse(stored); else localStorage.setItem(INVENTORY_TRANSACTIONS_STORAGE_KEY, JSON.stringify(initialInventoryTransactions)); } catch { txns = initialInventoryTransactions; } }
    if (itemId) txns = txns.filter((t) => t.itemId === itemId);
    if (branchId && branchId !== "all") txns = txns.filter((t) => t.branchId === branchId);
    return txns;
  }

  public saveInventoryTransaction(txn: InventoryTransaction): InventoryTransaction {
    const txns = this.getInventoryTransactions();
    txns.unshift(txn);
    initialInventoryTransactions.unshift(txn);
    if (this.isBrowser()) localStorage.setItem(INVENTORY_TRANSACTIONS_STORAGE_KEY, JSON.stringify(txns.slice(0, 500)));
    return txn;
  }

  public getStockAlerts(branchId?: string): StockAlert[] {
    let alerts = initialStockAlerts;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STOCK_ALERTS_STORAGE_KEY);
        if (stored) alerts = JSON.parse(stored);
        else localStorage.setItem(STOCK_ALERTS_STORAGE_KEY, JSON.stringify(initialStockAlerts));
      } catch { alerts = initialStockAlerts; }
    }
    // recompute live from items (variant-aware)
    const live: StockAlert[] = [];
    const items = this.getInventoryItems(branchId);
    for (const it of items) {
      if (it.variants && it.variants.length) {
        for (const v of it.variants) {
          if (v.quantity <= (v.minStock ?? it.minStock)) {
            live.push({ id: `sa-${it.id}-${v.size}`, itemId: it.id, itemName: it.name, itemSku: v.sku || it.sku, variantSize: v.size, currentQuantity: v.quantity, minStock: v.minStock ?? it.minStock, branchId: it.branchId, branchName: it.branchName, storeLocationId: it.storeLocationId, severity: v.quantity === 0 ? "CRITICAL" : "WARNING", createdAt: new Date().toISOString(), acknowledged: false });
          }
        }
      } else if (it.quantity <= it.minStock) {
        live.push({ id: `sa-${it.id}`, itemId: it.id, itemName: it.name, itemSku: it.sku, currentQuantity: it.quantity, minStock: it.minStock, branchId: it.branchId, branchName: it.branchName, storeLocationId: it.storeLocationId, severity: it.quantity === 0 ? "CRITICAL" : "WARNING", createdAt: new Date().toISOString(), acknowledged: false });
      }
    }
    // merge persisted acknowledged state
    for (const a of alerts) { if (a.acknowledged) { const m = live.find((l) => l.id === a.id); if (m) m.acknowledged = true; } }
    return live.length ? live : alerts.filter((a) => !a.acknowledged);
  }

  public acknowledgeStockAlert(alertId: string): void {
    const alerts = this.getStockAlerts();
    const all = initialStockAlerts;
    const target = all.find((a) => a.id === alertId);
    if (target) target.acknowledged = true;
    if (this.isBrowser()) localStorage.setItem(STOCK_ALERTS_STORAGE_KEY, JSON.stringify(all));
  }

  // ── Stock Entry (spec §4) ──
  public createStockEntry(params: { itemId: string; variantSize?: string; quantity: number; purchasePrice?: number; sellingPrice?: number; supplierId: string; invoiceNumber?: string; branchId: string; performedBy?: string; }): { item: InventoryItem; transaction: InventoryTransaction; purchase: PurchaseEntry } {
    const item = this.getInventoryItemById(params.itemId);
    if (!item) throw new Error("Item not found");
    const qty = Math.max(1, Math.floor(params.quantity));
    const prevQty = item.variants?.find((v) => v.size === params.variantSize)?.quantity ?? item.quantity;
    let newQty = prevQty;
    if (item.variants && params.variantSize) {
      const v = item.variants.find((x) => x.size === params.variantSize);
      if (!v) throw new Error("Variant size not found");
      v.quantity += qty;
      item.quantity = item.variants.reduce((a, b) => a + b.quantity, 0);
      newQty = v.quantity;
      if (params.purchasePrice) item.purchasePrice = params.purchasePrice;
      if (params.sellingPrice) { item.sellingPrice = params.sellingPrice; item.unitPrice = params.sellingPrice; }
    } else {
      item.quantity += qty;
      newQty = item.quantity;
      if (params.purchasePrice) item.purchasePrice = params.purchasePrice;
      if (params.sellingPrice) { item.sellingPrice = params.sellingPrice; item.unitPrice = params.sellingPrice; }
      item.totalValue = item.quantity * (item.purchasePrice || item.unitPrice);
    }
    item.quantity = Math.max(0, item.quantity);
    item.totalValue = item.quantity * (item.purchasePrice || item.unitPrice);
    item.status = item.quantity === 0 ? "OUT_OF_STOCK" : item.quantity <= item.minStock ? "LOW_STOCK" : "IN_STOCK";
    item.lastRestocked = new Date().toISOString().split("T")[0];
    item.updatedAt = new Date().toISOString();
    this.saveInventoryItem(item as any);
    const supplier = this.getInventorySuppliers().find((s) => s.id === params.supplierId);
    const txn: InventoryTransaction = { id: `txn-${Date.now().toString(36)}`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, type: "PURCHASE", quantity: qty, previousQuantity: prevQty, currentQuantity: newQty, branchId: item.branchId, branchName: item.branchName, storeLocationId: item.storeLocationId, storeLocationName: item.storeLocationName, performedBy: params.performedBy || "Store Manager", reason: `Stock Entry — ${supplier?.name || "Supplier"}${params.invoiceNumber ? ` (${params.invoiceNumber})` : ""}`, date: new Date().toISOString().split("T")[0] };
    this.saveInventoryTransaction(txn);
    const entries = this.getPurchaseEntries();
    const purchase: PurchaseEntry = { id: `pur-${Date.now().toString(36)}`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, supplierId: params.supplierId, supplierName: supplier?.name || "Supplier", quantity: qty, unitPrice: params.purchasePrice || item.purchasePrice, totalAmount: qty * (params.purchasePrice || item.purchasePrice), branchId: item.branchId, branchName: item.branchName, storeLocationId: item.storeLocationId, storeLocationName: item.storeLocationName, purchaseDate: new Date().toISOString().split("T")[0], status: "RECEIVED", invoiceNumber: params.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() };
    entries.unshift(purchase);
    initialPurchaseEntries.unshift(purchase);
    if (this.isBrowser()) localStorage.setItem(PURCHASE_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    this.addActivity({ user: { name: params.performedBy || "Store Manager", avatar: "", role: "STORE_MANAGER" }, action: "CREATE", module: "Inventory", entityName: `${item.name}${params.variantSize ? ` Size ${params.variantSize}` : ""}`, entityId: item.id, branchId: item.branchId, branchName: item.branchName, details: `Stock Entry: +${qty} ${item.unit} @ ₹${params.purchasePrice || item.purchasePrice} — ${supplier?.name || ""} ${params.invoiceNumber || ""}`, status: "SUCCESS" });
    return { item, transaction: txn, purchase };
  }

  // ── Stock Out / Issue (spec §5 — never negative) ──
  public createStockOut(params: { itemId: string; variantSize?: string; quantity: number; reason: string; recipientName?: string; recipientId?: string; performedBy?: string; branchId?: string; remarks?: string; }): { item: InventoryItem; transaction: InventoryTransaction } {
    const item = this.getInventoryItemById(params.itemId);
    if (!item) throw new Error("Item not found");
    const qty = Math.max(1, Math.floor(params.quantity));
    const targetQty = item.variants?.find((v) => v.size === params.variantSize)?.quantity ?? item.quantity;
    if (qty > targetQty) throw new Error(`Only ${targetQty} units available${params.variantSize ? ` for Size ${params.variantSize}` : ""}`);
    const prevQty = targetQty;
    let newQty = prevQty - qty;
    if (item.variants && params.variantSize) {
      const v = item.variants.find((x) => x.size === params.variantSize)!;
      v.quantity = newQty;
      item.quantity = item.variants.reduce((a, b) => a + b.quantity, 0);
    } else {
      item.quantity = newQty;
    }
    item.totalValue = item.quantity * (item.purchasePrice || item.unitPrice);
    item.status = item.quantity === 0 ? "OUT_OF_STOCK" : item.quantity <= item.minStock ? "LOW_STOCK" : "IN_STOCK";
    item.updatedAt = new Date().toISOString();
    this.saveInventoryItem(item as any);
    const typeMap: Record<string, InventoryTransaction["type"]> = { "Student Sale": "SALE", "Free Distribution": "ISSUE", "Staff Issue": "ISSUE", "Department Issue": "ISSUE", "Damaged Item": "DAMAGE", "Lost Item": "LOST", "Expired Item": "EXPIRED", "Return to Supplier": "RETURN" };
    const txn: InventoryTransaction = { id: `txn-${Date.now().toString(36)}`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, type: (typeMap[params.reason] || "ISSUE"), quantity: qty, previousQuantity: prevQty, currentQuantity: newQty, branchId: item.branchId, branchName: item.branchName, storeLocationId: item.storeLocationId, storeLocationName: item.storeLocationName, performedBy: params.performedBy || "Counter Staff", recipientName: params.recipientName, recipientId: params.recipientId, reason: params.remarks ? `${params.reason} — ${params.remarks}` : params.reason, date: new Date().toISOString().split("T")[0] };
    this.saveInventoryTransaction(txn);
    return { item, transaction: txn };
  }

  // ── POS / Store Sale (spec §6-8) — separate from Fee Payment ──
  public getStoreSales(branchId?: string, storeLocationId?: string): StoreSale[] {
    let sales: StoreSale[] = [];
    if (this.isBrowser()) { try { const s = localStorage.getItem(STORE_SALES_STORAGE_KEY); if (s) sales = JSON.parse(s); } catch { sales = []; } }
    if (branchId && branchId !== "all") sales = sales.filter((x) => x.branchId === branchId);
    if (storeLocationId && storeLocationId !== "ALL") sales = sales.filter((x) => x.storeLocationId === storeLocationId);
    return sales;
  }
  public getStoreSaleById(id: string): StoreSale | undefined { return this.getStoreSales().find((s) => s.id === id); }
  public getStudentPurchaseHistory(studentId: string): StoreSale[] { return this.getStoreSales().filter((s) => s.studentId === studentId); }

  public createStoreSale(params: { branchId: string; storeLocationId: string; studentId: string; items: { itemId: string; variantSize?: string; quantity: number }[]; paymentMethod: StoreSalePaymentMethod; discount?: number; createdBy?: string; notes?: string; }): StoreSale {
    const student = this.getStudents().find((s) => s.id === params.studentId);
    if (!student) throw new Error("Student not found");
    if (!params.items.length) throw new Error("Cart empty");
    const storeLoc = this.getStoreLocationById(params.storeLocationId) || this.getStoreLocations()[0];
    const saleItems: SaleItem[] = [];
    let subtotal = 0;
    // validate & deduct stock per item (atomic check first)
    for (const ci of params.items) {
      const it = this.getInventoryItemById(ci.itemId);
      if (!it) throw new Error(`Item ${ci.itemId} not found`);
      const avail = it.variants?.find((v) => v.size === ci.variantSize)?.quantity ?? it.quantity;
      if (ci.quantity > avail) throw new Error(`Insufficient stock for ${it.name}${ci.variantSize ? ` Size ${ci.variantSize}` : ""}: have ${avail}, need ${ci.quantity}`);
    }
    for (const ci of params.items) {
      const it = this.getInventoryItemById(ci.itemId)!;
      const prevQty = it.variants?.find((v) => v.size === ci.variantSize)?.quantity ?? it.quantity;
      const unitPrice = it.sellingPrice || it.unitPrice;
      const total = ci.quantity * unitPrice;
      subtotal += total;
      // deduct
      if (it.variants && ci.variantSize) {
        const v = it.variants.find((x) => x.size === ci.variantSize)!;
        v.quantity -= ci.quantity;
        it.quantity = it.variants.reduce((a, b) => a + b.quantity, 0);
      } else {
        it.quantity -= ci.quantity;
      }
      it.totalValue = it.quantity * (it.purchasePrice || unitPrice);
      it.status = it.quantity === 0 ? "OUT_OF_STOCK" : it.quantity <= it.minStock ? "LOW_STOCK" : "IN_STOCK";
      it.updatedAt = new Date().toISOString();
      this.saveInventoryItem(it as any);
      saleItems.push({ itemId: it.id, itemName: it.name, itemSku: it.sku, variantSize: ci.variantSize, quantity: ci.quantity, unitPrice, total });
      const txn: InventoryTransaction = { id: `txn-${Date.now().toString(36)}-${ci.itemId}`, itemId: it.id, itemName: it.name, itemSku: it.sku, variantSize: ci.variantSize, type: "SALE", quantity: ci.quantity, previousQuantity: prevQty, currentQuantity: prevQty - ci.quantity, branchId: it.branchId, branchName: it.branchName, storeLocationId: it.storeLocationId, storeLocationName: it.storeLocationName, performedBy: params.createdBy || "Counter Staff", recipientName: `${student.fullName} (${student.rollNumber})`, recipientId: student.id, reason: "Student Sale", date: new Date().toISOString().split("T")[0], referenceId: `sale-${Date.now().toString(36)}` };
      this.saveInventoryTransaction(txn);
    }
    const discount = Math.max(0, Math.min(params.discount || 0, subtotal));
    const totalAmount = subtotal - discount;
    const sale: StoreSale = { id: `sale-${Date.now().toString(36)}`, invoiceNumber: `SALE-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`, branchId: student.branchId, branchName: student.branchName, storeLocationId: storeLoc.id, storeLocationName: storeLoc.name, studentId: student.id, studentName: student.fullName, studentRoll: student.admissionNumber || student.rollNumber, studentClass: student.className, studentSection: student.sectionName, items: saleItems, subtotal, discount, totalAmount, paymentMethod: params.paymentMethod, paymentStatus: "PAID", date: new Date().toISOString(), createdBy: params.createdBy || "Counter Staff", notes: params.notes };
    const allSales = this.getStoreSales();
    allSales.unshift(sale);
    if (this.isBrowser()) localStorage.setItem(STORE_SALES_STORAGE_KEY, JSON.stringify(allSales.slice(0, 500)));
    this.addActivity({ user: { name: params.createdBy || "Counter Staff", avatar: "", role: "STORE_MANAGER" }, action: "PAYMENT", module: "Inventory", entityName: sale.invoiceNumber, entityId: sale.id, branchId: sale.branchId, branchName: sale.branchName, details: `POS Sale: ${saleItems.map((i) => `${i.quantity}× ${i.itemName}${i.variantSize ? ` Size ${i.variantSize}` : ""}`).join(", ")} → ${student.fullName} (${student.admissionNumber || student.rollNumber}) — ${sale.paymentMethod} ₹${totalAmount}`, status: "SUCCESS" });
    return sale;
  }

  public getStockTransfers(branchId?: string): StockTransfer[] {
    let transfers: StockTransfer[] = [];
    if (this.isBrowser()) { try { const t = localStorage.getItem(STOCK_TRANSFERS_STORAGE_KEY); if (t) transfers = JSON.parse(t); } catch { transfers = []; } }
    if (branchId && branchId !== "all") transfers = transfers.filter((x) => x.branchId === branchId);
    return transfers;
  }
  public createStockTransfer(params: { itemId: string; variantSize?: string; quantity: number; fromLocationId: string; toLocationId: string; performedBy?: string; notes?: string; }): StockTransfer {
    if (params.fromLocationId === params.toLocationId) throw new Error("Source and destination must differ");
    const item = this.getInventoryItemById(params.itemId);
    if (!item) throw new Error("Item not found");
    const fromLoc = this.getStoreLocationById(params.fromLocationId);
    const toLoc = this.getStoreLocationById(params.toLocationId);
    if (!fromLoc || !toLoc) throw new Error("Invalid store location");
    const avail = item.variants?.find((v) => v.size === params.variantSize)?.quantity ?? item.quantity;
    if (params.quantity > avail) throw new Error(`Only ${avail} available for transfer`);
    // For simplicity, stock is logically per-item total; transfer just logs and updates storeLocationName meta.
    // In a full multi-location ledger each location would have its own item row — here we log transfer and keep single row.
    const transfer: StockTransfer = { id: `trf-${Date.now().toString(36)}`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, fromLocationId: fromLoc.id, fromLocationName: fromLoc.name, toLocationId: toLoc.id, toLocationName: toLoc.name, quantity: params.quantity, date: new Date().toISOString().split("T")[0], performedBy: params.performedBy || "Store Manager", branchId: item.branchId, branchName: item.branchName, notes: params.notes };
    const all = this.getStockTransfers();
    all.unshift(transfer);
    if (this.isBrowser()) localStorage.setItem(STOCK_TRANSFERS_STORAGE_KEY, JSON.stringify(all.slice(0, 500)));
    // transactions: out + in
    this.saveInventoryTransaction({ id: `txn-${Date.now().toString(36)}-out`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, type: "TRANSFER_OUT", quantity: params.quantity, branchId: item.branchId, branchName: item.branchName, storeLocationId: fromLoc.id, storeLocationName: fromLoc.name, performedBy: params.performedBy || "Store Manager", reason: `Transfer → ${toLoc.name}`, date: transfer.date, referenceId: transfer.id });
    this.saveInventoryTransaction({ id: `txn-${Date.now().toString(36)}-in`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, type: "TRANSFER_IN", quantity: params.quantity, branchId: item.branchId, branchName: item.branchName, storeLocationId: toLoc.id, storeLocationName: toLoc.name, performedBy: params.performedBy || "Store Manager", reason: `Transfer ← ${fromLoc.name}`, date: transfer.date, referenceId: transfer.id });
    return transfer;
  }

  public getStockAdjustments(branchId?: string): StockAdjustment[] {
    let adj: StockAdjustment[] = [];
    if (this.isBrowser()) { try { const a = localStorage.getItem(STOCK_ADJUSTMENTS_STORAGE_KEY); if (a) adj = JSON.parse(a); } catch { adj = []; } }
    if (branchId && branchId !== "all") adj = adj.filter((x) => x.branchId === branchId);
    return adj;
  }
  public createStockAdjustment(params: { itemId: string; variantSize?: string; newQuantity: number; reason: string; performedBy?: string; }): StockAdjustment {
    const item = this.getInventoryItemById(params.itemId);
    if (!item) throw new Error("Item not found");
    const prevQty = item.variants?.find((v) => v.size === params.variantSize)?.quantity ?? item.quantity;
    const newQty = Math.max(0, Math.floor(params.newQuantity));
    if (item.variants && params.variantSize) {
      const v = item.variants.find((x) => x.size === params.variantSize)!;
      v.quantity = newQty;
      item.quantity = item.variants.reduce((a, b) => a + b.quantity, 0);
    } else {
      item.quantity = newQty;
    }
    item.totalValue = item.quantity * (item.purchasePrice || item.unitPrice);
    item.status = item.quantity === 0 ? "OUT_OF_STOCK" : item.quantity <= item.minStock ? "LOW_STOCK" : "IN_STOCK";
    item.updatedAt = new Date().toISOString();
    this.saveInventoryItem(item as any);
    const delta = newQty - prevQty;
    const adj: StockAdjustment = { id: `adj-${Date.now().toString(36)}`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, previousQuantity: prevQty, newQuantity: newQty, delta, reason: params.reason, performedBy: params.performedBy || "Store Manager", date: new Date().toISOString(), branchId: item.branchId };
    const all = this.getStockAdjustments();
    all.unshift(adj);
    if (this.isBrowser()) localStorage.setItem(STOCK_ADJUSTMENTS_STORAGE_KEY, JSON.stringify(all.slice(0, 500)));
    this.saveInventoryTransaction({ id: `txn-${Date.now().toString(36)}`, itemId: item.id, itemName: item.name, itemSku: item.sku, variantSize: params.variantSize, type: "ADJUSTMENT", quantity: Math.abs(delta), previousQuantity: prevQty, currentQuantity: newQty, branchId: item.branchId, branchName: item.branchName, storeLocationId: item.storeLocationId, storeLocationName: item.storeLocationName, performedBy: params.performedBy || "Store Manager", reason: `Adjustment: ${params.reason} (${prevQty} → ${newQty})`, date: adj.date.split("T")[0] });
    return adj;
  }

  public getReturnExchanges(branchId?: string): ReturnExchangeRecord[] {
    let list: ReturnExchangeRecord[] = [];
    if (this.isBrowser()) { try { const r = localStorage.getItem(RETURN_EXCHANGE_STORAGE_KEY); if (r) list = JSON.parse(r); } catch { list = []; } }
    if (branchId && branchId !== "all") list = list.filter((x) => x.branchId === branchId);
    return list;
  }
  public createReturnExchange(params: { saleId: string; oldItem: { itemId: string; variantSize?: string; quantity: number }; newItem?: { itemId: string; variantSize?: string; quantity: number }; reason?: string; performedBy?: string; }): ReturnExchangeRecord {
    const sale = this.getStoreSaleById(params.saleId);
    if (!sale) throw new Error("Original sale not found");
    const oldIt = this.getInventoryItemById(params.oldItem.itemId);
    if (!oldIt) throw new Error("Old item not found");
    // return old size +1
    this.createStockEntry({ itemId: oldIt.id, variantSize: params.oldItem.variantSize, quantity: params.oldItem.quantity, supplierId: oldIt.supplierId, branchId: oldIt.branchId, performedBy: params.performedBy || "Counter Staff" } as any);
    // if exchange, deduct new size -1
    let newSaleItem: SaleItem | undefined;
    if (params.newItem) {
      const newIt = this.getInventoryItemById(params.newItem.itemId);
      if (!newIt) throw new Error("New item not found");
      // use stockOut to validate
      this.createStockOut({ itemId: newIt.id, variantSize: params.newItem.variantSize, quantity: params.newItem.quantity, reason: "Return & Exchange", performedBy: params.performedBy, branchId: newIt.branchId, remarks: `Exchange for ${oldIt.name} Size ${params.oldItem.variantSize || ""}` });
      newSaleItem = { itemId: newIt.id, itemName: newIt.name, itemSku: newIt.sku, variantSize: params.newItem.variantSize, quantity: params.newItem.quantity, unitPrice: newIt.sellingPrice || newIt.unitPrice, total: params.newItem.quantity * (newIt.sellingPrice || newIt.unitPrice) };
    }
    const oldSaleItem: SaleItem = { itemId: oldIt.id, itemName: oldIt.name, itemSku: oldIt.sku, variantSize: params.oldItem.variantSize, quantity: params.oldItem.quantity, unitPrice: oldIt.sellingPrice || oldIt.unitPrice, total: params.oldItem.quantity * (oldIt.sellingPrice || oldIt.unitPrice) };
    const rec: ReturnExchangeRecord = { id: `ret-${Date.now().toString(36)}`, saleId: sale.id, invoiceNumber: sale.invoiceNumber, studentId: sale.studentId, studentName: sale.studentName, type: params.newItem ? "EXCHANGE" : "RETURN", oldItem: oldSaleItem, newItem: newSaleItem, reason: params.reason || "Size exchange", date: new Date().toISOString(), performedBy: params.performedBy || "Counter Staff", branchId: sale.branchId };
    const all = this.getReturnExchanges();
    all.unshift(rec);
    if (this.isBrowser()) localStorage.setItem(RETURN_EXCHANGE_STORAGE_KEY, JSON.stringify(all.slice(0, 300)));
    this.saveInventoryTransaction({ id: `txn-${Date.now().toString(36)}`, itemId: oldIt.id, itemName: oldIt.name, itemSku: oldIt.sku, variantSize: params.oldItem.variantSize, type: params.newItem ? "EXCHANGE" : "RETURN", quantity: params.oldItem.quantity, branchId: oldIt.branchId, branchName: oldIt.branchName, performedBy: params.performedBy || "Counter Staff", recipientName: sale.studentName, recipientId: sale.studentId, reason: params.newItem ? `Exchange ${params.oldItem.variantSize} → ${params.newItem.variantSize}` : `Return ${params.oldItem.variantSize}`, date: new Date().toISOString().split("T")[0], referenceId: rec.id });
    return rec;
  }

  // ── Purchase Requests ──
  public getPurchaseRequests(branchId?: string): PurchaseRequest[] {
    let list = initialPurchaseRequests;
    if (this.isBrowser()) { try { const s = localStorage.getItem(PURCHASE_REQUESTS_STORAGE_KEY); if (s) list = JSON.parse(s); else localStorage.setItem(PURCHASE_REQUESTS_STORAGE_KEY, JSON.stringify(initialPurchaseRequests)); } catch { list = initialPurchaseRequests; } }
    if (!branchId || branchId === "all") return list;
    return list.filter((r) => r.branchId === branchId || r.branchId === "all");
  }
  public savePurchaseRequest(data: Omit<PurchaseRequest, "id" | "createdAt" | "updatedAt"> & { id?: string }): PurchaseRequest {
    const list = this.getPurchaseRequests();
    const now = new Date().toISOString();
    if (data.id) { const idx = list.findIndex((x) => x.id === data.id); if (idx !== -1) { const upd = { ...list[idx], ...data, id: data.id, updatedAt: now } as PurchaseRequest; list[idx] = upd; const g = initialPurchaseRequests.findIndex((x) => x.id === data.id); if (g !== -1) initialPurchaseRequests[g] = upd; if (this.isBrowser()) localStorage.setItem(PURCHASE_REQUESTS_STORAGE_KEY, JSON.stringify(list)); return upd; } }
    const rec: PurchaseRequest = { ...data, id: `pr-${Date.now().toString(36)}`, createdAt: now, updatedAt: now } as PurchaseRequest;
    list.unshift(rec); initialPurchaseRequests.unshift(rec); if (this.isBrowser()) localStorage.setItem(PURCHASE_REQUESTS_STORAGE_KEY, JSON.stringify(list)); return rec;
  }

  // ── Assets ──
  public getAssets(branchId?: string): Asset[] {
    let list = initialAssets;
    if (this.isBrowser()) { try { const s = localStorage.getItem(ASSETS_STORAGE_KEY); if (s) list = JSON.parse(s); else localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(initialAssets)); } catch { list = initialAssets; } }
    if (!branchId || branchId === "all") return list;
    return list.filter((a) => a.branchId === branchId);
  }
  public saveAsset(data: Omit<Asset, "id" | "createdAt" | "updatedAt"> & { id?: string }): Asset {
    const list = this.getAssets();
    const now = new Date().toISOString();
    if (data.id) { const idx = list.findIndex((x) => x.id === data.id); if (idx !== -1) { const upd = { ...list[idx], ...data, id: data.id, updatedAt: now } as Asset; list[idx] = upd; const g = initialAssets.findIndex((x) => x.id === data.id); if (g !== -1) initialAssets[g] = upd; if (this.isBrowser()) localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(list)); return upd; } }
    const rec: Asset = { ...data, id: `ast-${Date.now().toString(36)}`, createdAt: now, updatedAt: now } as Asset;
    list.unshift(rec); initialAssets.unshift(rec); if (this.isBrowser()) localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(list)); return rec;
  }
  public getAssetMaintenance(branchId?: string): AssetMaintenance[] {
    let list = initialAssetMaintenance;
    if (this.isBrowser()) { try { const s = localStorage.getItem(ASSET_MAINT_STORAGE_KEY); if (s) list = JSON.parse(s); else localStorage.setItem(ASSET_MAINT_STORAGE_KEY, JSON.stringify(initialAssetMaintenance)); } catch { list = initialAssetMaintenance; } }
    if (!branchId || branchId === "all") return list;
    return list.filter((a) => a.branchId === branchId);
  }
  public saveAssetMaintenance(data: Omit<AssetMaintenance, "id" | "createdAt"> & { id?: string }): AssetMaintenance {
    const list = this.getAssetMaintenance();
    const now = new Date().toISOString();
    if (data.id) { const idx = list.findIndex((x) => x.id === data.id); if (idx !== -1) { const upd = { ...list[idx], ...data, id: data.id } as AssetMaintenance; list[idx] = upd; const g = initialAssetMaintenance.findIndex((x) => x.id === data.id); if (g !== -1) initialAssetMaintenance[g] = upd; if (this.isBrowser()) localStorage.setItem(ASSET_MAINT_STORAGE_KEY, JSON.stringify(list)); return upd; } }
    const rec: AssetMaintenance = { ...data, id: `mnt-${Date.now().toString(36)}`, createdAt: now } as AssetMaintenance;
    list.unshift(rec); initialAssetMaintenance.unshift(rec); if (this.isBrowser()) localStorage.setItem(ASSET_MAINT_STORAGE_KEY, JSON.stringify(list)); return rec;
  }

  // ==================== EXPENSES ====================
  public getExpenseCategories(): ExpenseCategory[] { return initialExpenseCategories; }

  public getExpenseEntries(branchId?: string): ExpenseEntry[] {
    let entries = initialExpenseEntries;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(EXPENSE_ENTRIES_STORAGE_KEY);
        if (stored) entries = JSON.parse(stored);
        else localStorage.setItem(EXPENSE_ENTRIES_STORAGE_KEY, JSON.stringify(initialExpenseEntries));
      } catch { entries = initialExpenseEntries; }
    }
    if (!branchId || branchId === "all") return entries;
    return entries.filter((e) => e.branchId === branchId || e.branchId === "all");
  }

  public getExpenseById(id: string): ExpenseEntry | undefined {
    return this.getExpenseEntries().find((e) => e.id === id);
  }

  public saveExpense(data: Omit<ExpenseEntry, "id" | "createdAt" | "updatedAt"> & { id?: string }): ExpenseEntry {
    const entries = this.getExpenseEntries();
    const now = new Date().toISOString();
    if (data.id) {
      const index = entries.findIndex((e) => e.id === data.id);
      if (index !== -1) {
        const updated: ExpenseEntry = { ...entries[index], ...data, id: data.id, updatedAt: now };
        entries[index] = updated;
        if (this.isBrowser()) localStorage.setItem(EXPENSE_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
        return updated;
      }
    }
    const newId = `exp-${Date.now().toString(36)}`;
    const newEntry: ExpenseEntry = { ...data, id: newId, createdAt: now, updatedAt: now };
    entries.unshift(newEntry);
    if (this.isBrowser()) localStorage.setItem(EXPENSE_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  }

  public getMonthlyExpenseSummary(): MonthlyExpenseSummary[] { return initialMonthlyExpenseSummary; }

  // ==================== PAYROLL ====================
  public getSalaryStructures(): SalaryStructure[] {
    let list = initialSalaryStructures;
    if (typeof window !== "undefined") {
      try {
        const s = localStorage.getItem("school_erp_salary_structures_v1");
        if (s) list = JSON.parse(s);
        else localStorage.setItem("school_erp_salary_structures_v1", JSON.stringify(initialSalaryStructures));
      } catch {}
    }
    return list;
  }
  public saveSalaryStructure(data: SalaryStructure): SalaryStructure {
    const list = this.getSalaryStructures();
    const allowances = data.allowances ?? [];
    const deductions = data.deductions ?? [];
    const gross = data.baseSalary + allowances.reduce((a, b) => a + b.amount, 0);
    const totalDed = deductions.reduce((a, b) => a + b.amount, 0);
    const rec = { ...data, grossSalary: gross, netSalary: gross - totalDed, totalDeductions: totalDed } as SalaryStructure;
    const idx = list.findIndex((s) => s.id === data.id);
    if (idx >= 0) list[idx] = rec;
    else list.unshift(rec);
    const gIdx = initialSalaryStructures.findIndex((s) => s.id === data.id);
    if (gIdx >= 0) initialSalaryStructures[gIdx] = rec;
    else initialSalaryStructures.unshift(rec);
    if (typeof window !== "undefined") localStorage.setItem("school_erp_salary_structures_v1", JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("payroll:updated"));
    return rec;
  }

  public getPayrollRecords(branchId?: string): PayrollRecord[] {
    let records = initialPayrollRecords;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(PAYROLL_RECORDS_STORAGE_KEY);
        if (stored) records = JSON.parse(stored);
        else localStorage.setItem(PAYROLL_RECORDS_STORAGE_KEY, JSON.stringify(initialPayrollRecords));
      } catch { records = initialPayrollRecords; }
    }
    if (!branchId || branchId === "all") return records;
    return records.filter((r) => r.branchId === branchId);
  }

  public getPayrollById(id: string): PayrollRecord | undefined {
    return this.getPayrollRecords().find((r) => r.id === id);
  }

  public savePayroll(data: Omit<PayrollRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }): PayrollRecord {
    const records = this.getPayrollRecords();
    const now = new Date().toISOString();
    if (data.id) {
      const index = records.findIndex((r) => r.id === data.id);
      if (index !== -1) {
        const updated: PayrollRecord = { ...records[index], ...data, id: data.id, updatedAt: now };
        records[index] = updated;
        if (this.isBrowser()) localStorage.setItem(PAYROLL_RECORDS_STORAGE_KEY, JSON.stringify(records));
        return updated;
      }
    }
    const newId = `pay-${Date.now().toString(36)}`;
    const newRecord: PayrollRecord = { ...data, id: newId, createdAt: now, updatedAt: now };
    records.unshift(newRecord);
    if (this.isBrowser()) localStorage.setItem(PAYROLL_RECORDS_STORAGE_KEY, JSON.stringify(records));
    return newRecord;
  }

  // ==================== DOCUMENTS ====================
  public getDocuments(branchId?: string, ownerType?: string): DocumentRecord[] {
    let docs = initialDocuments;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
        if (stored) docs = JSON.parse(stored);
        else localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(initialDocuments));
      } catch { docs = initialDocuments; }
    }
    if (branchId && branchId !== "all") docs = docs.filter((d) => d.branchId === branchId);
    if (ownerType) docs = docs.filter((d) => d.ownerType === ownerType);
    return docs;
  }

  public getDocumentById(id: string): DocumentRecord | undefined {
    return this.getDocuments().find((d) => d.id === id);
  }

  public saveDocument(data: Omit<DocumentRecord, "id" | "createdAt" | "updatedAt"> & { id?: string }): DocumentRecord {
    const docs = this.getDocuments();
    const now = new Date().toISOString();
    if (data.id) {
      const index = docs.findIndex((d) => d.id === data.id);
      if (index !== -1) {
        const updated: DocumentRecord = { ...docs[index], ...data, id: data.id, updatedAt: now };
        docs[index] = updated;
        if (this.isBrowser()) localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
        return updated;
      }
    }
    const newId = `doc-${Date.now().toString(36)}`;
    const newDoc: DocumentRecord = { ...data, id: newId, createdAt: now, updatedAt: now };
    docs.unshift(newDoc);
    if (this.isBrowser()) localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    return newDoc;
  }

  // ==================== TEST CASES ====================
  public getTestCases(moduleFilter?: string, statusFilter?: string, assigneeFilter?: string): TestCase[] {
    let cases = initialTestCases;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TEST_CASES_STORAGE_KEY);
        if (stored) cases = JSON.parse(stored);
        else localStorage.setItem(TEST_CASES_STORAGE_KEY, JSON.stringify(initialTestCases));
      } catch { cases = initialTestCases; }
    }
    if (moduleFilter && moduleFilter !== "ALL") cases = cases.filter((c) => c.module === moduleFilter);
    if (statusFilter && statusFilter !== "ALL") cases = cases.filter((c) => c.status === statusFilter);
    if (assigneeFilter && assigneeFilter !== "ALL") cases = cases.filter((c) => c.assignee === assigneeFilter);
    return cases;
  }

  public getTestCaseById(id: string): TestCase | undefined {
    return this.getTestCases().find((c) => c.id === id);
  }

  public saveTestCase(data: Omit<TestCase, "id" | "createdAt" | "updatedAt"> & { id?: string }): TestCase {
    const cases = this.getTestCases();
    const now = new Date().toISOString();
    if (data.id) {
      const index = cases.findIndex((c) => c.id === data.id);
      if (index !== -1) {
        const updated: TestCase = { ...cases[index], ...data, id: data.id, updatedAt: now };
        cases[index] = updated;
        if (this.isBrowser()) localStorage.setItem(TEST_CASES_STORAGE_KEY, JSON.stringify(cases));
        return updated;
      }
    }
    const newId = `tc-${Date.now().toString(36)}`;
    const newCase: TestCase = { ...data, id: newId, createdAt: now, updatedAt: now };
    cases.unshift(newCase);
    if (this.isBrowser()) localStorage.setItem(TEST_CASES_STORAGE_KEY, JSON.stringify(cases));
    return newCase;
  }

  public getTestSuites(): TestSuite[] {
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TEST_SUITES_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(TEST_SUITES_STORAGE_KEY, JSON.stringify(initialTestSuites));
      } catch {}
    }
    return initialTestSuites;
  }

  public getTestPlans(): TestPlan[] {
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TEST_PLANS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(TEST_PLANS_STORAGE_KEY, JSON.stringify(initialTestPlans));
      } catch {}
    }
    return initialTestPlans;
  }

  public getTestRuns(): TestRun[] {
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(TEST_RUNS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(TEST_RUNS_STORAGE_KEY, JSON.stringify(initialTestRuns));
      } catch {}
    }
    return initialTestRuns;
  }

  // ==================== BUGS ====================
  public getBugs(statusFilter?: string, priorityFilter?: string, moduleFilter?: string): Bug[] {
    let bugs = initialBugs;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(BUGS_STORAGE_KEY);
        if (stored) bugs = JSON.parse(stored);
        else localStorage.setItem(BUGS_STORAGE_KEY, JSON.stringify(initialBugs));
      } catch { bugs = initialBugs; }
    }
    if (statusFilter && statusFilter !== "ALL") bugs = bugs.filter((b) => b.status === statusFilter);
    if (priorityFilter && priorityFilter !== "ALL") bugs = bugs.filter((b) => b.priority === priorityFilter);
    if (moduleFilter && moduleFilter !== "ALL") bugs = bugs.filter((b) => b.module === moduleFilter);
    return bugs;
  }

  public getBugById(id: string): Bug | undefined {
    return this.getBugs().find((b) => b.id === id);
  }

  public saveBug(data: Omit<Bug, "id" | "createdAt" | "updatedAt" | "comments"> & { id?: string; comments?: BugComment[] }): Bug {
    const bugs = this.getBugs();
    const now = new Date().toISOString();
    if (data.id) {
      const index = bugs.findIndex((b) => b.id === data.id);
      if (index !== -1) {
        const updated: Bug = { ...bugs[index], ...data, id: data.id, updatedAt: now };
        bugs[index] = updated;
        if (this.isBrowser()) localStorage.setItem(BUGS_STORAGE_KEY, JSON.stringify(bugs));
        return updated;
      }
    }
    const newId = `BUG-${Date.now().toString(36).toUpperCase()}`;
    const newBug: Bug = { ...data, id: newId, comments: data.comments || [], createdAt: now, updatedAt: now };
    bugs.unshift(newBug);
    if (this.isBrowser()) localStorage.setItem(BUGS_STORAGE_KEY, JSON.stringify(bugs));
    return newBug;
  }

  public addBugComment(bugId: string, comment: Omit<BugComment, "id" | "timestamp">): Bug {
    const bug = this.getBugById(bugId);
    if (!bug) throw new Error("Bug not found");
    const newComment: BugComment = {
      ...comment,
      id: `bc-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };
    return this.saveBug({ ...bug, id: bug.id, comments: [...bug.comments, newComment] });
  }

  public getBugActivityLogs(bugId: string) {
    return initialBugActivityLogs.filter((l) => l.bugId === bugId);
  }

  public getQADashboardMetrics() {
    return initialQADashboardMetrics;
  }

  // ==================== BUILDS ====================
  public getBuilds(branchFilter?: string, statusFilter?: string, envFilter?: string): Build[] {
    let builds = initialBuilds;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(BUILDS_STORAGE_KEY);
        if (stored) builds = JSON.parse(stored);
        else localStorage.setItem(BUILDS_STORAGE_KEY, JSON.stringify(initialBuilds));
      } catch { builds = initialBuilds; }
    }
    if (branchFilter && branchFilter !== "ALL") builds = builds.filter((b) => b.branch === branchFilter);
    if (statusFilter && statusFilter !== "ALL") builds = builds.filter((b) => b.status === statusFilter);
    if (envFilter && envFilter !== "ALL") builds = builds.filter((b) => b.environment === envFilter);
    return builds;
  }

  public getBuildById(id: string): Build | undefined {
    return this.getBuilds().find((b) => b.id === id);
  }

  public getDeployments(envFilter?: string, statusFilter?: string): Deployment[] {
    let deps = initialDeployments;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(DEPLOYMENTS_STORAGE_KEY);
        if (stored) deps = JSON.parse(stored);
        else localStorage.setItem(DEPLOYMENTS_STORAGE_KEY, JSON.stringify(initialDeployments));
      } catch { deps = initialDeployments; }
    }
    if (envFilter && envFilter !== "ALL") deps = deps.filter((d) => d.environment === envFilter);
    if (statusFilter && statusFilter !== "ALL") deps = deps.filter((d) => d.status === statusFilter);
    return deps;
  }

  public getDeploymentById(id: string): Deployment | undefined {
    return this.getDeployments().find((d) => d.id === id);
  }

  public getCICDIntegrations(): CICDIntegration[] {
    return initialCICDIntegrations;
  }

  public getBuildMetrics(): BuildMetrics {
    return initialBuildMetrics;
  }

  // ==================== AUDIT LOGS ====================
  public getAuditLogs(actionFilter?: string, moduleFilter?: string, userFilter?: string): AuditLog[] {
    let logs = initialAuditLogs;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
        if (stored) logs = JSON.parse(stored);
        else localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(initialAuditLogs));
      } catch { logs = initialAuditLogs; }
    }
    if (actionFilter && actionFilter !== "ALL") logs = logs.filter((l) => l.action === actionFilter);
    if (moduleFilter && moduleFilter !== "ALL") logs = logs.filter((l) => l.module === moduleFilter);
    if (userFilter && userFilter !== "ALL") logs = logs.filter((l) => l.user === userFilter);
    return logs;
  }

  public getModuleHealth(): ModuleHealth[] {
    return initialModuleHealth;
  }

  public getEngineeringDashboardData() {
    const qaMetrics = this.getQADashboardMetrics();
    const builds = this.getBuilds();
    const deployments = this.getDeployments();
    const currentBuild = builds[0];
    return {
      currentBuild: currentBuild ? { number: currentBuild.buildNumber, branch: currentBuild.branch, status: currentBuild.status, commit: currentBuild.commitHash, startedAt: currentBuild.startedAt } : null,
      deploymentStatus: deployments.slice(0, 3).map((d) => ({ environment: d.environment, version: d.version, status: d.status, deployedAt: d.startedAt })),
      testPassRate: qaMetrics.passRate,
      failedTests: qaMetrics.failedTests,
      openBugs: qaMetrics.openBugs,
      criticalBugs: qaMetrics.criticalBugs,
      recentDeployments: deployments.slice(0, 5).map((d) => ({ version: d.version, environment: d.environment, status: d.status, date: d.startedAt })),
      recentAuditEvents: this.getAuditLogs().slice(0, 5),
      moduleHealth: this.getModuleHealth(),
    };
  }

  // ==================== SESSION ====================
  public getSession(): UserSession {
    if (!this.isBrowser()) return defaultUserSession;
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      return defaultUserSession;
    } catch {
      return defaultUserSession;
    }
  }

  public saveSession(session: UserSession): void {
    if (this.isBrowser()) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  }

  // ==================== GLOBAL SEARCH ====================
  public searchEntities(query: string): SearchResultItem[] {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResultItem[] = [];

    // Branches
    for (const b of this.getBranches()) {
      if (b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.principalName.toLowerCase().includes(q)) {
        results.push({
          id: b.id,
          title: b.name,
          subtitle: `${b.code} • ${b.type} • Principal: ${b.principalName}`,
          category: "Branch",
          href: `/branches/${b.id}`,
          icon: "Building2",
          badge: b.status,
        });
      }
    }

    // Students
    for (const s of this.getStudents()) {
      if (s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          title: s.fullName,
          subtitle: `${s.rollNumber} • ${s.className} (${s.sectionName}) • ${s.branchName}`,
          category: "Student",
          href: `/students/${s.id}`,
          icon: "GraduationCap",
          badge: s.status,
        });
      }
    }

    // Teachers
    for (const t of this.getTeachers()) {
      if (t.fullName.toLowerCase().includes(q) || t.department.toLowerCase().includes(q) || t.subjectsTaught.some((sub) => sub.toLowerCase().includes(q))) {
        results.push({
          id: t.id,
          title: t.fullName,
          subtitle: `${t.designation} • ${t.department} • ${t.branchName}`,
          category: "Teacher",
          href: `/teachers/${t.id}`,
          icon: "Users",
          badge: t.department,
        });
      }
    }

    // Admissions
    for (const a of this.getAdmissions()) {
      if (a.applicantFullName.toLowerCase().includes(q) || a.applicationNumber.toLowerCase().includes(q)) {
        results.push({
          id: a.id,
          title: a.applicantFullName,
          subtitle: `Application ${a.applicationNumber} • ${a.gradeApplied} • Status: ${a.status}`,
          category: "Admission",
          href: `/admissions/${a.id}`,
          icon: "UserPlus",
          badge: a.status,
        });
      }
    }

    // Classes
    for (const c of this.getClasses()) {
      if (c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        results.push({
          id: c.id,
          title: `${c.name} (${c.branchName})`,
          subtitle: `${c.category} • ${c.sections.length} Sections • ${c.totalStudents} Students`,
          category: "Class",
          href: `/classes`,
          icon: "BookOpen",
        });
      }
    }

    // Vehicles
    for (const v of this.getVehicles()) {
      if (v.registrationNumber.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)) {
        results.push({
          id: v.id,
          title: `${v.brand} ${v.model} (${v.registrationNumber})`,
          subtitle: `${v.vehicleType} • Capacity: ${v.capacity} • ${v.branchName}`,
          category: "Transport" as any,
          href: `/transport/${v.id}`,
          icon: "Bus",
          badge: v.status,
        });
      }
    }

    // Transport Routes
    for (const r of this.getTransportRoutes()) {
      if (r.routeName.toLowerCase().includes(q) || r.routeNumber.toLowerCase().includes(q)) {
        results.push({
          id: r.id,
          title: `${r.routeName} (${r.routeNumber})`,
          subtitle: `${r.branchName} • ${r.studentCount} Students • ${r.stops.length} Stops`,
          category: "Transport" as any,
          href: `/transport/${r.id}`,
          icon: "Bus",
          badge: r.status,
        });
      }
    }

    // Homework
    for (const h of this.getHomeworkList()) {
      if (h.title.toLowerCase().includes(q) || h.subjectName.toLowerCase().includes(q)) {
        results.push({
          id: h.id,
          title: h.title,
          subtitle: `${h.subjectName} • ${h.className} • Due: ${h.dueDate}`,
          category: "Navigation" as any,
          href: `/homework/${h.id}`,
          icon: "ClipboardList",
          badge: h.status,
        });
      }
    }

    // Exam Schedules
    for (const es of this.getExamSchedules()) {
      if (es.examName.toLowerCase().includes(q) || es.subjectName.toLowerCase().includes(q)) {
        results.push({
          id: es.id,
          title: es.examName,
          subtitle: `${es.className} • ${es.branchName} • ${es.examDate}`,
          category: "Navigation" as any,
          href: `/exams/${es.id}`,
          icon: "FileSpreadsheet",
          badge: es.status,
        });
      }
    }

    // Navigation routes
    const navRoutes = [
      { title: "Dashboard Overview", subtitle: "KPIs, charts & analytics", href: "/", category: "Navigation" as const, icon: "LayoutDashboard" },
      { title: "Campus Branches", subtitle: "Campus list, facilities & stats", href: "/branches", category: "Navigation" as const, icon: "Building2" },
      { title: "Admissions Management", subtitle: "Applications & pipeline review", href: "/admissions", category: "Navigation" as const, icon: "UserPlus" },
      { title: "Student Roster", subtitle: "Student profiles & records", href: "/students", category: "Navigation" as const, icon: "GraduationCap" },
      { title: "Classes & Sections", subtitle: "Curriculum, sections & teachers", href: "/classes", category: "Navigation" as const, icon: "BookOpen" },
      { title: "Faculty & Teachers", subtitle: "Faculty directory & profiles", href: "/teachers", category: "Navigation" as const, icon: "Users" },
      { title: "Timetable Schedule", subtitle: "Weekly class & teacher timetables", href: "/timetable", category: "Navigation" as const, icon: "CalendarDays" },
      { title: "Homework Assignments", subtitle: "Homework, submissions & grading", href: "/homework", category: "Navigation" as const, icon: "ClipboardList" },
      { title: "Exams & Results", subtitle: "Exam schedules, marks & report cards", href: "/exams", category: "Navigation" as const, icon: "FileSpreadsheet" },
      { title: "Transport & Fleet", subtitle: "Vehicles, routes & student transport", href: "/transport", category: "Navigation" as const, icon: "Bus" },
      { title: "Announcements", subtitle: "School-wide announcements & notices", href: "/announcements", category: "Navigation" as const, icon: "Megaphone" },
      { title: "Messages", subtitle: "Parent-teacher & internal messaging", href: "/messages", category: "Navigation" as const, icon: "MessageSquare" },
      { title: "Notifications Center", subtitle: "Notification preferences & history", href: "/notifications", category: "Navigation" as const, icon: "Bell" },
      { title: "Events Calendar", subtitle: "School events, meetings & reminders", href: "/events", category: "Navigation" as const, icon: "Calendar" },
      { title: "Inventory & Stock", subtitle: "Items, suppliers, purchases & alerts", href: "/inventory", category: "Navigation" as const, icon: "Package" },
      { title: "Expenses & Ledger", subtitle: "Expense tracking, approval & budgets", href: "/expenses", category: "Navigation" as const, icon: "Receipt" },
      { title: "Payroll Management", subtitle: "Salary structures, payslips & history", href: "/payroll", category: "Navigation" as const, icon: "Briefcase" },
      { title: "Document Center", subtitle: "Employee & student document management", href: "/documents", category: "Navigation" as const, icon: "FileText" },
      { title: "Reports & Analytics", subtitle: "Institution-wide analytics dashboard", href: "/reports", category: "Navigation" as const, icon: "BarChart3" },
      { title: "QA & Bug Tracker", subtitle: "Test cases, bug tracking & QA metrics", href: "/qa", category: "Navigation" as const, icon: "ClipboardList" },
      { title: "Builds", subtitle: "CI/CD build history and pipeline status", href: "/builds", category: "Navigation" as const, icon: "Rocket" },
      { title: "Deployments", subtitle: "Deployment history across environments", href: "/deployments", category: "Navigation" as const, icon: "Server" },
      { title: "Audit Logs", subtitle: "Activity log, user actions & audit trail", href: "/audit", category: "Navigation" as const, icon: "ShieldAlert" },
      { title: "Engineering Dashboard", subtitle: "Build, deployment, QA & health overview", href: "/engineering", category: "Navigation" as const, icon: "Rocket" },
    ];

    for (const r of navRoutes) {
      if (r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)) {
        results.push({
          id: `nav-${r.title}`,
          title: r.title,
          subtitle: r.subtitle,
          category: r.category,
          href: r.href,
          icon: r.icon,
        });
      }
    }

    return results;
  }

  // ==================== AGGREGATED STATS ====================
  public getAggregatedStats(branchId: string = "all") {
    const branches = this.getBranches();
    const filteredBranches = branchId === "all" ? branches : branches.filter((b) => b.id === branchId);

    const totalStudents = filteredBranches.reduce((acc, b) => acc + b.totalStudents, 0);
    const totalCapacity = filteredBranches.reduce((acc, b) => acc + b.capacity, 0);
    const totalTeachers = filteredBranches.reduce((acc, b) => acc + b.totalTeachers, 0);
    const totalStaff = filteredBranches.reduce((acc, b) => acc + b.totalStaff, 0);
    const totalWorkers = filteredBranches.reduce((acc, b) => acc + b.totalWorkers, 0);
    const monthlyRevenue = filteredBranches.reduce((acc, b) => acc + b.monthlyRevenue, 0);
    const monthlyExpenses = filteredBranches.reduce((acc, b) => acc + b.monthlyExpenses, 0);

    const avgAttendance =
      filteredBranches.length > 0
        ? (filteredBranches.reduce((acc, b) => acc + b.attendanceRate, 0) / filteredBranches.length).toFixed(1)
        : "0.0";

    const avgFeeRate =
      filteredBranches.length > 0
        ? (filteredBranches.reduce((acc, b) => acc + b.feeCollectionRate, 0) / filteredBranches.length).toFixed(1)
        : "0.0";

    const occupancyRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
    const admissions = this.getAdmissions(branchId);
    const pendingAdmissions = admissions.filter((a) => a.status === "NEW" || a.status === "UNDER_REVIEW" || a.status === "INTERVIEW_SCHEDULED").length;

    return {
      branchCount: filteredBranches.length,
      totalStudents,
      totalCapacity,
      occupancyRate,
      totalTeachers,
      totalStaff,
      totalWorkers,
      totalEmployees: totalTeachers + totalStaff + totalWorkers,
      monthlyRevenue,
      monthlyExpenses,
      netOperatingIncome: monthlyRevenue - monthlyExpenses,
      attendanceRate: parseFloat(avgAttendance),
      feeCollectionRate: parseFloat(avgFeeRate),
      pendingAdmissions: pendingAdmissions || 6,
      activeBusRoutes: branchId === "all" ? 42 : 7,
    };
  }
}

export const mockDb = new MockDatabaseService();
