import { FeeHead, FeeStructure, FeeAssignment, Invoice, PaymentRecord } from "@/types";

export const initialFeeHeads: FeeHead[] = [
  { id: "fh-01", name: "Tuition Fee", description: "Quarterly academic tuition (CBSE pattern)", category: "TUITION", isRecurring: true, color: "#3b82f6" },
  { id: "fh-02", name: "Laboratory Fee", description: "Composite science + computer lab usage", category: "LAB", isRecurring: true, color: "#8b5cf6" },
  { id: "fh-03", name: "Library Fee", description: "Library access and reading-room resources", category: "LIBRARY", isRecurring: true, color: "#10b981" },
  { id: "fh-04", name: "Transport Fee", description: "GPS school bus, route-wise slab", category: "TRANSPORT", isRecurring: true, color: "#f59e0b" },
  { id: "fh-05", name: "Sports & Activities Fee", description: "PT, games coaching and Kala Utsav clubs", category: "SPORTS", isRecurring: true, color: "#ef4444" },
  { id: "fh-06", name: "Term / Exam Fee", description: "Periodic + annual board-pattern exams", category: "EXAM", isRecurring: true, color: "#06b6d4" },
  { id: "fh-07", name: "Development Fee", description: "Annual campus development levy", category: "DEVELOPMENT", isRecurring: true, color: "#ec4899" },
  { id: "fh-08", name: "Admission Fee (One-time)", description: "New admission + caution deposit", category: "ADMISSION", isRecurring: false, color: "#64748b" },
];

export const initialFeeStructures: FeeStructure[] = [
  {
    id: "fs-01",
    name: "Class 9–10 CBSE Plan",
    branchId: "br-apex-01",
    branchName: "Apex Global Campus",
    applicableClasses: ["Grade 9", "Grade 10"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 15000, frequency: "QUARTERLY" },
      { feeHeadId: "fh-02", feeHeadName: "Laboratory Fee", amount: 2500, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 1200, frequency: "ANNUAL" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 2000, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Term / Exam Fee", amount: 1500, frequency: "ANNUAL" },
    ],
    totalAmount: 68000,
    status: "ACTIVE",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "fs-02",
    name: "Class 11–12 ICSE Plan",
    branchId: "br-green-04",
    branchName: "Green Valley International School",
    applicableClasses: ["Grade 11", "Grade 12"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 18000, frequency: "QUARTERLY" },
      { feeHeadId: "fh-02", feeHeadName: "Laboratory Fee", amount: 3200, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 1500, frequency: "ANNUAL" },
      { feeHeadId: "fh-04", feeHeadName: "Transport Fee", amount: 4500, frequency: "QUARTERLY" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 2200, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Term / Exam Fee", amount: 1800, frequency: "ANNUAL" },
      { feeHeadId: "fh-07", feeHeadName: "Development Fee", amount: 3000, frequency: "ANNUAL" },
    ],
    totalAmount: 84000,
    status: "ACTIVE",
    createdAt: "2026-05-15T00:00:00.000Z",
  },
  {
    id: "fs-03",
    name: "Pre-Primary & Primary Plan",
    branchId: "br-north-03",
    branchName: "Northpoint Montessori & Prep",
    applicableClasses: ["Montessori Primary", "Kindergarten", "Grade 1", "Grade 2"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 8000, frequency: "QUARTERLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 800, frequency: "ANNUAL" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 1500, frequency: "ANNUAL" },
      { feeHeadId: "fh-04", feeHeadName: "Transport Fee", amount: 3000, frequency: "QUARTERLY" },
    ],
    totalAmount: 38000,
    status: "ACTIVE",
    createdAt: "2026-06-10T00:00:00.000Z",
  },
  {
    id: "fs-04",
    name: "Class 9–11 Science Plan",
    branchId: "br-west-02",
    branchName: "Westside STEM & Innovation Academy",
    applicableClasses: ["Grade 9", "Grade 10", "Grade 11"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 13500, frequency: "QUARTERLY" },
      { feeHeadId: "fh-02", feeHeadName: "Laboratory Fee", amount: 2800, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 1000, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Term / Exam Fee", amount: 1200, frequency: "ANNUAL" },
    ],
    totalAmount: 62000,
    status: "ACTIVE",
    createdAt: "2026-06-05T00:00:00.000Z",
  },
  {
    id: "fs-05",
    name: "Arts & Sports Plan",
    branchId: "br-river-06",
    branchName: "Riverdale Arts & Sports Academy",
    applicableClasses: ["Grade 9", "Grade 10", "Grade 11"],
    academicYear: "2026-2027",
    items: [
      { feeHeadId: "fh-01", feeHeadName: "Tuition Fee", amount: 12000, frequency: "QUARTERLY" },
      { feeHeadId: "fh-05", feeHeadName: "Sports & Activities Fee", amount: 3000, frequency: "HALF_YEARLY" },
      { feeHeadId: "fh-03", feeHeadName: "Library Fee", amount: 900, frequency: "ANNUAL" },
      { feeHeadId: "fh-06", feeHeadName: "Term / Exam Fee", amount: 1100, frequency: "ANNUAL" },
    ],
    totalAmount: 54000,
    status: "ACTIVE",
    createdAt: "2026-06-08T00:00:00.000Z",
  },
];

