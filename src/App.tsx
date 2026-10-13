import React, { useState } from 'react';
import { useCrm } from './context/CrmContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LogCallModal } from './components/modals/LogCallModal';
import { CustomerModal } from './components/modals/CustomerModal';
import { CustomerDetailModal } from './components/modals/CustomerDetailModal';
import { Customer } from './types/crm';

// Page Views
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { LeadsPage } from './pages/LeadsPage';
import { OutboundCallsPage } from './pages/OutboundCallsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { SalespersonsPage } from './pages/SalespersonsPage';
import { PabxImportPage } from './pages/PabxImportPage';
import { CustomerImportPage } from './pages/CustomerImportPage';
import { ReportsPage } from './pages/ReportsPage';
import { PerformancePage } from './pages/PerformancePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { customers } = useCrm();

  const [currentModule, setCurrentModule] = useState<string>('Dashboard');

  // Modal States
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);
  const [logCallCustomerId, setLogCallCustomerId] = useState<string | undefined>();
  const [logCallLeadId, setLogCallLeadId] = useState<string | undefined>();
  const [logCallPhone, setLogCallPhone] = useState<string | undefined>();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const openLogCall = (params?: { customerId?: string; leadId?: string; phone?: string }) => {
    setLogCallCustomerId(params?.customerId);
    setLogCallLeadId(params?.leadId);
    setLogCallPhone(params?.phone);
    setIsLogCallOpen(true);
  };

  const openNewCustomer = () => {
    setCustomerToEdit(null);
    setIsCustomerModalOpen(true);
  };

  const openEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const openCustomerDetail = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsDetailModalOpen(true);
  };

  const handleLogCallForCustomer = (cust: Customer) => {
    openLogCall({ customerId: cust.id, phone: cust.mobile || cust.telephone });
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={mod => setCurrentModule(mod)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header
          currentModule={currentModule}
          onOpenLogCall={() => openLogCall()}
          onSelectCustomer={openCustomerDetail}
          onNavigateModule={mod => setCurrentModule(mod)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {currentModule === 'Dashboard' && (
              <DashboardPage
                onNavigate={mod => setCurrentModule(mod)}
                onOpenLogCall={() => openLogCall()}
                onSelectCustomer={openCustomerDetail}
                onOpenNewLead={() => setCurrentModule('Leads')}
                onOpenNewCustomer={openNewCustomer}
              />
            )}

            {currentModule === 'Customers' && (
              <CustomersPage
                onOpenNewCustomer={openNewCustomer}
                onEditCustomer={openEditCustomer}
                onSelectCustomer={openCustomerDetail}
                onLogCallForCustomer={handleLogCallForCustomer}
              />
            )}

            {currentModule === 'Leads' && (
              <LeadsPage
                onOpenLogCallForLead={lead =>
                  openLogCall({ leadId: lead.id, phone: lead.phone })
                }
                onLeadConvertedToCustomer={cid => openCustomerDetail(cid)}
              />
            )}

            {currentModule === 'Outbound Calls' && (
              <OutboundCallsPage
                onOpenLogCall={() => openLogCall()}
                onSelectCustomer={openCustomerDetail}
              />
            )}

            {currentModule === 'Inquiries' && <InquiriesPage />}

            {currentModule === 'Complaints' && <ComplaintsPage />}

            {currentModule === 'Follow-ups' && (
              <FollowUpsPage
                onLogCall={handleLogCallForCustomer}
                onSelectCustomer={openCustomerDetail}
              />
            )}

            {currentModule === 'Salespersons' && (
              <SalespersonsPage onSelectCustomer={openCustomerDetail} />
            )}

            {currentModule === 'PABX Import' && (
              <PabxImportPage
                onOpenLogCallForCustomer={cid => openLogCall({ customerId: cid })}
                onOpenNewLeadWithPhone={() => setCurrentModule('Leads')}
              />
            )}

            {currentModule === 'Customer Import' && (
              <CustomerImportPage
                onNavigateToCustomers={() => setCurrentModule('Customers')}
              />
            )}

            {currentModule === 'Reports' && <ReportsPage />}

            {currentModule === 'Performance' && <PerformancePage />}

            {currentModule === 'Notifications' && (
              <NotificationsPage onNavigate={mod => setCurrentModule(mod)} />
            )}

            {currentModule === 'User Management' && <UserManagementPage />}

            {currentModule === 'Settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <LogCallModal
        isOpen={isLogCallOpen}
        onClose={() => setIsLogCallOpen(false)}
        initialCustomerId={logCallCustomerId}
        initialLeadId={logCallLeadId}
        initialPhoneNumber={logCallPhone}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <CustomerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        customer={null}
        customerId={selectedCustomerId}
        onEdit={cust => {
          setIsDetailModalOpen(false);
          openEditCustomer(cust);
        }}
        onLogCall={cust => {
          setIsDetailModalOpen(false);
          handleLogCallForCustomer(cust);
        }}
      />
    </div>
  );
};
