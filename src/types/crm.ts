export type UserRole = 'ADMIN' | 'CRM_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  extension: string;
  phone: string;
  dailyCallTarget: number;
  active: boolean;
  assignedRegion?: string;
  department: string;
}

export interface Salesperson {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  division: string;
  targetQuarterLkr: number;
  currentSalesLkr: number;
}

export type CustomerType = 'Workshop' | 'Fleet Operator' | 'Construction Contractor' | 'Marine & Industrial' | 'Retailer' | 'Other';
export type CustomerStatus = 'Active' | 'Inactive' | 'Lead';

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  telephone?: string;
  email: string;
  address: string;
  city: string;
  customerType: CustomerType;
  industry: string;
  source: string;
  assignedCrmUserId: string;
  assignedSalespersonId: string;
  status: CustomerStatus;
  lastVisitDate?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted to Customer' | 'Lost';

export interface Lead {
  id: string;
  contactName: string;
  companyName: string;
  phone: string;
  email: string;
  city: string;
  requirement: string;
  estimatedValueLkr: number;
  source: string;
  status: LeadStatus;
  assignedCrmUserId: string;
  assignedSalespersonId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CallOutcome = 
  | 'Answered - Positive'
  | 'Answered - Follow-up Needed'
  | 'Answered - Complaint Raised'
  | 'Answered - Inquiry Created'
  | 'No Answer'
  | 'Busy'
  | 'Wrong Number';

export interface CallRecord {
  id: string;
  customerId?: string;
  leadId?: string;
  contactName: string;
  companyName: string;
  phoneNumber: string;
  callDate: string;
  durationSeconds: number;
  outcome: CallOutcome;
  notes: string;
  nextFollowUpDate?: string;
  crmUserId: string;
  linkedInquiryId?: string;
  linkedComplaintId?: string;
}

export type InquiryDivision = 'Automotive' | 'Construction & Fasteners' | 'Metal & Maintenance' | 'Cargo & Fleet';
export type InquiryStatus = 'New' | 'Quoted' | 'Follow-up Required' | 'Converted to Order' | 'Cancelled';

export interface Inquiry {
  id: string;
  customerId?: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  division: InquiryDivision;
  productCategory: string;
  requirementDetails: string;
  estimatedValueLkr: number;
  status: InquiryStatus;
  assignedSalespersonId?: string;
  crmUserId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type ComplaintPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';

export interface Complaint {
  id: string;
  customerId?: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  invoiceOrItemRef: string;
  nature: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  slaDeadline: string;
  description: string;
  resolutionNotes?: string;
  assignedSalespersonId?: string;
  crmUserId: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PabxRecord {
  id: string;
  callTime: string;
  direction: 'Inbound' | 'Outbound';
  extension: string;
  externalNumber: string;
  durationSeconds: number;
  disposition: 'Answered' | 'Missed' | 'Busy';
  matchedCustomerId?: string;
  matchedCustomerName?: string;
  matchedCompanyName?: string;
  isLeadConverted?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'complaint' | 'inquiry' | 'followup' | 'alert';
  timestamp: string;
  read: boolean;
  linkModule?: string;
  referenceId?: string;
  forCrmUserId?: string;
}

export interface SystemSettings {
  companyName: string;
  phone: string;
  email: string;
  address: string;
  pbxHost: string;
  pbxSecret: string;
  pbxExtensionRange: string;
  criticalSlaHours: number;
  mediumSlaHours: number;
  defaultCurrency: string;
}
