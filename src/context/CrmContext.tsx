import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  InquiryDivision,
  InquiryStatus,
  ComplaintPriority,
  ComplaintStatus,
  CallOutcome
} from '../types/crm';
import {
  INITIAL_USERS,
  INITIAL_SALESPERSONS,
  INITIAL_CUSTOMERS,
  INITIAL_LEADS,
  INITIAL_CALLS,
  INITIAL_INQUIRIES,
  INITIAL_COMPLAINTS,
  INITIAL_PABX,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS
} from '../data/initialData';
import { crmApi } from '../services/api';

const STORAGE_PREFIX = 'wurth_crm_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

interface LogCallParams {
  customerId?: string;
  leadId?: string;
  contactName: string;
  companyName: string;
  phoneNumber: string;
  durationSeconds: number;
  outcome: CallOutcome;
  notes: string;
  nextFollowUpDate?: string;
  createInquiry?: boolean;
  inquiryDivision?: string;
  inquiryItems?: string;
  createComplaint?: boolean;
  complaintNature?: string;
  complaintDescription?: string;
  complaintPriority?: ComplaintPriority;
}

export type DbStatus = 'connected' | 'connecting' | 'offline';

interface CrmContextType {
  dbStatus: DbStatus;
  refreshData: () => Promise<void>;

