import React from 'react';
import { CompanyData } from '@interfaces/company.interface';
import CompanyCard from './CompanyCard';

interface CompanyGridProps {
  companies: CompanyData[];
  onEdit: (company: CompanyData) => void;
  onDelete: (company: CompanyData) => void;
  onSetDefault: (company: CompanyData) => void;
}

const CompanyGrid: React.FC<CompanyGridProps> = ({ companies, onEdit, onDelete, onSetDefault }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onEdit={onEdit}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
        />
      ))}
    </div>
  );
};

export default CompanyGrid;
