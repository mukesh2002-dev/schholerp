import { SalaryStructure, PayrollRecord } from "@/types";

export const initialSalaryStructures: SalaryStructure[] = [
  {
    id: "ss-001", name: "Senior Teacher", description: "For senior faculty with 8+ years experience",
    baseSalary: 65000, allowances: [{ name: "HRA", amount: 15000 }, { name: "Conveyance", amount: 3000 }, { name: "Medical", amount: 2500 }],
    deductions: [{ name: "PF", amount: 7800 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 8500 }],
    grossSalary: 85500, netSalary: 69000, applicableTo: "TEACHER", branchId: "all",
  },
  {
    id: "ss-002", name: "Junior Teacher", description: "For teaching staff with 0-5 years experience",
    baseSalary: 40000, allowances: [{ name: "HRA", amount: 10000 }, { name: "Conveyance", amount: 2000 }, { name: "Medical", amount: 1500 }],
    deductions: [{ name: "PF", amount: 4800 }, { name: "Professional Tax", amount: 200 }],
    grossSalary: 53500, netSalary: 48500, applicableTo: "TEACHER", branchId: "all",
  },
  {
    id: "ss-003", name: "Admin Staff", description: "For administrative and office staff",
    baseSalary: 30000, allowances: [{ name: "HRA", amount: 8000 }, { name: "Conveyance", amount: 1500 }],
    deductions: [{ name: "PF", amount: 3600 }, { name: "Professional Tax", amount: 200 }],
    grossSalary: 39500, netSalary: 35700, applicableTo: "STAFF", branchId: "all",
  },
  {
    id: "ss-004", name: "Support Staff", description: "For housekeeping, security, and maintenance staff",
    baseSalary: 22000, allowances: [{ name: "HRA", amount: 5000 }, { name: "Conveyance", amount: 1000 }],
    deductions: [{ name: "PF", amount: 2640 }, { name: "Professional Tax", amount: 200 }],
    grossSalary: 28000, netSalary: 25160, applicableTo: "WORKER", branchId: "all",
  },
  {
    id: "ss-005", name: "Lab Technician", description: "For science and computer lab technicians",
    baseSalary: 35000, allowances: [{ name: "HRA", amount: 9000 }, { name: "Conveyance", amount: 2000 }, { name: "Lab Allowance", amount: 3000 }],
    deductions: [{ name: "PF", amount: 4200 }, { name: "Professional Tax", amount: 200 }],
    grossSalary: 49000, netSalary: 44600, applicableTo: "STAFF", branchId: "all",
  },
];

