import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Gift, 
  Lock, 
  Download, 
  FileText, 
  CheckCircle,
  Sparkles,
  ExternalLink,
  CreditCard,
  Clock,
  ArrowRight
} from 'lucide-react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, LockedOverlay } from '@/components/ui/EduFlareUI';
import { mockOffers } from '@/lib/constants';

const StudentOffers: React.FC = () => {
  const navigate = useNavigate();

  // Filter Logic based on Core Rules:
  // 1. Available: Unlocked (Balance Paid)
  const availableOffers = mockOffers.filter(o => !o.locked);
  
  // 2. Payment Locked: Locked BUT Status is Accepted (Admin uploaded offer, but balance due)
  // Note: Ensure your mock data reflects this state for testing
  const paymentLockedOffers = mockOffers.filter(o => o.locked && o.status === 'accepted');
  
  // 3. Processing: Locked AND Status is Pending (University hasn't replied)
  const processingOffers = mockOffers.filter(o => o.locked && o.status === 'pending');

  return (
    <PortalLayout portal="student">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">My Offers</h1>
          <p className="text-muted-foreground mt-1">
            Track your admission results and access official documents
          </p>
        </motion.div>

        {/* SECTION 1: AVAILABLE OFFERS (UNLOCKED) */}
        {availableOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-success" />
              Offers Available for Download
            </h3>
            
            {availableOffers.map((offer) => (
              <Card key={offer.id} className="card-elevated overflow-hidden border-l-4 border-l-success">
                <div className="bg-gradient-to-r from-success/5 via-transparent to-transparent p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
                        <Gift className="w-8 h-8 text-success" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-xl font-bold">{offer.universityName}</h4>
                          <StatusBadge variant="success">Accepted</StatusBadge>
                        </div>
                        <p className="text-muted-foreground">{offer.program}</p>
                        <p className="text-sm text-success mt-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Documents Unlocked
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="gap-2 bg-success hover:bg-success/90 text-white">
                        <Download className="w-4 h-4" /> Admission Letter
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> JW202 Form
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* SECTION 2: PAYMENT LOCKED OFFERS (CRITICAL REVENUE DRIVER) */}
        {paymentLockedOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              Congratulations! Offers Received
            </h3>
            <p className="text-sm text-muted-foreground -mt-2 mb-2">
              The following universities have accepted you. Complete your final payment to unlock documents.
            </p>
            
            {paymentLockedOffers.map((offer) => (
              <Card key={offer.id} className="card-elevated border-2 border-primary/20 overflow-hidden relative">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border max-w-md w-full">
                        <Gift className="w-10 h-10 text-primary mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-foreground">Offer Ready to View!</h4>
                        <p className="text-sm text-muted-foreground mb-4 mt-1">
                           <strong>{offer.universityName}</strong> has sent your admission package. 
                           Please pay the Final Service Balance to unlock your Admission Letter and JW202.
                        </p>
                        <Button onClick={() => navigate('/student/financials')} className="w-full gap-2 btn-primary-gradient">
                            <CreditCard className="w-4 h-4" /> Go to Financials & Pay
                        </Button>
                    </div>
                </div>

                {/* Background Content (Blurred) */}
                <CardContent className="p-6 opacity-40 blur-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Gift className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{offer.universityName}</h4>
                      <p className="text-muted-foreground">{offer.program}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* SECTION 3: PROCESSING / PENDING OFFERS */}
        {processingOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              University Processing
            </h3>
            
            {processingOffers.map((offer) => (
              <Card key={offer.id} className="card-elevated border-l-4 border-l-warning bg-muted/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center">
                      <Clock className="w-8 h-8 text-warning" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h4 className="text-xl font-bold text-foreground">{offer.universityName}</h4>
                        <StatusBadge variant="warning">Under Review</StatusBadge>
                      </div>
                      <p className="text-muted-foreground">{offer.program}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
                        Application submitted. Awaiting university decision.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {mockOffers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-elevated border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Gift className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Offers Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your admission offers will appear here once universities respond to your applications. 
                  We'll notify you via email and SMS as soon as any updates are available.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                 <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-blue-900">What happens after I get an offer?</h4>
                <p className="text-sm text-blue-800/80 mb-3 leading-relaxed">
                  Once a university accepts you, we will upload your <strong>Admission Letter</strong> and <strong>JW202 Form</strong> (Visa Form). 
                  You must pay your remaining service balance to unlock and download these original documents for your visa application.
                </p>
                <Button variant="link" className="p-0 h-auto text-blue-700 gap-1 font-semibold">
                  Read Visa Application Guide <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PortalLayout>
  );
};

export default StudentOffers;