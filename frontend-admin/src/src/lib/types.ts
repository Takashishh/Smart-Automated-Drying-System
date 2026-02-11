export type Role = 'admin' | 'super-admin';
export interface User {
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  status: 'active' | 'disabled';
  createdDate: string;
  lastLogin: string;
  assignedDevices: string[]; // Array of device IDs (many-to-many)
  deviceCount: number;
}
export interface Device {
  deviceId: string;
  macId: string;
  userIds: string[]; // Changed to array for many-to-many relationship
  userNames?: string[]; // Helper for display
  status: 'active' | 'inactive' | 'unassigned';
  createdDate: string;
  assignedDate: string | null;
  createdBy?: string;
  assignedBy?: string;
}
export type TicketStatus = 'unresolved' | 'resolving' | 'resolved';
export type IssueType = 'sensor' | 'actuator' | 'connectivity' | 'hardware' | 'software' | 'support' | 'other';
export interface Ticket {
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  issueType: IssueType;
  description: string;
  status: TicketStatus;
  createdDate: string;
  resolvedDate: string | null;
  notes: string;
  updatedBy?: string;
}
export interface Admin {
  adminId: string;
  uid?: string; // Firebase UID
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  role: Role;
  status: 'active' | 'disabled';
  authMethod: 'email' | 'google';
  createdDate: string;
  lastLogin: string;
  phoneNumber?: string;
  address?: string;
  createdBy?: string;
}
export interface AuditLog {
  logId: string;
  adminId: string;
  adminName: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
}
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'User Notification' | 'Status Update' | 'Appointment' | 'General';
  content: string;
}
export interface EmailLog {
  id: string;
  sentBy: string;
  sentByName?: string;
  recipient: string;
  templateName: string;
  templateId?: string;
  subject?: string;
  sentDate: string;
  status: 'sent' | 'failed';
  variables?: Record<string, string>;
  error?: string;
}