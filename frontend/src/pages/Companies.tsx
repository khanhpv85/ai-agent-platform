import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { RootState } from '@store';
import { 
  fetchUserCompanies, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  setDefaultCompany
} from '@services/company.service';
import { LoadingSpinner } from '@components/UI';
import { CompanyData, CreateCompanyData, UpdateCompanyData } from '@interfaces/company.interface';
import {
  Header,
  Filters,
  CompanyGrid,
  Pagination,
  CreateCompanyModal,
  EditCompanyModal,
  DeleteCompanyModal
} from '@components/Companies';

interface CompanyFormData {
  name: string;
  domain: string;
  subscription_plan: string;
  max_agents: number;
}

interface FilterData {
  search: string;
  subscription_plan: string;
  role: string;
}

const Companies: React.FC = () => {
  const dispatch = useDispatch();
  const { companies, pagination, loading, error } = useSelector((state: RootState) => state.company);
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [filters, setFilters] = useState<FilterData>({
    search: '',
    subscription_plan: '',
    role: ''
  });
  
  // Form state
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    domain: '',
    subscription_plan: 'free',
    max_agents: 5
  });

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, [currentPage, pageSize]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const loadCompanies = async () => {
    try {
      await dispatch(fetchUserCompanies({ page: currentPage, limit: pageSize }) as any);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      const createData: CreateCompanyData = {
        name: formData.name,
        domain: formData.domain || undefined,
        subscription_plan: formData.subscription_plan,
        max_agents: formData.max_agents,
      };

      await dispatch(createCompany(createData) as any);
      setShowCreateModal(false);
      resetForm();
      toast.success('Company created successfully!');
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompany || !formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      const updateData: UpdateCompanyData = {
        name: formData.name,
        domain: formData.domain || undefined,
        subscription_plan: formData.subscription_plan,
        max_agents: formData.max_agents,
      };

      await dispatch(updateCompany({ id: selectedCompany.id, data: updateData }) as any);
      setShowEditModal(false);
      resetForm();
      toast.success('Company updated successfully!');
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      await dispatch(deleteCompany(selectedCompany.id) as any);
      setShowDeleteModal(false);
      setSelectedCompany(null);
      toast.success('Company deleted successfully!');
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  const handleSetDefault = async (company: CompanyData) => {
    try {
      await dispatch(setDefaultCompany(company.id) as any);
      toast.success(`${company.name} set as default company!`);
    } catch (error) {
      console.error('Failed to set default company:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      subscription_plan: 'free',
      max_agents: 5
    });
  };

  const openEditModal = (company: CompanyData) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      domain: company.domain || '',
      subscription_plan: company.subscription_plan,
      max_agents: company.max_agents,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (company: CompanyData) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  // Filter companies based on search and filters
  const filteredCompanies = useMemo(() => {
    // Ensure companies is always an array
    const companiesArray = Array.isArray(companies) ? companies : [];
    
    return companiesArray.filter(company => {
      // Ensure company properties exist before accessing them
      const companyName = company?.name || '';
      const companyDomain = company?.domain || '';
      const companyPlan = company?.subscription_plan || '';
      const companyRole = company?.role || '';
      
      const matchesSearch = companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
                           (companyDomain && companyDomain.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesPlan = !filters.subscription_plan || companyPlan === filters.subscription_plan;
      const matchesRole = !filters.role || companyRole === filters.role;
      
      return matchesSearch && matchesPlan && matchesRole;
    });
  }, [companies, filters]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading && (!companies || companies.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header onCreateClick={() => setShowCreateModal(true)} />

      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters({ search: '', subscription_plan: '', role: '' })}
      />

      <CompanyGrid
        companies={filteredCompanies}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onSetDefault={handleSetDefault}
      />

      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      )}

      <CreateCompanyModal
        isOpen={showCreateModal}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleCreateCompany}
        onCancel={() => {
          setShowCreateModal(false);
          resetForm();
        }}
      />

      <EditCompanyModal
        isOpen={showEditModal}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleUpdateCompany}
        onCancel={() => {
          setShowEditModal(false);
          resetForm();
        }}
      />

      <DeleteCompanyModal
        isOpen={showDeleteModal}
        company={selectedCompany}
        onConfirm={handleDeleteCompany}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Companies;