  users: User[];
  currentUser: User;
  currentUserId: string;
  switchUser: (userId: string) => void;
  isAdmin: boolean;
  salespersons: Salesperson[];
  allCustomers: Customer[];
  customers: Customer[];
  allLeads: Lead[];
  leads: Lead[];
  calls: CallRecord[];
  inquiries: Inquiry[];
  complaints: Complaint[];
  pabxRecords: PabxRecord[];
  notifications: NotificationItem[];
  settings: SystemSettings;

  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  reassignCustomer: (customerId: string, newCrmUserId?: string, newSalespersonId?: string) => void;
  addCustomerVisitNotes: (customerId: string, notes: string) => void;
  bulkImportCustomers: (newCustomers: Omit<Customer, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]) => number;

  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  convertLeadToCustomer: (leadId: string) => Customer | null;

  logCall: (params: LogCallParams) => void;

  addInquiry: (inq: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInquiryStatus: (id: string, status: InquiryStatus) => void;

  addComplaint: (comp: Omit<Complaint, 'id' | 'createdAt'>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, resolutionNotes?: string) => void;

  convertPabxRecordToLead: (pabxId: string, companyName: string, contactPerson: string) => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  updateSettings: (updates: Partial<SystemSettings>) => void;
  resetDatabase: () => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dbStatus, setDbStatus] = useState<DbStatus>('connecting');

  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadFromStorage('currentUserId', 'admin-1'));
  const [salespersons, setSalespersons] = useState<Salesperson[]>(() => loadFromStorage('salespersons', INITIAL_SALESPERSONS));
  const [allCustomers, setAllCustomers] = useState<Customer[]>(() => loadFromStorage('customers', INITIAL_CUSTOMERS));
  const [allLeads, setAllLeads] = useState<Lead[]>(() => loadFromStorage('leads', INITIAL_LEADS));
  const [calls, setCalls] = useState<CallRecord[]>(() => loadFromStorage('calls', INITIAL_CALLS));
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => loadFromStorage('inquiries', INITIAL_INQUIRIES));
  const [complaints, setComplaints] = useState<Complaint[]>(() => loadFromStorage('complaints', INITIAL_COMPLAINTS));
  const [pabxRecords, setPabxRecords] = useState<PabxRecord[]>(() => loadFromStorage('pabx', INITIAL_PABX));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [settings, setSettings] = useState<SystemSettings>(() => loadFromStorage('settings', INITIAL_SETTINGS));

  // Sync to localStorage as offline cache
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => saveToStorage('salespersons', salespersons), [salespersons]);
  useEffect(() => saveToStorage('customers', allCustomers), [allCustomers]);
  useEffect(() => saveToStorage('leads', allLeads), [allLeads]);
  useEffect(() => saveToStorage('calls', calls), [calls]);
  useEffect(() => saveToStorage('inquiries', inquiries), [inquiries]);
  useEffect(() => saveToStorage('complaints', complaints), [complaints]);
  useEffect(() => saveToStorage('pabx', pabxRecords), [pabxRecords]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('settings', settings), [settings]);

  // Load from REST API SQLite Backend
  const refreshData = useCallback(async () => {
    try {
      const data = await crmApi.getBootstrap();
      if (data) {
        if (data.users?.length) setUsers(data.users);
        if (data.salespersons?.length) setSalespersons(data.salespersons);
        if (data.customers?.length) setAllCustomers(data.customers);
        if (data.leads?.length) setAllLeads(data.leads);
        if (data.calls?.length) setCalls(data.calls);
        if (data.inquiries?.length) setInquiries(data.inquiries);
        if (data.complaints?.length) setComplaints(data.complaints);
        if (data.pabxRecords?.length) setPabxRecords(data.pabxRecords);
        if (data.notifications?.length) setNotifications(data.notifications);
        if (data.settings && Object.keys(data.settings).length) setSettings(data.settings);
        setDbStatus('connected');
        console.log('✅ SQLite Backend Connected (server/data/crm.db)');
      }
    } catch (err) {
      console.warn('⚠️ Backend REST API not reachable, running in offline mode:', err);
      setDbStatus('offline');
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const isAdmin = currentUser.role === 'ADMIN';

  // Role-based customer & lead filtering
  const customers = isAdmin ? allCustomers : allCustomers.filter(c => c.assignedCrmUserId === currentUser.id);
  const leads = isAdmin ? allLeads : allLeads.filter(l => l.assignedCrmUserId === currentUser.id);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>): Customer => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `CUST-${1000 + allCustomers.length + 1}`;
    const newCustomer: Customer = {
      ...data,
      id: newId,
      createdAt: today,
      createdBy: currentUser.name,
      updatedAt: today,
      updatedBy: currentUser.name
    };
    setAllCustomers(prev => [newCustomer, ...prev]);

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.addCustomer(data).then(created => {
        if (created && created.id) {
          setAllCustomers(prev => prev.map(c => c.id === newId ? created : c));
        }
      }).catch(err => console.error('Failed to sync customer to SQLite:', err));
    }

    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const today = new Date().toISOString().split('T')[0];
    setAllCustomers(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: today, updatedBy: currentUser.name } : c))
    );

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.updateCustomer(id, { ...updates, updatedBy: currentUser.name }).catch(err =>
        console.error('Failed to sync customer update to SQLite:', err)
      );
    }
  };

  const deleteCustomer = (id: string) => {
    setAllCustomers(prev => prev.filter(c => c.id !== id));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.deleteCustomer(id).catch(err => console.error('Failed to delete customer from SQLite:', err));
    }
  };

  const reassignCustomer = (customerId: string, newCrmUserId?: string, newSalespersonId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAllCustomers(prev =>
      prev.map(c => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          assignedCrmUserId: newCrmUserId || c.assignedCrmUserId,
          assignedSalespersonId: newSalespersonId || c.assignedSalespersonId,
          updatedAt: today,
          updatedBy: currentUser.name
        };
      })
    );

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.reassignCustomer(customerId, newCrmUserId, newSalespersonId, currentUser.name).catch(err =>
        console.error('Failed to reassign customer in SQLite:', err)
      );
    }
  };

  const addCustomerVisitNotes = (customerId: string, newNote: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAllCustomers(prev =>
      prev.map(c => {
        if (c.id !== customerId) return c;
        const updatedNotes = c.notes ? `${c.notes}\n[${today} - ${currentUser.name}]: ${newNote}` : `[${today} - ${currentUser.name}]: ${newNote}`;
        return {
          ...c,
          notes: updatedNotes,
          lastContactDate: today,
          updatedAt: today,
          updatedBy: currentUser.name
        };
      })
    );

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.addCustomerVisitNotes(customerId, newNote, currentUser.name).catch(err =>
        console.error('Failed to save visit note to SQLite:', err)
      );
    }
  };

  const bulkImportCustomers = (newItems: Omit<Customer, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>[]): number => {
    const today = new Date().toISOString().split('T')[0];
    let startIdx = 1000 + allCustomers.length + 1;
    const mapped: Customer[] = newItems.map((item, idx) => ({
      ...item,
      id: `CUST-${startIdx + idx}`,
      createdAt: today,
      createdBy: currentUser.name,
      updatedAt: today,
      updatedBy: currentUser.name
    }));
    setAllCustomers(prev => [...mapped, ...prev]);

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.bulkImportCustomers(newItems).then(() => refreshData()).catch(err =>
        console.error('Failed to bulk import to SQLite:', err)
      );
    }

    return mapped.length;
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `LEAD-${new Date().getFullYear()}-${String(allLeads.length + 1).padStart(3, '0')}`;
    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: today,
      updatedAt: today
    };
    setAllLeads(prev => [newLead, ...prev]);

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.addLead(leadData).then(created => {
        if (created && created.id) {
          setAllLeads(prev => prev.map(l => l.id === newId ? created : l));
        }
      }).catch(err => console.error('Failed to save lead to SQLite:', err));
    }

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const today = new Date().toISOString().split('T')[0];
    setAllLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates, updatedAt: today } : l)));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.updateLead(id, updates).catch(err => console.error('Failed to update lead in SQLite:', err));
    }
  };

  const deleteLead = (id: string) => {
    setAllLeads(prev => prev.filter(l => l.id !== id));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.deleteLead(id).catch(err => console.error('Failed to delete lead from SQLite:', err));
    }
  };

  const convertLeadToCustomer = (leadId: string): Customer | null => {
    const lead = allLeads.find(l => l.id === leadId);
    if (!lead) return null;

    const newCustomer = addCustomer({
      name: lead.contactName,
      companyName: lead.companyName,
      contactPerson: lead.contactName,
      mobile: lead.phone,
      email: lead.email,
      address: lead.city,
      city: lead.city,
      customerType: 'Workshop',
      industry: 'Automotive',
      source: `Lead Conversion (${lead.source})`,
      assignedCrmUserId: lead.assignedCrmUserId || currentUser.id,
      assignedSalespersonId: lead.assignedSalespersonId || salespersons[0]?.id || 'sales-1',
      status: 'Active',
      notes: `Converted from lead ${lead.id}. Requirement: ${lead.requirement}. Notes: ${lead.notes || 'None'}`
    });

    updateLead(leadId, { status: 'Converted to Customer' });

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.convertLeadToCustomer(leadId).catch(err =>
        console.error('Failed to convert lead in SQLite:', err)
      );
    }

    return newCustomer;
  };

  const logCall = (params: LogCallParams) => {
    const today = new Date();
    const dateStr = today.toISOString().replace('T', ' ').substring(0, 16);
    const newCallId = `CALL-${today.getFullYear()}-${100 + calls.length + 1}`;

    let linkedInqId: string | undefined;
    let linkedCmpId: string | undefined;

    // Optional direct inquiry creation
    if (params.createInquiry) {
      linkedInqId = `INQ-${today.getFullYear()}-${String(inquiries.length + 1).padStart(3, '0')}`;
      const newInquiry: Inquiry = {
        id: linkedInqId,
        customerId: params.customerId,
        companyName: params.companyName,
        contactPerson: params.contactName,
        phone: params.phoneNumber,
        division: (params.inquiryDivision as InquiryDivision) || 'Automotive',
        productCategory: 'Commercial Consumables & Fasteners',
        requirementDetails: params.inquiryItems || 'Generated during outbound phone call.',
        estimatedValueLkr: 50000,
        status: 'New',
        crmUserId: currentUser.id,
        createdAt: today.toISOString().split('T')[0],
        updatedAt: today.toISOString().split('T')[0]
      };
      setInquiries(prev => [newInquiry, ...prev]);
    }

    // Optional direct complaint creation
    if (params.createComplaint) {
      linkedCmpId = `CMP-${today.getFullYear()}-${String(complaints.length + 1).padStart(3, '0')}`;
      const newComplaint: Complaint = {
        id: linkedCmpId,
        customerId: params.customerId,
        companyName: params.companyName,
        contactPerson: params.contactName,
        phone: params.phoneNumber,
        invoiceOrItemRef: 'Outbound Call Complaint',
        nature: params.complaintNature || 'Product Defect / Quality Issue',
        priority: params.complaintPriority || 'Medium',
        status: 'Open',
        slaDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16),
        description: params.complaintDescription || 'Dispute raised during phone call.',
        crmUserId: currentUser.id,
        createdAt: today.toISOString().split('T')[0]
      };
      setComplaints(prev => [newComplaint, ...prev]);
    }

    const newCall: CallRecord = {
      id: newCallId,
      customerId: params.customerId,
      leadId: params.leadId,
      contactName: params.contactName,
      companyName: params.companyName,
      phoneNumber: params.phoneNumber,
      callDate: dateStr,
      durationSeconds: params.durationSeconds,
      outcome: params.outcome,
      notes: params.notes,
      nextFollowUpDate: params.nextFollowUpDate,
      crmUserId: currentUser.id,
      linkedInquiryId: linkedInqId,
      linkedComplaintId: linkedCmpId
    };

    setCalls(prev => [newCall, ...prev]);

    // Update customer last contacted & follow up dates
    if (params.customerId) {
      updateCustomer(params.customerId, {
        lastContactDate: today.toISOString().split('T')[0],
        nextFollowUpDate: params.nextFollowUpDate || undefined
      });
    }

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.logCall({
        ...params,
        crmUserId: currentUser.id
      }).catch(err => console.error('Failed to log call to SQLite:', err));
    }
  };

  const addInquiry = (inqData: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `INQ-${new Date().getFullYear()}-${String(inquiries.length + 1).padStart(3, '0')}`;
    const newInquiry: Inquiry = {
      ...inqData,
      id: newId,
      createdAt: today,
      updatedAt: today
    };
    setInquiries(prev => [newInquiry, ...prev]);

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.addInquiry(inqData).then(created => {
        if (created && created.id) {
          setInquiries(prev => prev.map(i => i.id === newId ? created : i));
        }
      }).catch(err => console.error('Failed to save inquiry to SQLite:', err));
    }
  };

  const updateInquiryStatus = (id: string, status: InquiryStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setInquiries(prev => prev.map(inq => (inq.id === id ? { ...inq, status, updatedAt: today } : inq)));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.updateInquiryStatus(id, status).catch(err =>
        console.error('Failed to update inquiry status in SQLite:', err)
      );
    }
  };

  const addComplaint = (compData: Omit<Complaint, 'id' | 'createdAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `CMP-${new Date().getFullYear()}-${String(complaints.length + 1).padStart(3, '0')}`;
    const newComplaint: Complaint = {
      ...compData,
      id: newId,
      createdAt: today
    };
    setComplaints(prev => [newComplaint, ...prev]);

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.addComplaint(compData).then(created => {
        if (created && created.id) {
          setComplaints(prev => prev.map(c => c.id === newId ? created : c));
        }
      }).catch(err => console.error('Failed to save complaint to SQLite:', err));
    }
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus, resolutionNotes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setComplaints(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              status,
              resolutionNotes: resolutionNotes || c.resolutionNotes,
              resolvedAt: status === 'Resolved' || status === 'Closed' ? today : c.resolvedAt
            }
          : c
      )
    );

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.updateComplaintStatus(id, status, resolutionNotes).catch(err =>
        console.error('Failed to update complaint status in SQLite:', err)
      );
    }
  };

  const convertPabxRecordToLead = (pabxId: string, companyName: string, contactPerson: string) => {
    const cdr = pabxRecords.find(p => p.id === pabxId);
    if (!cdr) return;

    addLead({
      contactName: contactPerson,
      companyName,
      phone: cdr.externalNumber,
      email: 'info@prospect.lk',
      city: 'Colombo',
      requirement: 'Inbound caller from PABX telephonic system.',
      estimatedValueLkr: 75000,
      source: 'PABX Inbound Call',
      status: 'New',
      assignedCrmUserId: currentUser.id,
      notes: `Generated from CDR ${pabxId} on Ext ${cdr.extension}. Duration: ${cdr.durationSeconds}s`
    });

    setPabxRecords(prev =>
      prev.map(p => (p.id === pabxId ? { ...p, isLeadConverted: true, matchedCompanyName: companyName } : p))
    );

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.convertPabxRecordToLead(pabxId, companyName, contactPerson).catch(err =>
        console.error('Failed to convert PABX to lead in SQLite:', err)
      );
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.markNotificationAsRead(id).catch(err => console.error('Failed to mark notification read in SQLite:', err));
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.markAllNotificationsAsRead().catch(err => console.error('Failed to mark all read in SQLite:', err));
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newId = `user-${users.length + 1}`;
    setUsers(prev => [...prev, { ...userData, id: newId }]);

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.addUser(userData).catch(err => console.error('Failed to add user to SQLite:', err));
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.updateUser(id, updates).catch(err => console.error('Failed to update user in SQLite:', err));
    }
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));

    // Async DB save
    if (dbStatus === 'connected') {
      crmApi.updateSettings(updates).catch(err => console.error('Failed to update settings in SQLite:', err));
    }
  };

  const resetDatabase = async () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserId('admin-1');
    setSalespersons(INITIAL_SALESPERSONS);
    setAllCustomers(INITIAL_CUSTOMERS);
    setAllLeads(INITIAL_LEADS);
    setCalls(INITIAL_CALLS);
    setInquiries(INITIAL_INQUIRIES);
    setComplaints(INITIAL_COMPLAINTS);
    setPabxRecords(INITIAL_PABX);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(INITIAL_SETTINGS);

    if (dbStatus === 'connected') {
      try {
        await crmApi.resetDatabase();
        await refreshData();
      } catch (err) {
        console.error('Failed to reset backend SQLite:', err);
      }
    }
  };

  return (
    <CrmContext.Provider
      value={{
        dbStatus,
        refreshData,

        users,
        currentUser,
        currentUserId,
        switchUser,
        isAdmin,
        salespersons,
        allCustomers,
        customers,
        allLeads,
        leads,
        calls,
        inquiries,
        complaints,
        pabxRecords,
        notifications,
        settings,

        addCustomer,
        updateCustomer,
        deleteCustomer,
        reassignCustomer,
        addCustomerVisitNotes,
        bulkImportCustomers,

        addLead,
        updateLead,
        deleteLead,
        convertLeadToCustomer,

        logCall,

        addInquiry,
        updateInquiryStatus,

        addComplaint,
        updateComplaintStatus,

        convertPabxRecordToLead,

        markNotificationAsRead,
        markAllNotificationsAsRead,

        addUser,
        updateUser,

        updateSettings,
        resetDatabase
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = (): CrmContextType => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
