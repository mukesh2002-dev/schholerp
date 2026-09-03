import { FeeHead, FeeStructure, FeeAssignment, Invoice, PaymentRecord } from "@/types";

export const initialFeeHeads: FeeHead[] = [
  { id: "fh-01", name: "Tuition Fee", description: "Core academic tuition charges", category: "TUITION", isRecurring: true, color: "#3b82f6" },
  { id: "fh-02", name: "Lab & Technology Fee", description: "Science lab and computer lab usage", category: "LAB", isRecurring: true, color: "#8b5cf6" },
  { id: "fh-03", name: "Library Fee", description: "Library access and digital resources", category: "LIBRARY", isRecurring: true, color: "#10b981" },
  { id: "fh-04", name: "Transport Fee", description: "School bus and transport services", category: "TRANSPORT", isRecurring: true, color: "#f59e0b" },
  { id: "fh-05", name: "Sports & Activities Fee", description: "Sports equipment, coaching, and extracurriculars", category: "SPORTS", isRecurring: true, color: "#ef4444" },
  { id: "fh-06", name: "Examination Fee", description: "Term and final examination charges", category: "EXAM", isRecurring: false, color: "#06b6d4" },
  { id: "fh-07", name: "Development Fund", description: "Campus infrastructure development levy", category: "MISC", isRecurring: false, color: "#ec4899" },
  { id: "fh-08", name: "Admission Processing Fee", description: "One-time admission processing charge", category: "MISC", isRecurring: false, color: "#64748b" },
];

export const initialFeeStructures: FeeStructure[] = [
  {
    id: "fs-01",
    name: "Grade 9–10 Standard Plan",
    branchId: "br-apex-01",
    branchName: "Apex Global Campus",
    applicableClasses: ["Grade 9", "Grade 10"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 5000, frequency: "QUARTERLY" },
      { feeHeadId: "fh-02", feeHeadName: "Lab & Technology Fee", amount: 1200, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 500, frequency: "ANNUAL" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 800, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Examination Fee", amount: 600, frequency: "ANNUAL" },
    ],
    totalAmount: 24500,
    status: "ACTIVE",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "fs-02",
    name: "IB Diploma Premium Plan",
    branchId: "br-green-04",
    branchName: "Green Valley International School",
    applicableClasses: ["Grade 11", "Grade 12"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 7500, frequency: "QUARTERLY" },
      { feeHeadId: "fh-02", feeHeadName: "Lab & Technology Fee", amount: 2000, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 800, frequency: "ANNUAL" },
      { feeHeadId: "fh-04", feeHeadName: "Transport Fee", amount: 1500, frequency: "QUARTERLY" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 1200, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Examination Fee", amount: 1000, frequency: "ANNUAL" },
      { feeHeadId: "fh-07", feeHeadName: "Development Fund", amount: 2500, frequency: "ONE_TIME" },
    ],
    totalAmount: 42500,
    status: "ACTIVE",
    createdAt: "2026-05-15T00:00:00.000Z",
  },
  {
    id: "fs-03",
    name: "Montessori & Primary Plan",
    branchId: "br-north-03",
    branchName: "Northpoint Montessori & Prep",
    applicableClasses: ["Montessori Primary", "Kindergarten", "Grade 1", "Grade 2"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 3000, frequency: "QUARTERLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 300, frequency: "ANNUAL" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 600, frequency: "ANNUAL" },
      { feeHeadId: "fh-04", feeHeadName: "Transport Fee", amount: 1000, frequency: "QUARTERLY" },
    ],
    totalAmount: 16900,
    status: "ACTIVE",
    createdAt: "2026-06-10T00:00:00.000Z",
  },
  {
    id: "fs-04",
    name: "STEM Academy High School Plan",
    branchId: "br-west-02",
    branchName: "Westside STEM & Innovation Academy",
    applicableClasses: ["Grade 9", "Grade 10", "Grade 11"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 4500, frequency: "QUARTERLY" },
      { feeHeadId: "fh-02", feeHeadName: "Lab & Technology Fee", amount: 1800, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 400, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Examination Fee", amount: 500, frequency: "ANNUAL" },
    ],
    totalAmount: 21500,
    status: "ACTIVE",
    createdAt: "2026-06-05T00:00:00.000Z",
  },
  {
    id: "fs-05",
    name: "Arts & Sports Academy Plan",
    branchId: "br-river-06",
    branchName: "Riverdale Arts & Sports Academy",
    applicableClasses: ["Grade 9", "Grade 10", "Grade 11"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 4000, frequency: "QUARTERLY" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 2000, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 350, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Examination Fee", amount: 450, frequency: "ANNUAL" },
    ],
    totalAmount: 20800,
    status: "ACTIVE",
    createdAt: "2026-06-08T00:00:00.000Z",
  },
];