export const initialPayrollRecords: PayrollRecord[] = [
  { id: "pay-001", employeeId: "tch-01", employeeName: "Dr. Sarah Lin", employeeRole: "Senior Teacher", employeeAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100", branchId: "br-apex-01", branchName: "Apex Global Campus", salaryStructureId: "ss-001", salaryStructureName: "Senior Teacher", month: "August", year: 2026, workingDays: 25, presentDays: 24, baseSalary: 65000, allowances: [{ name: "HRA", amount: 15000 }, { name: "Conveyance", amount: 3000 }, { name: "Medical", amount: 2500 }], grossSalary: 85500, deductions: [{ name: "PF", amount: 7800 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 8500 }], totalDeductions: 16500, netSalary: 69000, status: "PAID", paymentDate: "2026-08-31", paymentMode: "BANK_TRANSFER", transactionId: "TXN-SAL-2026-0801", createdAt: "2026-08-28T10:00:00Z", updatedAt: "2026-08-31T10:00:00Z" },
  { id: "pay-002", employeeId: "tch-02", employeeName: "Prof. Marcus Brody", employeeRole: "Senior Teacher", branchId: "br-apex-01", branchName: "Apex Global Campus", salaryStructureId: "ss-001", salaryStructureName: "Senior Teacher", month: "August", year: 2026, workingDays: 25, presentDays: 25, baseSalary: 65000, allowances: [{ name: "HRA", amount: 15000 }, { name: "Conveyance", amount: 3000 }, { name: "Medical", amount: 2500 }], grossSalary: 85500, deductions: [{ name: "PF", amount: 7800 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 7200 }], totalDeductions: 15200, netSalary: 70300, status: "PAID", paymentDate: "2026-08-31", paymentMode: "BANK_TRANSFER", transactionId: "TXN-SAL-2026-0802", createdAt: "2026-08-28T10:00:00Z", updatedAt: "2026-08-31T10:00:00Z" },
  { id: "pay-003", employeeId: "tch-03", employeeName: "Elena Rostova", employeeRole: "Junior Teacher", branchId: "br-west-02", branchName: "Westside STEM & Innovation Academy", salaryStructureId: "ss-002", salaryStructureName: "Junior Teacher", month: "August", year: 2026, workingDays: 25, presentDays: 23, baseSalary: 40000, allowances: [{ name: "HRA", amount: 10000 }, { name: "Conveyance", amount: 2000 }, { name: "Medical", amount: 1500 }], grossSalary: 53500, deductions: [{ name: "PF", amount: 4800 }, { name: "Professional Tax", amount: 200 }], totalDeductions: 5000, netSalary: 48500, status: "PAID", paymentDate: "2026-08-31", paymentMode: "BANK_TRANSFER", transactionId: "TXN-SAL-2026-0803", createdAt: "2026-08-28T10:00:00Z", updatedAt: "2026-08-31T10:00:00Z" },
  { id: "pay-004", employeeId: "tch-05", employeeName: "Dr. Nigel Ross", employeeRole: "Senior Teacher", branchId: "br-apex-01", branchName: "Apex Global Campus", salaryStructureId: "ss-001", salaryStructureName: "Senior Teacher", month: "August", year: 2026, workingDays: 25, presentDays: 22, baseSalary: 65000, allowances: [{ name: "HRA", amount: 15000 }, { name: "Conveyance", amount: 3000 }, { name: "Medical", amount: 2500 }], grossSalary: 85500, deductions: [{ name: "PF", amount: 7800 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 9000 }], totalDeductions: 17000, netSalary: 68500, status: "PAID", paymentDate: "2026-08-31", paymentMode: "BANK_TRANSFER", transactionId: "TXN-SAL-2026-0804", createdAt: "2026-08-28T10:00:00Z", updatedAt: "2026-08-31T10:00:00Z" },
  { id: "pay-005", employeeId: "tch-06", employeeName: "Camilla Rossi", employeeRole: "Junior Teacher", branchId: "br-apex-01", branchName: "Apex Global Campus", salaryStructureId: "ss-002", salaryStructureName: "Junior Teacher", month: "August", year: 2026, workingDays: 25, presentDays: 25, baseSalary: 40000, allowances: [{ name: "HRA", amount: 10000 }, { name: "Conveyance", amount: 2000 }, { name: "Medical", amount: 1500 }], grossSalary: 53500, deductions: [{ name: "PF", amount: 4800 }, { name: "Professional Tax", amount: 200 }], totalDeductions: 5000, netSalary: 48500, status: "PAID", paymentDate: "2026-08-31", paymentMode: "BANK_TRANSFER", transactionId: "TXN-SAL-2026-0805", createdAt: "2026-08-28T10:00:00Z", updatedAt: "2026-08-31T10:00:00Z" },
  { id: "pay-006", employeeId: "drv-001", employeeName: "Rajesh Kumar", employeeRole: "Support Staff", branchId: "br-apex-01", branchName: "Apex Global Campus", salaryStructureId: "ss-004", salaryStructureName: "Support Staff", month: "August", year: 2026, workingDays: 26, presentDays: 26, baseSalary: 22000, allowances: [{ name: "HRA", amount: 5000 }, { name: "Conveyance", amount: 1000 }], grossSalary: 28000, deductions: [{ name: "PF", amount: 2640 }, { name: "Professional Tax", amount: 200 }], totalDeductions: 2840, netSalary: 25160, status: "PAID", paymentDate: "2026-08-31", paymentMode: "BANK_TRANSFER", transactionId: "TXN-SAL-2026-0806", createdAt: "2026-08-28T10:00:00Z", updatedAt: "2026-08-31T10:00:00Z" },
  { id: "pay-007", employeeId: "tch-01", employeeName: "Dr. Sarah Lin", employeeRole: "Senior Teacher", employeeAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100", branchId: "br-apex-01", branchName: "Apex Global Campus", salaryStructureId: "ss-001", salaryStructureName: "Senior Teacher", month: "September", year: 2026, workingDays: 24, presentDays: 24, baseSalary: 65000, allowances: [{ name: "HRA", amount: 15000 }, { name: "Conveyance", amount: 3000 }, { name: "Medical", amount: 2500 }], grossSalary: 85500, deductions: [{ name: "PF", amount: 7800 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 8500 }], totalDeductions: 16500, netSalary: 69000, status: "PROCESSING", createdAt: "2026-09-28T10:00:00Z", updatedAt: "2026-09-28T10:00:00Z" },
  { id: "pay-008", employeeId: "tch-02", employeeName: "Prof. Marcus Brody", employeeRole: "Senior Teacher", branchId: "br-apex-01", branchName: "Apex Global Campus", salaryStructureId: "ss-001", salaryStructureName: "Senior Teacher", month: "September", year: 2026, workingDays: 24, presentDays: 24, baseSalary: 65000, allowances: [{ name: "HRA", amount: 15000 }, { name: "Conveyance", amount: 3000 }, { name: "Medical", amount: 2500 }], grossSalary: 85500, deductions: [{ name: "PF", amount: 7800 }, { name: "Professional Tax", amount: 200 }, { name: "Income Tax", amount: 7200 }], totalDeductions: 15200, netSalary: 70300, status: "DRAFT", createdAt: "2026-09-28T10:00:00Z", updatedAt: "2026-09-28T10:00:00Z" },
];
