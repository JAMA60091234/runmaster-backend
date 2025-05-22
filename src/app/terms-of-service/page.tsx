'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center p-4 border-b bg-blue-600 shadow-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-4 text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-white">Terms Of Service</h1>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="prose prose-blue max-w-none">
              <p className="text-base leading-relaxed">
                Terms of Service<br />
                Effective Date: May 19, 2025<br /><br />
                
                Welcome to RunMaster! These Terms of Service ("Terms") govern your use of the RunMaster app, website, and related services (collectively, the "Service") provided by RunMaster ("we," "us," or "our").<br /><br />
                
                By accessing or using our Service, you agree to be bound by these Terms. If you do not agree, please do not use the Service.<br /><br />
                
                <strong>1. Eligibility</strong><br />
                To use RunMaster, you must be at least 13 years old and legally able to enter into this agreement. If you are under 18, you must have your parent or guardian's consent.<br /><br />
                
                <strong>2. Health Disclaimer</strong><br />
                The plans provided through RunMaster are generated using AI and are for informational and educational purposes only.
                They do not constitute medical advice. Always consult a doctor or certified health professional before starting any fitness or diet program. You are solely responsible for your health and safety while using the app.<br /><br />
                
                <strong>3. Account & Data</strong><br />
                You agree to provide accurate information when creating an account and to keep your login credentials secure.<br /><br />
                
                If you connect to third-party services like Strava, you consent to sharing data (such as running stats) with our system for the purpose of generating your personalized plans.<br /><br />
                
                <strong>4. Use of the Service</strong><br />
                You agree to use the Service for personal, non-commercial purposes only. You will not:<br /><br />
                
                • Misuse or interfere with the Service<br />
                • Attempt to reverse-engineer or copy features or data<br />
                • Use the Service to harass or harm others<br /><br />
                
                <strong>5. Subscription & Fees</strong><br />
                Some features may be offered as premium services. You'll be notified of any fees and terms before subscribing. All sales are final unless stated otherwise.<br /><br />
                
                <strong>6. Termination</strong><br />
                We may suspend or terminate your access if you violate these Terms or misuse the platform. You may delete your account at any time.<br /><br />
                
                <strong>7. Intellectual Property</strong><br />
                All content, designs, trademarks, and technology used in the Service are owned by or licensed to RunMaster. You may not use or reproduce them without permission.<br /><br />
                
                <strong>8. Privacy</strong><br />
                Your privacy is important to us. Please review our Privacy Policy for details on how we handle your data.<br /><br />
                
                <strong>9. Limitation of Liability</strong><br />
                We are not responsible for:<br /><br />
                
                • Injuries or health issues resulting from following a plan<br />
                • Inaccuracies in AI-generated recommendations<br />
                • Service interruptions, data loss, or third-party platform issues<br /><br />
                
                To the maximum extent allowed by law, our liability is limited to the amount you've paid us (if any) in the past 12 months.<br /><br />
                
                <strong>10. Changes to These Terms</strong><br />
                We may update these Terms from time to time. Continued use of the Service means you accept the revised Terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 