export const initialFeeAssignments: FeeAssignment[] = [
  {
    id: "fa-01", studentId: "stu-01", studentName: "Liam Chen", studentRoll: "STU-1042",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    structureId: "fs-01", structureName: "Grade 9–10 Standard Plan",
    totalAssigned: 12000, totalPaid: 12000, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-20",
  },
  {
    id: "fa-02", studentId: "stu-02", studentName: "Maya Patel", studentRoll: "STU-1043",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    structureId: "fs-01", structureName: "Grade 9–10 Standard Plan",
    totalAssigned: 12000, totalPaid: 8000, totalPending: 4000, totalOverdue: 2000,
    status: "PARTIAL", dueDate: "2026-09-15", lastPaymentDate: "2026-06-15",
  },
  {
    id: "fa-03", studentId: "stu-03", studentName: "Ethan Hawthorne", studentRoll: "STU-0912",
    classId: "cls-g9", className: "Grade 9", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy",
    structureId: "fs-04", structureName: "STEM Academy High School Plan",
    totalAssigned: 11000, totalPaid: 11000, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-10",
  },
  {
    id: "fa-04", studentId: "stu-04", studentName: "Sophie Dubois", studentRoll: "STU-1108",
    classId: "cls-g11", className: "Grade 11", branchId: "br-green-04", branchName: "Green Valley International School",
    structureId: "fs-02", structureName: "IB Diploma Premium Plan",
    totalAssigned: 14500, totalPaid: 14500, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-25",
  },
  {
    id: "fa-05", studentId: "stu-05", studentName: "Lucas Moretti", studentRoll: "STU-0015",
    classId: "cls-mont", className: "Montessori Primary", branchId: "br-north-03", branchName: "Northpoint Montessori & Prep",
    structureId: "fs-03", structureName: "Montessori & Primary Plan",
    totalAssigned: 8500, totalPaid: 8500, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-18",
  },
  {
    id: "fa-06", studentId: "stu-06", studentName: "Zoe Alvarez", studentRoll: "STU-1055",
    classId: "cls-g10", className: "Grade 10", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    structureId: "fs-05", structureName: "Arts & Sports Academy Plan",
    totalAssigned: 10500, totalPaid: 5000, totalPending: 5500, totalOverdue: 3500,
    status: "OVERDUE", dueDate: "2026-07-15", lastPaymentDate: "2026-05-20",
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: "inv-01", invoiceNumber: "INV-2026-001", studentId: "stu-01", studentName: "Liam Chen", studentRoll: "STU-1042",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 5000 },
      { feeHeadName: "Lab & Technology Fee", amount: 1200 },
      { feeHeadName: "Library Fee", amount: 500 },
    ],
    totalAmount: 6700, paidAmount: 6700, balanceAmount: 0,
    status: "PAID", issueDate: "2026-07-01", dueDate: "2026-07-31", paidDate: "2026-07-15",
    academicYear: "2026-2027", period: "Q1 Jul-Sep 2026",
  },
  {
    id: "inv-02", invoiceNumber: "INV-2026-002", studentId: "stu-01", studentName: "Liam Chen", studentRoll: "STU-1042",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 5000 },
      { feeHeadName: "Sports & Activities Fee", amount: 800 },
    ],
    totalAmount: 5800, paidAmount: 5800, balanceAmount: 0,
    status: "PAID", issueDate: "2026-08-01", dueDate: "2026-08-31", paidDate: "2026-08-20",
    academicYear: "2026-2027", period: "Q1 Aug Supplement",
  },
  {
    id: "inv-03", invoiceNumber: "INV-2026-003", studentId: "stu-02", studentName: "Maya Patel", studentRoll: "STU-1043",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 5000 },
      { feeHeadName: "Lab & Technology Fee", amount: 1200 },
      { feeHeadName: "Library Fee", amount: 500 },
    ],
    totalAmount: 6700, paidAmount: 4000, balanceAmount: 2700,
    status: "PARTIAL", issueDate: "2026-07-01", dueDate: "2026-07-31",
    academicYear: "2026-2027", period: "Q1 Jul-Sep 2026",
  },
  {
    id: "inv-04", invoiceNumber: "INV-2026-004", studentId: "stu-02", studentName: "Maya Patel", studentRoll: "STU-1043",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 5000 },
      { feeHeadName: "Sports & Activities Fee", amount: 800 },
    ],
    totalAmount: 5800, paidAmount: 4000, balanceAmount: 1800,
    status: "PARTIAL", issueDate: "2026-08-01", dueDate: "2026-08-31", paidDate: "2026-06-15",
    academicYear: "2026-2027", period: "Q1 Aug Supplement",
  },
  {
    id: "inv-05", invoiceNumber: "INV-2026-005", studentId: "stu-03", studentName: "Ethan Hawthorne", studentRoll: "STU-0912",
    classId: "cls-g9", className: "Grade 9", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy",
    items: [
      { feeHeadName: "Tuition Fee", amount: 4500 },
      { feeHeadName: "Lab & Technology Fee", amount: 1800 },
      { feeHeadName: "Library Fee", amount: 400 },
      { feeHeadName: "Examination Fee", amount: 500 },
    ],
    totalAmount: 7200, paidAmount: 7200, balanceAmount: 0,
    status: "PAID", issueDate: "2026-07-01", dueDate: "2026-07-31", paidDate: "2026-07-22",
    academicYear: "2026-2027", period: "Q1 Jul-Sep 2026",
  },
  {
    id: "inv-06", invoiceNumber: "INV-2026-006", studentId: "stu-04", studentName: "Sophie Dubois", studentRoll: "STU-1108",
    classId: "cls-g11", className: "Grade 11", branchId: "br-green-04", branchName: "Green Valley International School",
    items: [
      { feeHeadName: "Tuition Fee", amount: 7500 },
      { feeHeadName: "Lab & Technology Fee", amount: 2000 },
      { feeHeadName: "Library Fee", amount: 800 },
      { feeHeadName: "Development Fund", amount: 2500 },
    ],
    totalAmount: 12800, paidAmount: 12800, balanceAmount: 0,
    status: "PAID", issueDate: "2026-07-01", dueDate: "2026-07-31", paidDate: "2026-07-10",
    academicYear: "2026-2027", period: "Q1 Jul-Sep 2026",
  },
  {
    id: "inv-07", invoiceNumber: "INV-2026-007", studentId: "stu-05", studentName: "Lucas Moretti", studentRoll: "STU-0015",
    classId: "cls-mont", className: "Montessori Primary", branchId: "br-north-03", branchName: "Northpoint Montessori & Prep",
    items: [
      { feeHeadName: "Tuition Fee", amount: 3000 },
      { feeHeadName: "Library Fee", amount: 300 },
      { feeHeadName: "Sports & Activities Fee", amount: 600 },
      { feeHeadName: "Transport Fee", amount: 1000 },
    ],
    totalAmount: 4900, paidAmount: 4900, balanceAmount: 0,
    status: "PAID", issueDate: "2026-07-01", dueDate: "2026-07-31", paidDate: "2026-07-18",
    academicYear: "2026-2027", period: "Q1 Jul-Sep 2026",
  },
  {
    id: "inv-08", invoiceNumber: "INV-2026-008", studentId: "stu-06", studentName: "Zoe Alvarez", studentRoll: "STU-1055",
    classId: "cls-g10", className: "Grade 10", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    items: [
      { feeHeadName: "Tuition Fee", amount: 4000 },
      { feeHeadName: "Sports & Activities Fee", amount: 2000 },
      { feeHeadName: "Library Fee", amount: 350 },
    ],
    totalAmount: 6350, paidAmount: 2500, balanceAmount: 3850,
    status: "OVERDUE", issueDate: "2026-06-01", dueDate: "2026-06-30",
    academicYear: "2026-2027", period: "Pre-Session Jun 2026",
  },
  {
    id: "inv-09", invoiceNumber: "INV-2026-009", studentId: "stu-06", studentName: "Zoe Alvarez", studentRoll: "STU-1055",
    classId: "cls-g10", className: "Grade 10", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    items: [
      { feeHeadName: "Tuition Fee", amount: 4000 },
      { feeHeadName: "Examination Fee", amount: 450 },
    ],
    totalAmount: 4450, paidAmount: 2500, balanceAmount: 1950,
    status: "PENDING", issueDate: "2026-08-01", dueDate: "2026-09-15",
    academicYear: "2026-2027", period: "Q1 Aug-Sep 2026",
  },
];