export const initialFeeAssignments: FeeAssignment[] = [
  {
    id: "fa-01", studentId: "stu-01", studentName: "Aarav Sharma", studentRoll: "STU-1042",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    structureId: "fs-01", structureName: "Class 9–10 CBSE Plan",
    totalAssigned: 68000, totalPaid: 68000, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-20",
  },
  {
    id: "fa-02", studentId: "stu-02", studentName: "Diya Patel", studentRoll: "STU-1043",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    structureId: "fs-01", structureName: "Class 9–10 CBSE Plan",
    totalAssigned: 68000, totalPaid: 45000, totalPending: 23000, totalOverdue: 8000,
    status: "PARTIAL", dueDate: "2026-09-15", lastPaymentDate: "2026-06-15",
  },
  {
    id: "fa-03", studentId: "stu-03", studentName: "Arjun Nair", studentRoll: "STU-0912",
    classId: "cls-g9", className: "Grade 9", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy",
    structureId: "fs-04", structureName: "Class 9–11 Science Plan",
    totalAssigned: 62000, totalPaid: 62000, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-10",
  },
  {
    id: "fa-04", studentId: "stu-04", studentName: "Ananya Iyer", studentRoll: "STU-1108",
    classId: "cls-g11", className: "Grade 11", branchId: "br-green-04", branchName: "Green Valley International School",
    structureId: "fs-02", structureName: "Class 11–12 ICSE Plan",
    totalAssigned: 84000, totalPaid: 84000, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-25",
  },
  {
    id: "fa-05", studentId: "stu-05", studentName: "Vihaan Gupta", studentRoll: "STU-0015",
    classId: "cls-mont", className: "Montessori Primary", branchId: "br-north-03", branchName: "Northpoint Montessori & Prep",
    structureId: "fs-03", structureName: "Pre-Primary & Primary Plan",
    totalAssigned: 38000, totalPaid: 38000, totalPending: 0, totalOverdue: 0,
    status: "PAID", dueDate: "2026-09-15", lastPaymentDate: "2026-08-18",
  },
  {
    id: "fa-06", studentId: "stu-06", studentName: "Ishita Verma", studentRoll: "STU-1055",
    classId: "cls-g10", className: "Grade 10", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    structureId: "fs-05", structureName: "Arts & Sports Plan",
    totalAssigned: 54000, totalPaid: 27000, totalPending: 27000, totalOverdue: 12000,
    status: "OVERDUE", dueDate: "2026-07-15", lastPaymentDate: "2026-05-20",
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: "inv-01", invoiceNumber: "INV-2026-001", studentId: "stu-01", studentName: "Aarav Sharma", studentRoll: "STU-1042",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 15000 },
      { feeHeadName: "Laboratory Fee", amount: 2500 },
      { feeHeadName: "Library Fee", amount: 1200 },
    ],
    totalAmount: 18700, paidAmount: 18700, balanceAmount: 0,
    status: "PAID", issueDate: "2026-04-01", dueDate: "2026-04-30", paidDate: "2026-04-15",
    academicYear: "2026-2027", period: "Q1 Apr-Jun 2026",
  },
  {
    id: "inv-02", invoiceNumber: "INV-2026-002", studentId: "stu-01", studentName: "Aarav Sharma", studentRoll: "STU-1042",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 15000 },
      { feeHeadName: "Sports & Activities Fee", amount: 2000 },
    ],
    totalAmount: 17000, paidAmount: 17000, balanceAmount: 0,
    status: "PAID", issueDate: "2026-07-01", dueDate: "2026-07-31", paidDate: "2026-08-20",
    academicYear: "2026-2027", period: "Q2 Jul-Sep 2026",
  },
  {
    id: "inv-03", invoiceNumber: "INV-2026-003", studentId: "stu-02", studentName: "Diya Patel", studentRoll: "STU-1043",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 15000 },
      { feeHeadName: "Laboratory Fee", amount: 2500 },
      { feeHeadName: "Library Fee", amount: 1200 },
    ],
    totalAmount: 18700, paidAmount: 12000, balanceAmount: 6700,
    status: "PARTIAL", issueDate: "2026-04-01", dueDate: "2026-04-30",
    academicYear: "2026-2027", period: "Q1 Apr-Jun 2026",
  },
  {
    id: "inv-04", invoiceNumber: "INV-2026-004", studentId: "stu-02", studentName: "Diya Patel", studentRoll: "STU-1043",
    classId: "cls-g10", className: "Grade 10", branchId: "br-apex-01", branchName: "Apex Global Campus",
    items: [
      { feeHeadName: "Tuition Fee", amount: 15000 },
      { feeHeadName: "Sports & Activities Fee", amount: 2000 },
    ],
    totalAmount: 17000, paidAmount: 12000, balanceAmount: 5000,
    status: "PARTIAL", issueDate: "2026-07-01", dueDate: "2026-07-31", paidDate: "2026-06-15",
    academicYear: "2026-2027", period: "Q2 Jul-Sep 2026",
  },
  {
    id: "inv-05", invoiceNumber: "INV-2026-005", studentId: "stu-03", studentName: "Arjun Nair", studentRoll: "STU-0912",
    classId: "cls-g9", className: "Grade 9", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy",
    items: [
      { feeHeadName: "Tuition Fee", amount: 13500 },
      { feeHeadName: "Laboratory Fee", amount: 2800 },
      { feeHeadName: "Library Fee", amount: 1000 },
      { feeHeadName: "Term / Exam Fee", amount: 1200 },
    ],
    totalAmount: 18500, paidAmount: 18500, balanceAmount: 0,
    status: "PAID", issueDate: "2026-07-01", dueDate: "2026-07-31", paidDate: "2026-07-22",
    academicYear: "2026-2027", period: "Q2 Jul-Sep 2026",
  },
  {
    id: "inv-06", invoiceNumber: "INV-2026-006", studentId: "stu-04", studentName: "Ananya Iyer", studentRoll: "STU-1108",
    classId: "cls-g11", className: "Grade 11", branchId: "br-green-04", branchName: "Green Valley International School",
    items: [
      { feeHeadName: "Tuition Fee", amount: 18000 },
      { feeHeadName: "Laboratory Fee", amount: 3200 },
      { feeHeadName: "Library Fee", amount: 1500 },
      { feeHeadName: "Development Fee", amount: 3000 },
    ],
    totalAmount: 25700, paidAmount: 25700, balanceAmount: 0,
    status: "PAID", issueDate: "2026-04-01", dueDate: "2026-04-30", paidDate: "2026-04-10",
    academicYear: "2026-2027", period: "Q1 Apr-Jun 2026",
  },
  {
    id: "inv-07", invoiceNumber: "INV-2026-007", studentId: "stu-05", studentName: "Vihaan Gupta", studentRoll: "STU-0015",
    classId: "cls-mont", className: "Montessori Primary", branchId: "br-north-03", branchName: "Northpoint Montessori & Prep",
    items: [
      { feeHeadName: "Tuition Fee", amount: 8000 },
      { feeHeadName: "Library Fee", amount: 800 },
      { feeHeadName: "Sports & Activities Fee", amount: 1500 },
      { feeHeadName: "Transport Fee", amount: 3000 },
    ],
    totalAmount: 13300, paidAmount: 13300, balanceAmount: 0,
    status: "PAID", issueDate: "2026-04-01", dueDate: "2026-04-30", paidDate: "2026-04-18",
    academicYear: "2026-2027", period: "Q1 Apr-Jun 2026",
  },
  {
    id: "inv-08", invoiceNumber: "INV-2026-008", studentId: "stu-06", studentName: "Ishita Verma", studentRoll: "STU-1055",
    classId: "cls-g10", className: "Grade 10", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    items: [
      { feeHeadName: "Tuition Fee", amount: 12000 },
      { feeHeadName: "Sports & Activities Fee", amount: 3000 },
      { feeHeadName: "Library Fee", amount: 900 },
    ],
    totalAmount: 15900, paidAmount: 9000, balanceAmount: 6900,
    status: "OVERDUE", issueDate: "2026-04-01", dueDate: "2026-04-30",
    academicYear: "2026-2027", period: "Q1 Apr-Jun 2026",
  },
  {
    id: "inv-09", invoiceNumber: "INV-2026-009", studentId: "stu-06", studentName: "Ishita Verma", studentRoll: "STU-1055",
    classId: "cls-g10", className: "Grade 10", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    items: [
      { feeHeadName: "Tuition Fee", amount: 12000 },
      { feeHeadName: "Term / Exam Fee", amount: 1100 },
    ],
    totalAmount: 13100, paidAmount: 8000, balanceAmount: 5100,
    status: "PENDING", issueDate: "2026-07-01", dueDate: "2026-09-15",
    academicYear: "2026-2027", period: "Q2 Jul-Sep 2026",
  },
];

