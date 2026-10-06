/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'employee';
export type UserStatus = 'active' | 'inactive';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectStatus = 'Active' | 'On Hold' | 'Completed' | 'Archived';
export type ProjectStage = 'Early Stage' | 'In Progress' | 'Final Stage' | 'Complete';
export type ProjectHealth = 'Excellent' | 'On Track' | 'Slight Delay' | 'High Risk' | 'Critical';

export interface User {
  uid: string;
  fullName: string;
  email: string;
  username: string;
  employeeId: string; // e.g. MS2-EMP-001
  role: UserRole;
  status: UserStatus;
  department?: string;
  designation?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Project {
  projectId: string;
  projectCode: string; // e.g. MS2-PRJ-001
  projectName: string;
  clientName?: string;
  description: string;
  startDate: string;
  deadline: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  currentStage: ProjectStage;
  currentCompletionPercent: number; // e.g. 20, 55, 85, 100
  expectedProgressPercent: number; // calculated from timeline
  healthStatus: ProjectHealth;
  assignedEmployeeIds: string[]; // array of employee uids
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  assignmentId: string;
  projectId: string;
  employeeId: string; // employee uid
  assignedBy: string; // admin uid
  assignedAt: string;
  status: 'active' | 'removed';
}

export interface DailyProgress {
  progressId: string; // format: employeeUid_projectId_date (prevents duplicate same-day updates!)
  employeeUid: string;
  employeeId: string; // e.g. MS2-EMP-001
  employeeName: string;
  projectId: string;
  projectName: string;
  date: string; // format: YYYY-MM-DD
  selectedStage: ProjectStage;
  workSummary: string;
  notes?: string;
  autoCompletionPercent: number;
  expectedProgressPercent: number;
  healthStatus: ProjectHealth;
  isLocked: boolean;
  submittedAt: string;
}

export interface ActivityLog {
  logId: string;
  userId: string;
  username: string;
  action: string;
  targetType: 'project' | 'employee' | 'progress' | 'assignment' | 'system';
  targetId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AppSettings {
  companyName: string;
  logoUrl?: string;
  themeMode: 'dark' | 'light';
  defaultReminderTime: string;
  projectStages: string[];
  isLocked: boolean;
}

export interface InAppNotification {
  notificationId: string;
  userId: string; // 'admin' or of specific employee
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export interface AdminPrivateNotesData {
  projects: Record<string, string>;
  employees: Record<string, string>;
  progress: Record<string, string>;
}

