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
  targetQuarterLkr?: number;
  monthlyTargetLkr?: number;
  currentSalesLkr: number;
}

export type CustomerType =
  | 'Workshop'
  | 'Fleet Operator'
  | 'Fleet Owner'
  | 'Construction Contractor'
  | 'Marine & Industrial'
  | 'Metal Fabricator'
  | 'Industrial Plant'
  | 'Dealer / Retailer'
  | 'Retailer'
  | 'Other'
  | string;

export type CustomerStatus = 'Active' | 'Inactive' | 'Lead' | 'Prospect' | 'New' | string;

export interface VisitNote {
  id: string;
  customerId: string;
  date: string;
  time: string;
  loggedInUserId: string;
  loggedInUserName: string;
  serviceFeedback: string;
  brandPerception: string;
  lastVisitDate: string;
  summaryNote: string;
  isProductive: boolean;
  callOutcome?: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

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
  serviceRating?: string;
  brandPerception?: string;
  isLastCallProductive?: boolean;
  visitNotes?: VisitNote[];
  outstandingBalanceLkr?: number;
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted to Customer' | 'Lost' | string;

export interface Lead {
  id: string;
  contactName?: string;
  contactPerson?: string;
  companyName: string;
  phone?: string;
  mobile?: string;
  telephone?: string;
  email: string;
  address?: string;
  city: string;
  industry?: string;
  productInterest?: string;
  requirement?: string;
  estimatedValueLkr: number;
  source: string;
  stage?: string;
  status?: LeadStatus;
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
  | 'Answered - Order Inquired'
  | 'Answered - Product Demo'
  | 'No Answer'
  | 'Busy'
  | 'Wrong Number'
  | string;

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

export type InquiryDivision = 'Automotive' | 'Construction & Fasteners' | 'Construction' | 'Metal & Maintenance' | 'Cargo & Fleet' | 'Safety & PPE' | string;
export type InquiryStatus = 'New' | 'Quoted' | 'Quote Sent' | 'Follow-up Required' | 'Pending Customer' | 'Converted to Order' | 'Cancelled' | string;

export interface Inquiry {
  id: string;
  customerId?: string;
  leadId?: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  division: InquiryDivision;
  productCategory?: string;
  requirementDetails?: string;
  itemsRequested?: string;
  inquiryType?: string;
  estimatedValueLkr: number;
  status: InquiryStatus;
  assignedSalespersonId?: string;
  crmUserId: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type ComplaintPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'Open' | 'Under Investigation' | 'Action Required' | 'Resolved' | 'Closed' | string;

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