export const initialPayments: PaymentRecord[] = [
  {
    id: "pay-01", invoiceId: "inv-01", invoiceNumber: "INV-2026-001", studentId: "stu-01", studentName: "Aarav Sharma",
    amount: 18700, method: "UPI", transactionId: "UPI-982200112233", receiptNumber: "RCT-2026-001",
    date: "2026-04-15", branchId: "br-apex-01", branchName: "Apex Global Campus",
  },
  {
    id: "pay-02", invoiceId: "inv-02", invoiceNumber: "INV-2026-002", studentId: "stu-01", studentName: "Aarav Sharma",
    amount: 17000, method: "BANK_TRANSFER", transactionId: "NEFT-HDFC8842901", receiptNumber: "RCT-2026-002",
    date: "2026-08-20", branchId: "br-apex-01", branchName: "Apex Global Campus",
  },
  {
    id: "pay-03", invoiceId: "inv-03", invoiceNumber: "INV-2026-003", studentId: "stu-02", studentName: "Diya Patel",
    amount: 12000, method: "UPI", transactionId: "UPI-981230987123", receiptNumber: "RCT-2026-003",
    date: "2026-04-20", branchId: "br-apex-01", branchName: "Apex Global Campus",
    notes: "Part payment — balance pending",
  },
  {
    id: "pay-04", invoiceId: "inv-04", invoiceNumber: "INV-2026-004", studentId: "stu-02", studentName: "Diya Patel",
    amount: 12000, method: "CHEQUE", transactionId: "CHQ-558812-SBI", receiptNumber: "RCT-2026-004",
    date: "2026-06-15", branchId: "br-apex-01", branchName: "Apex Global Campus",
    notes: "Cheque clearance part payment",
  },
  {
    id: "pay-05", invoiceId: "inv-05", invoiceNumber: "INV-2026-005", studentId: "stu-03", studentName: "Arjun Nair",
    amount: 18500, method: "UPI", transactionId: "UPI-976540123456", receiptNumber: "RCT-2026-005",
    date: "2026-07-22", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy",
  },
  {
    id: "pay-06", invoiceId: "inv-06", invoiceNumber: "INV-2026-006", studentId: "stu-04", studentName: "Ananya Iyer",
    amount: 25700, method: "BANK_TRANSFER", transactionId: "NEFT-SBI4456709", receiptNumber: "RCT-2026-006",
    date: "2026-04-10", branchId: "br-green-04", branchName: "Green Valley International School",
  },
  {
    id: "pay-07", invoiceId: "inv-07", invoiceNumber: "INV-2026-007", studentId: "stu-05", studentName: "Vihaan Gupta",
    amount: 13300, method: "CASH", transactionId: "CASH-098712", receiptNumber: "RCT-2026-007",
    date: "2026-04-18", branchId: "br-north-03", branchName: "Northpoint Montessori & Prep",
  },
  {
    id: "pay-08", invoiceId: "inv-08", invoiceNumber: "INV-2026-008", studentId: "stu-06", studentName: "Ishita Verma",
    amount: 9000, method: "UPI", transactionId: "UPI-989801122334", receiptNumber: "RCT-2026-008",
    date: "2026-05-20", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    notes: "Part payment for overdue invoice",
  },
  {
    id: "pay-09", invoiceId: "inv-09", invoiceNumber: "INV-2026-009", studentId: "stu-06", studentName: "Ishita Verma",
    amount: 8000, method: "UPI", transactionId: "UPI-989804455667", receiptNumber: "RCT-2026-009",
    date: "2026-08-25", branchId: "br-river-06", branchName: "Riverdale Arts & Sports Academy",
    notes: "Part payment towards Q2",
  },
];

// Fee collection chart data (monthly, whole chain, INR)
export const feeCollectionChartData = [
  { month: "Apr", collected: 4850000, target: 5200000, pending: 350000 },
  { month: "May", collected: 4950000, target: 5200000, pending: 250000 },
  { month: "Jun", collected: 4680000, target: 5200000, pending: 520000 },
  { month: "Jul", collected: 5050000, target: 5200000, pending: 150000 },
  { month: "Aug", collected: 4920000, target: 5200000, pending: 280000 },
  { month: "Sep", collected: 1880000, target: 5200000, pending: 3320000 },
];

// Fee head distribution for pie chart
export const feeHeadDistribution = [
  { name: "Tuition", value: 65, color: "#3b82f6" },
  { name: "Lab & Computer", value: 12, color: "#8b5cf6" },
  { name: "Transport", value: 8, color: "#f59e0b" },
  { name: "Sports", value: 6, color: "#ef4444" },
  { name: "Library", value: 4, color: "#10b981" },
  { name: "Exam & Misc", value: 5, color: "#06b6d4" },
];
