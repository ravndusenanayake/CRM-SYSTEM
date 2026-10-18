import {
  User,
  Salesperson,
  Customer,
  Lead,
  CallRecord,
  Inquiry,
  Complaint,
  PabxRecord,
  NotificationItem,
  SystemSettings,
  InquiryStatus,
  ComplaintStatus,
  CallOutcome,
  ComplaintPriority
} from '../types/crm';

export interface BootstrapData {
  users: User[];
  salespersons: Salesperson[];
  customers: Customer[];
  leads: Lead[];
  calls: CallRecord[];
  inquiries: Inquiry[];
  complaints: Complaint[];
  pabxRecords: PabxRecord[];
  notifications: NotificationItem[];
  settings: SystemSettings;
}

export interface LogCallPayload {
  customerId?: string;
  leadId?: string;
  contactName: string;
  companyName: string;
  phoneNumber: string;
  durationSeconds: number;
  outcome: CallOutcome;
  notes: string;
  nextFollowUpDate?: string;
  crmUserId: string;
  createInquiry?: boolean;
  inquiryDivision?: string;
  inquiryItems?: string;
  createComplaint?: boolean;
  complaintNature?: string;
  complaintDescription?: string;
  complaintPriority?: ComplaintPriority;
}

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export const crmApi = {
  // Bootstrap / System
  checkHealth: () => request<{ status: string; database: string }>('/health'),
  getBootstrap: () => request<BootstrapData>('/bootstrap'),
  resetDatabase: () => request<{ success: boolean; message: string }>('/system/reset', { method: 'POST' }),

  // Users
  getUsers: () => request<User[]>('/users'),
  addUser: (data: Omit<User, 'id'>) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: Partial<User>) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Salespersons
  getSalespersons: () => request<Salesperson[]>('/salespersons'),
  addSalesperson: (data: Omit<Salesperson, 'id'>) => request<Salesperson>('/salespersons', { method: 'POST', body: JSON.stringify(data) }),
  updateSalesperson: (id: string, data: Partial<Salesperson>) => request<Salesperson>(`/salespersons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Customers
  getCustomers: () => request<Customer[]>('/customers'),
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) =>
    request<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: Partial<Customer>) =>
    request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) => request<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE' }),
  bulkImportCustomers: (customers: Array<Omit<Customer, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>>) =>
    request<{ imported: number }>('/customers/bulk', { method: 'POST', body: JSON.stringify({ customers }) }),
  reassignCustomer: (id: string, assignedCrmUserId?: string, assignedSalespersonId?: string, updatedBy?: string) =>
    request<Customer>(`/customers/${id}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ assignedCrmUserId, assignedSalespersonId, updatedBy })
    }),
  addCustomerVisitNotes: (id: string, note: string, author?: string) =>
    request<Customer>(`/customers/${id}/visit-notes`, {
      method: 'POST',
      body: JSON.stringify({ note, author })
    }),

  // Leads
  getLeads: () => request<Lead[]>('/leads'),
  addLead: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Lead>('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id: string, data: Partial<Lead>) =>
    request<Lead>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLead: (id: string) => request<{ success: boolean }>(`/leads/${id}`, { method: 'DELETE' }),
  convertLeadToCustomer: (id: string) =>
    request<{ customer: Customer; lead: Lead }>(`/leads/${id}/convert`, { method: 'POST' }),

  // Calls
  getCalls: () => request<CallRecord[]>('/calls'),
  logCall: (payload: LogCallPayload) =>
    request<{ call: CallRecord; linkedInquiryId?: string; linkedComplaintId?: string }>('/calls', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Inquiries
  getInquiries: () => request<Inquiry[]>('/inquiries'),
  addInquiry: (data: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<Inquiry>('/inquiries', { method: 'POST', body: JSON.stringify(data) }),
  updateInquiry: (id: string, data: Partial<Inquiry>) =>
    request<Inquiry>(`/inquiries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateInquiryStatus: (id: string, status: InquiryStatus) =>
    request<Inquiry>(`/inquiries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Complaints
  getComplaints: () => request<Complaint[]>('/complaints'),
  addComplaint: (data: Omit<Complaint, 'id' | 'createdAt'>) =>
    request<Complaint>('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  updateComplaint: (id: string, data: Partial<Complaint>) =>
    request<Complaint>(`/complaints/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateComplaintStatus: (id: string, status: ComplaintStatus, resolutionNotes?: string) =>
    request<Complaint>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes })
    }),

  // PABX
  getPabx: () => request<PabxRecord[]>('/pabx'),
  convertPabxRecordToLead: (id: string, companyName: string, contactPerson: string) =>
    request<{ lead: Lead; pabx: PabxRecord }>(`/pabx/${id}/convert-to-lead`, {
      method: 'POST',
      body: JSON.stringify({ companyName, contactPerson })
    }),
  simulatePabxCall: (payload?: Record<string, unknown>) =>
    request<PabxRecord>('/pabx/test', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    }),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationAsRead: (id: string) =>
    request<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsAsRead: () =>
    request<NotificationItem[]>('/notifications/mark-all-read', { method: 'POST' }),

  // Settings
  getSettings: () => request<SystemSettings>('/settings'),
  updateSettings: (settings: Partial<SystemSettings>) =>
    request<SystemSettings>('/settings', { method: 'PUT', body: JSON.stringify(settings) })
};
