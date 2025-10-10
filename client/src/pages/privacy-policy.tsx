import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/auth">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>StockSprout Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-gray-700 mb-2">
                We collect information you provide directly to us, such as when you create an account, 
                add children to your account, or make contributions. This may include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Name, email address, and username</li>
                <li>Child information (name, age, birthday)</li>
                <li>Bank account information (for account verification)</li>
                <li>Investment preferences and portfolio data</li>
                <li>Video messages and thank you notes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage investment portfolios</li>
                <li>Send you technical notices and support messages</li>
                <li>Communicate with you about products, services, and promotions</li>
                <li>Monitor and analyze usage and trends</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p className="text-gray-700">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share your information 
                with service providers who assist us in operating our platform, conducting our business, 
                or serving our users.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. This includes encryption 
                of sensitive data, secure servers, and regular security assessments.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Children's Privacy</h2>
              <p className="text-gray-700">
                Our service is designed for parents to manage investment accounts for their children. 
                We do not knowingly collect personal information directly from children under 13. 
                All child-related information is provided by parents or guardians.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Investment Information</h2>
              <p className="text-gray-700">
                StockSprout LLC is a member of NYSE and SIPC. Investment products are not FDIC insured, 
                may lose value, and are not guaranteed by the bank. Past performance does not guarantee 
                future results.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to enhance your experience on our platform. 
                You can control cookie settings through your browser preferences.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
              <p className="text-gray-700 mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Object to certain processing of your information</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy, please contact us at:
              </p>
              <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">
                  <strong>StockSprout LLC</strong><br />
                  700 Sprout Street<br />
                  Phoenix, AZ 85235<br />
                  <br />
                  Email: privacy@stocksprout.com<br />
                  Phone: (555) 123-SPROUT
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