export const initialPayments: PaymentRecord[] = [
  {
    id: "pay-01", invoiceId: "inv-01", invoiceNumber: "INV-2026-001", studentId: "stu-01", studentName: "Liam Chen",
    amount: 6700, method: "BANK_TRANSFER", transactionId: "TXN-8842901", receiptNumber: "RCT-2026-001",
    date: "2026-07-15", branchId: "br-apex-01", branchName: "Apex Global Campus",
  },
  {
    id: "pay-02", invoiceId: "inv-02", invoiceNumber: "INV-2026-002", studentId: "stu-01", studentName: "Liam Chen",
    amount: 5800, method: "CARD", transactionId: "TXN-9012446", receiptNumber: "RCT-2026-002",
    date: "2026-08-20", branchId: "br-apex-01", branchName: "Apex Global Campus",
  },
  {
    id: "pay-03", invoiceId: "inv-03", invoiceNumber: "INV-2026-003", studentId: "stu-02", studentName: "Maya Patel",
    amount: 4000, method: "UPI", transactionId: "TXN-7731984", receiptNumber: "RCT-2026-003",
    date: "2026-07-20", branchId: "br-apex-01", branchName: "Apex Global Campus",
    notes: "Partial payment — balance pending",
  },
  {
    id: "pay-04", invoiceId: "inv-04", invoiceNumber: "INV-2026-004", studentId: "stu-02", studentName: "Maya Patel",
    amount: 4000, method: "CHEQUE", transactionId: "CHQ-558812", receiptNumber: "RCT-2026-004",
    date: "2026-06-15", branchId: "br-apex-01", branchName: "Apex Global Campus",
    notes: "Cheque clearance partial",
  },
  {
    id: "pay-05", invoiceId: "inv-05", invoiceNumber: "INV-2026-005", studentId: "stu-03", studentName: "Ethan Hawthorne",
    amount: 7200, method: "ONLINE", transactionId: "TXN-6543210", receiptNumber: "RCT-2026-005",
    date: "2026-07-22", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy",
  },
  {
    id: "pay-06", invoiceId: "inv-06", invoiceNumber: "INV-2026-006", studentId: "stu-04", studentName: "Sophie Dubois",
    amount: 12800, method: "BANK_TRANSFER", transactionId: "TXN-4456709", receiptNumber: "RCT-2026-006",
    date: "2026-07-10", branchId: "br-green-04", branchName: "Green Valley International School",
  },
  {
    id: "pay-07", invoiceId: "inv-07", invoiceNumber: "INV-2026-007", studentId: "stu-05", studentName: "Lucas Moretti",
    amount: 4900, method: "CASH", transactionId: "CASH-098712", receiptNumber: "RCT-2026-007",
    date: "2026-07-18", branchId: "br-north-03", branchName: "Northpoint Montessori & Prep",
  },
  {
    id: "pay-08", invoiceId: "inv-08", invoiceNumber: "INV-2026-008", studentId: "stu-06", studentName: "Zoe Alvarez",
    amount: 2500, method: "UPI", transactionId: "TXN-3321876", receiptNumber: "RCT-2026-008",
    date: "2026-05-20", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    notes: "Partial payment for overdue invoice",
  },
  {
    id: "pay-09", invoiceId: "inv-09", invoiceNumber: "INV-2026-009", studentId: "stu-06", studentName: "Zoe Alvarez",
    amount: 2500, method: "CARD", transactionId: "TXN-1198432", receiptNumber: "RCT-2026-009",
    date: "2026-08-25", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    notes: "Partial payment towards Q1",
  },
];

// Fee collection chart data (monthly)
export const feeCollectionChartData = [
  { month: "Apr", collected: 185000, target: 210000, pending: 25000 },
  { month: "May", collected: 195000, target: 210000, pending: 15000 },
  { month: "Jun", collected: 178000, target: 210000, pending: 32000 },
  { month: "Jul", collected: 205000, target: 210000, pending: 5000 },
  { month: "Aug", collected: 192000, target: 210000, pending: 18000 },
  { month: "Sep", collected: 88000, target: 210000, pending: 122000 },
];

// Fee head distribution for pie chart
export const feeHeadDistribution = [
  { name: "Tuition", value: 65, color: "#3b82f6" },
  { name: "Lab & Tech", value: 12, color: "#8b5cf6" },
  { name: "Transport", value: 8, color: "#f59e0b" },
  { name: "Sports", value: 6, color: "#ef4444" },
  { name: "Library", value: 4, color: "#10b981" },
  { name: "Exam & Misc", value: 5, color: "#06b6d4" },
];
