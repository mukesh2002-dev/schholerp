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
  ExamType,
  ExamSchedule,
  MarkEntry,
  GradeScale,
  Result,
  Vehicle,
  TransportRoute,
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
import { initialExamTypes, initialExamSchedules, initialMarkEntries, initialGradeScale, initialResults } from "../mock-data/exams";
import { initialVehicles, initialTransportRoutes, initialDrivers, initialBusHelpers, initialStudentTransportAssignments, initialVehicleMaintenance } from "../mock-data/transport";
import { initialAnnouncements, initialMessages, initialMessageThreads, initialNotifications, initialNotificationPreferences } from "../mock-data/notifications";
import { initialCalendarEvents, initialEventVenues } from "../mock-data/events";
import { initialInventoryCategories, initialInventoryItems, initialInventorySuppliers, initialPurchaseEntries, initialInventoryTransactions, initialStockAlerts } from "../mock-data/inventory";
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
          user: { name: "Current Admin", avatar: "", role: "SUPER_ADMIN" },
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
      user: { name: "Current Admin", avatar: "", role: "SUPER_ADMIN" },
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
      user: { name: "Current Admin", avatar: "", role: "SUPER_ADMIN" },
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
          user: { name: "Current Admin", avatar: "", role: "SUPER_ADMIN" },
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
      user: { name: "Current Admin", avatar: "", role: "SUPER_ADMIN" },
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
          user: { name: "Current Admin", avatar: "", role: "SUPER_ADMIN" },
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
      user: { name: "Admissions Officer", avatar: "", role: "SUPER_ADMIN" },
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
          user: { name: "Admissions Head", avatar: "", role: "SUPER_ADMIN" },
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
    if (branchId && branchId !== "all") structures = structures.filter((s) => s.branchId === branchId);
    return structures;
  }
  public getFeeAssignments(branchId?: string): FeeAssignment[] {
    let assignments = initialFeeAssignments;
    if (branchId && branchId !== "all") assignments = assignments.filter((a) => a.branchId === branchId);
    return assignments;
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
  public recordPayment(invoiceId: string, amount: number, method: PaymentRecord["method"]): PaymentRecord | null {
    const invoice = initialInvoices.find((i) => i.id === invoiceId);
    if (!invoice) return null;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now().toString(36)}`,
      invoiceId, invoiceNumber: invoice.invoiceNumber, studentId: invoice.studentId, studentName: invoice.studentName,
      amount, method, transactionId: `TXN-${Math.random().toString(36).slice(2,8).toUpperCase()}`, receiptNumber: `RCT-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString().split("T")[0], branchId: invoice.branchId, branchName: invoice.branchName,
    };
    initialPayments.unshift(newPayment);
    invoice.paidAmount += amount;
    invoice.balanceAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    if (invoice.balanceAmount === 0) invoice.status = "PAID";
    else if (invoice.paidAmount > 0) invoice.status = "PARTIAL";
    // update assignments
    const assignment = initialFeeAssignments.find((a) => a.studentId === invoice.studentId);
    if (assignment) {
      assignment.totalPaid += amount;
      assignment.totalPending = Math.max(0, assignment.totalAssigned - assignment.totalPaid);
      if (assignment.totalPending === 0) assignment.status = "PAID";
      else if (assignment.totalPaid > 0) assignment.status = "PARTIAL";
    }
    this.addActivity({ user: { name: "Accounts Officer", avatar: "", role: "ACCOUNTANT" }, action: "PAYMENT", module: "Fees", entityName: invoice.invoiceNumber, entityId: invoice.id, branchId: invoice.branchId, branchName: invoice.branchName, details: `Recorded ${method} payment of ₹${amount} for ${invoice.studentName}.`, status: "SUCCESS" });
    return newPayment;
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

  public getExamSchedules(branchId?: string): ExamSchedule[] {
    let schedules = initialExamSchedules;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(EXAM_SCHEDULES_STORAGE_KEY);
        if (stored) schedules = JSON.parse(stored);
        else localStorage.setItem(EXAM_SCHEDULES_STORAGE_KEY, JSON.stringify(initialExamSchedules));
      } catch { schedules = initialExamSchedules; }
    }
    if (!branchId || branchId === "all") return schedules;
    return schedules.filter((s) => s.branchId === branchId);
  }

  public getExamScheduleById(id: string): ExamSchedule | undefined {
    return this.getExamSchedules().find((s) => s.id === id);
  }

  public saveExamSchedule(data: Omit<ExamSchedule, "id"> & { id?: string }): ExamSchedule {
    const schedules = this.getExamSchedules();
    const newSchedule: ExamSchedule = { ...data, id: data.id || `es-${Date.now().toString(36)}` };
    const index = schedules.findIndex((s) => s.id === newSchedule.id);
    if (index !== -1) schedules[index] = newSchedule;
    else schedules.unshift(newSchedule);
    if (this.isBrowser()) localStorage.setItem(EXAM_SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    return newSchedule;
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
    const newEntry: MarkEntry = { ...data, id: data.id || `mk-${Date.now().toString(36)}`, enteredAt: new Date().toISOString() };
    const index = entries.findIndex((e) => e.id === newEntry.id);
    if (index !== -1) entries[index] = newEntry;
    else entries.unshift(newEntry);
    if (this.isBrowser()) localStorage.setItem(MARK_ENTRIES_STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
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

  public saveResult(data: Omit<Result, "id" | "createdAt" | "updatedAt"> & { id?: string }): Result {
    const results = this.getResults();
    const now = new Date().toISOString();
    if (data.id) {
      const index = results.findIndex((r) => r.id === data.id);
      if (index !== -1) {
        const updated: Result = { ...results[index], ...data, id: data.id, updatedAt: now };
        results[index] = updated;
        if (this.isBrowser()) localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
        return updated;
      }
    }
    const newId = `res-${Date.now().toString(36)}`;
    const newResult: Result = { ...data, id: newId, createdAt: now, updatedAt: now };
    results.unshift(newResult);
    if (this.isBrowser()) localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    return newResult;
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

  public saveStudentTransportAssignment(data: Omit<StudentTransportAssignment, "id"> & { id?: string }): StudentTransportAssignment {
    let assignments = initialStudentTransportAssignments;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(STUDENT_TRANSPORT_STORAGE_KEY);
        if (stored) assignments = JSON.parse(stored);
        else localStorage.setItem(STUDENT_TRANSPORT_STORAGE_KEY, JSON.stringify(initialStudentTransportAssignments));
      } catch { assignments = initialStudentTransportAssignments; }
    }
    const newAssignment: StudentTransportAssignment = { ...data, id: data.id || `sta-${Date.now().toString(36)}` };
    const index = assignments.findIndex((a) => a.id === newAssignment.id);
    if (index !== -1) assignments[index] = newAssignment;
    else assignments.unshift(newAssignment);
    if (this.isBrowser()) localStorage.setItem(STUDENT_TRANSPORT_STORAGE_KEY, JSON.stringify(assignments));
    return newAssignment;
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

  public getInventoryItems(branchId?: string): InventoryItem[] {
    let items = initialInventoryItems;
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem(INVENTORY_ITEMS_STORAGE_KEY);
        if (stored) items = JSON.parse(stored);
        else localStorage.setItem(INVENTORY_ITEMS_STORAGE_KEY, JSON.stringify(initialInventoryItems));
      } catch { items = initialInventoryItems; }
    }
    if (!branchId || branchId === "all") return items;
    return items.filter((i) => i.branchId === branchId);
  }

  public getInventoryItemById(id: string): InventoryItem | undefined {
    return this.getInventoryItems().find((i) => i.id === id);
  }

  public saveInventoryItem(data: Omit<InventoryItem, "id" | "createdAt" | "updatedAt"> & { id?: string }): InventoryItem {
    const items = this.getInventoryItems();
    const now = new Date().toISOString();
    if (data.id) {
      const index = items.findIndex((i) => i.id === data.id);
      if (index !== -1) {
        const updated: InventoryItem = { ...items[index], ...data, id: data.id, updatedAt: now };
        items[index] = updated;
        if (this.isBrowser()) localStorage.setItem(INVENTORY_ITEMS_STORAGE_KEY, JSON.stringify(items));
        return updated;
      }
    }
    const newId = `inv-${Date.now().toString(36)}`;
    const newItem: InventoryItem = { ...data, id: newId, createdAt: now, updatedAt: now };
    items.unshift(newItem);
    if (this.isBrowser()) localStorage.setItem(INVENTORY_ITEMS_STORAGE_KEY, JSON.stringify(items));
    return newItem;
  }

  public getInventorySuppliers(): InventorySupplier[] { return initialInventorySuppliers; }

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

  public getInventoryTransactions(itemId?: string): InventoryTransaction[] {
    let txns = initialInventoryTransactions;
    if (itemId) txns = txns.filter((t) => t.itemId === itemId);
    return txns;
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
    if (!branchId || branchId === "all") return alerts;
    return alerts.filter((a) => a.branchId === branchId);
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
  public getSalaryStructures(): SalaryStructure[] { return initialSalaryStructures; }

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
