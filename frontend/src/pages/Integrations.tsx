import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Database, 
  FileText, 
  Globe, 
  Link, 
  Settings, 
  Trash2, 
  Edit, 
  Eye,
  CheckCircle,
  AlertTriangle,
  Upload,
  Download
} from 'lucide-react';
import { Button, Badge, Input, Modal, Card, CardContent, CardHeader, CardTitle } from '@components/UI';
import { RootState, AppDispatch } from '@store/index';
import { KnowledgeBase, SourceType } from '@interfaces/agent.interface';
import { 
  fetchKnowledgeBases, 
  createKnowledgeBase, 
  updateKnowledgeBase, 
  deleteKnowledgeBase, 
  toggleKnowledgeBaseStatus 
} from '@services/agent.service';

interface CreateKnowledgeBaseData {
  name: string;
  description?: string;
  source_type: SourceType;
  source_config: any;
}

const Integrations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCompany } = useSelector((state: RootState) => state.company);
  const { loading, error } = useSelector((state: RootState) => state.agents);
  
  // Local state
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [formData, setFormData] = useState<CreateKnowledgeBaseData>({
    name: '',
    description: '',
    source_type: SourceType.DOCUMENT,
    source_config: {}
  });

  // Load knowledge bases on component mount
  useEffect(() => {
    if (currentCompany?.id) {
      loadKnowledgeBases();
    }
  }, [currentCompany]);

  const loadKnowledgeBases = async () => {
    if (!currentCompany?.id) return;
    
    try {
      const result = await dispatch(fetchKnowledgeBases(currentCompany.id)).unwrap();
      // Ensure result is always an array
      setKnowledgeBases(Array.isArray(result) ? result : []);
    } catch (error: any) {
      console.error('Failed to load knowledge bases:', error);
      toast.error('Failed to load knowledge bases');
      // Set empty array on error to prevent undefined
      setKnowledgeBases([]);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a name for the knowledge base');
      return;
    }

    if (!currentCompany?.id) {
      toast.error('No company selected');
      return;
    }

    try {
      const newKB = await dispatch(createKnowledgeBase({
        ...formData,
        company_id: currentCompany.id
      })).unwrap();

      setKnowledgeBases(prev => [...(prev || []), newKB]);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', source_type: SourceType.DOCUMENT, source_config: {} });
      toast.success('Knowledge base created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create knowledge base');
    }
  };

  const handleEdit = async () => {
    if (!selectedKB || !formData.name.trim()) {
      toast.error('Please enter a name for the knowledge base');
      return;
    }

    try {
      const updatedKB = await dispatch(updateKnowledgeBase({
        id: selectedKB.id,
        data: {
          name: formData.name,
          description: formData.description,
          source_type: formData.source_type,
          source_config: formData.source_config
        }
      })).unwrap();

      setKnowledgeBases(prev => (prev || []).map(k => k.id === selectedKB.id ? updatedKB : k));
      setShowEditModal(false);
      setSelectedKB(null);
      setFormData({ name: '', description: '', source_type: SourceType.DOCUMENT, source_config: {} });
      toast.success('Knowledge base updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update knowledge base');
    }
  };

  const handleDelete = async (kb: KnowledgeBase) => {
    if (window.confirm(`Are you sure you want to delete "${kb.name}"?`)) {
      try {
        await dispatch(deleteKnowledgeBase(kb.id)).unwrap();
        setKnowledgeBases(prev => (prev || []).filter(k => k.id !== kb.id));
        toast.success('Knowledge base deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete knowledge base');
      }
    }
  };

  const handleToggleActive = async (kb: KnowledgeBase) => {
    try {
      const updatedKB = await dispatch(toggleKnowledgeBaseStatus(kb.id)).unwrap();
      setKnowledgeBases(prev => (prev || []).map(k => k.id === kb.id ? updatedKB : k));
      toast.success(`Knowledge base ${updatedKB.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle knowledge base status');
    }
  };

  const getSourceTypeIcon = (type: SourceType) => {
    switch (type) {
      case SourceType.DOCUMENT:
        return <FileText className="w-5 h-5" />;
      case SourceType.DATABASE:
        return <Database className="w-5 h-5" />;
      case SourceType.API:
        return <Globe className="w-5 h-5" />;
      case SourceType.WEBSITE:
        return <Link className="w-5 h-5" />;
      case SourceType.FILE:
        return <Upload className="w-5 h-5" />;
      default:
        return <Database className="w-5 h-5" />;
    }
  };

  const getSourceTypeColor = (type: SourceType) => {
    switch (type) {
      case SourceType.DOCUMENT:
        return 'bg-blue-100 text-blue-800';
      case SourceType.DATABASE:
        return 'bg-green-100 text-green-800';
      case SourceType.API:
        return 'bg-purple-100 text-purple-800';
      case SourceType.WEBSITE:
        return 'bg-orange-100 text-orange-800';
      case SourceType.FILE:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-2">Manage your knowledge bases and external integrations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Create Knowledge Base
        </Button>
      </div>

      {/* Knowledge Bases Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Knowledge Bases</h2>
          <Badge variant="outline">
            {(knowledgeBases || []).length} total
          </Badge>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading knowledge bases...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(knowledgeBases || []).map(kb => (
              <Card key={kb.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getSourceTypeColor(kb.source_type)}`}>
                        {getSourceTypeIcon(kb.source_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{kb.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {kb.source_type.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {kb.is_active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{kb.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Created: {new Date(kb.created_at).toLocaleDateString()}</span>
                    <span>Updated: {new Date(kb.updated_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedKB(kb);
                        setFormData({
                          name: kb.name,
                          description: kb.description || '',
                          source_type: kb.source_type,
                          source_config: kb.source_config
                        });
                        setShowEditModal(true);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(kb)}
                    >
                      {kb.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(kb)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && (knowledgeBases || []).length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Database className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge bases yet</h3>
            <p className="text-gray-600 mb-4">Create your first knowledge base to connect data sources to your agents</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Knowledge Base
            </Button>
          </div>
        )}
      </div>

      {/* Create Knowledge Base Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Knowledge Base"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter knowledge base name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Type
            </label>
            <select
              value={formData.source_type}
              onChange={(e) => setFormData(prev => ({ ...prev, source_type: e.target.value as SourceType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.values(SourceType).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              Create Knowledge Base
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Knowledge Base Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Knowledge Base"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter knowledge base name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Type
            </label>
            <select
              value={formData.source_type}
              onChange={(e) => setFormData(prev => ({ ...prev, source_type: e.target.value as SourceType }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.values(SourceType).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              Update Knowledge Base
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Integrations;
