import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Lock, Unlock, Award, CheckCircle } from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { LockedOverlay } from '@/components/ui/EduFlareUI';
import { mockStudent } from '@/lib/constants';

const StudentOffers: React.FC = () => {
  const student = mockStudent;
  const isUnlocked = student.offersUnlocked;

  const mockOffers = [
    {
      id: 'offer-1',
      universityName: 'Stanford University',
      program: 'Master of Science in Data Science',
      offerDate: new Date('2024-03-15'),
      documents: [
        { name: 'Admission Letter', type: 'pdf' },
        { name: 'JW202 Form', type: 'pdf' },
        { name: 'Scholarship Confirmation', type: 'pdf' },
      ],
    },
  ];

  return (
    <PortalLayout portal="student">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">My Offers</h1>
          <p className="text-muted-foreground mt-1">
            View your admission offers and important documents
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl border p-6 ${
            isUnlocked 
              ? 'bg-success/10 border-success/30' 
              : 'bg-muted/50 border-border'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isUnlocked ? 'bg-success/20' : 'bg-muted'
            }`}>
              {isUnlocked ? (
                <Unlock className="w-7 h-7 text-success" />
              ) : (
                <Lock className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isUnlocked ? 'text-success' : 'text-foreground'}`}>
                {isUnlocked ? 'Offers Unlocked' : 'Offers Locked'}
              </h2>
              <p className="text-muted-foreground text-sm mt-0.5">
                {isUnlocked
                  ? 'Your admission documents are ready for download.'
                  : 'Complete all requirements to unlock your offers.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Offers Section */}
        {isUnlocked ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {mockOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
              >
                {/* Offer Header */}
                <div className="gradient-primary p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-semibold">{offer.universityName}</h3>
                      <p className="text-white/80 mt-1">{offer.program}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Offer received on {offer.offerDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Available Documents</h4>
                  <div className="grid gap-3">
                    {offer.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{doc.name}</p>
                            <p className="text-xs text-muted-foreground uppercase">{doc.type}</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download All */}
                <div className="px-6 pb-6">
                  <button className="w-full py-3 rounded-lg gradient-gold text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download All Documents
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <LockedOverlay
              title="Offers Not Yet Available"
              message="Your offers will be unlocked once all payments are completed and your application is approved."
            >
              {/* Placeholder content to show locked state */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="h-40 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-xl bg-muted mb-4" />
                  <div className="h-4 w-48 bg-muted rounded mb-2" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
                <div className="grid gap-3 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg" />
                  ))}
                </div>
              </div>
            </LockedOverlay>
          </motion.div>
        )}

        {/* Requirements */}
        {!isUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-6 shadow-card"
          >
            <h3 className="font-semibold text-foreground mb-4">Unlock Requirements</h3>
            <div className="space-y-3">
              {[
                { label: 'All documents verified', completed: true },
                { label: 'Application submitted', completed: true },
                { label: 'All invoices paid', completed: false },
                { label: 'University offer received', completed: false },
              ].map((req, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    req.completed 
                      ? 'bg-success text-white' 
                      : 'border-2 border-muted-foreground'
                  }`}>
                    {req.completed && <CheckCircle className="w-3 h-3" />}
                  </div>
                  <span className={req.completed ? 'text-foreground' : 'text-muted-foreground'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
};

export default StudentOffers;
