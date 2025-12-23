import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { DocumentCard } from '@/components/ui/EduFlareUI';
import { mockDocuments } from '@/lib/constants';

const StudentDocuments: React.FC = () => {
  const documents = mockDocuments;

  const documentCategories = [
    { key: 'all', label: 'All Documents' },
    { key: 'identity', label: 'Identity' },
    { key: 'academic', label: 'Academic' },
    { key: 'financial', label: 'Financial' },
    { key: 'supporting', label: 'Supporting' },
  ];

  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.type === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const statusCounts = {
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
    error: documents.filter(d => d.status === 'error').length,
  };

  return (
    <PortalLayout portal="student">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">My Documents</h1>
          <p className="text-muted-foreground mt-1">
            View and track your submitted documents
          </p>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-success/10 rounded-xl border border-success/20 p-4 text-center">
            <p className="text-2xl font-bold text-success">{statusCounts.verified}</p>
            <p className="text-sm text-success/80">Verified</p>
          </div>
          <div className="bg-warning/10 rounded-xl border border-warning/20 p-4 text-center">
            <p className="text-2xl font-bold text-warning">{statusCounts.pending}</p>
            <p className="text-sm text-warning/80">Pending</p>
          </div>
          <div className="bg-error/10 rounded-xl border border-error/20 p-4 text-center">
            <p className="text-2xl font-bold text-error">{statusCounts.error}</p>
            <p className="text-sm text-error/80">Needs Attention</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {documentCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Documents Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <DocumentCard
                name={doc.name}
                type={doc.type}
                status={doc.status}
                uploadedAt={doc.uploadedAt}
                onView={() => console.log('View', doc.id)}
                onDownload={() => console.log('Download', doc.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No documents found matching your criteria.</p>
          </div>
        )}

        {/* Info Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-lg bg-muted/50 border border-border"
        >
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Documents are uploaded by your consultant. 
            If you need to update any document, please contact your assigned staff member.
          </p>
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default StudentDocuments;
