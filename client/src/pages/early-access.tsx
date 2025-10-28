import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Shield, Lock, Building2, Smartphone, Gift, CreditCard } from 'lucide-react';

export default function EarlyAccess() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsSubmitting(true);
    // TODO: Implement form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for reserving early access!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <img 
              src="/stocksprout-logo.png" 
              alt="StockSprout Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
            Secure Your Child's<br />American Dream
          </h1>
          <p className="text-center text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
            Join families across America preparing for Child Savings Accounts - the new 
            tax-free way to invest in your children's future
          </p>
          <div className="flex justify-center mb-8">
            <Button 
              className="bg-[#B91C1C] text-white text-base font-semibold px-8 py-3 rounded-lg h-auto"
              onClick={handleSubmit}
            >
              Reserve Early Access - $20
            </Button>
          </div>
          <div className="space-y-2 text-center text-sm text-gray-600 mb-8">
            <p>✓ 100% refundable if we don't launch</p>
            <p>✓ Priority access before public release</p>
            <p>✓ Join 247 American families already reserved</p>
          </div>
          <div className="flex justify-center">
            <img 
              src="/hero-image.png" 
              alt="Family investing in child's future" 
              className="w-full max-w-2xl rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Every Birthday, Every Holiday Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Every Birthday, Every Holiday
          </h2>
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Timeline Illustration</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 max-w-2xl mx-auto">
            <p className="text-gray-700 mb-4">Your child receives gifts from family:</p>
            <div className="space-y-3 mb-6">
              <p className="text-black">💵 $200 from grandparents</p>
              <p className="text-black">🎁 $50 from aunts and uncles</p>
              <p className="text-black">💰 $100 from family friends</p>
            </div>
            <p className="font-semibold text-gray-900 mb-4">That's $350+ per year that usually:</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>• Sits in a checking account earning nothing</li>
              <li>• Gets spent on toys they'll outgrow</li>
              <li>• Never builds into real wealth</li>
            </ul>
            <p className="text-center font-semibold text-[#1E40AF] text-lg">
              What if that money could grow tax-free and secure their future?
            </p>
          </div>
        </div>
      </section>

      {/* Introducing Child Savings Accounts Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-red-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Introducing Child Savings Accounts
          </h2>
          <p className="text-center text-gray-700 text-base mb-12 max-w-2xl mx-auto">
            A platform built for American families to invest in their children's future with the new 
            Child Savings Accounts program
          </p>
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-xl shadow-lg p-4 max-w-md">
              <img 
                src="/gift-contribution.png" 
                alt="Simple gift contribution process" 
                className="w-full rounded-lg mb-4"
              />
              <p className="text-center text-gray-600 text-xs">Simple gift contribution process</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-8">How It Works:</h3>
          <div className="space-y-4 max-w-2xl mx-auto mb-12">
            <div className="flex items-start gap-4">
              <div className="bg-[#1D4ED8] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold">1</span>
              </div>
              <p className="text-gray-700 pt-2">Open a Child Savings Account for your child in just 5 minutes</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#1D4ED8] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold">2</span>
              </div>
              <p className="text-gray-700 pt-2">Share your gift link with family and friends</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#1D4ED8] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold">3</span>
              </div>
              <p className="text-gray-700 pt-2">They contribute in minutes - no account needed</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-[#1D4ED8] text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold">4</span>
              </div>
              <p className="text-gray-700 pt-2">Watch your child's future grow tax-free until age 18</p>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="bg-white rounded-xl shadow-lg p-4 max-w-md">
              <img 
                src="/growth-tracking.png" 
                alt="Track growth over time" 
                className="w-full rounded-lg mb-4"
              />
              <p className="text-center text-gray-600 text-xs">Track growth over time</p>
            </div>
          </div>
        </div>
      </section>

      {/* What Are Child Savings Accounts Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            What Are Child Savings Accounts?
          </h2>
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl h-24 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-700">Illustration</span>
            </div>
          </div>
          <p className="text-center text-gray-700 text-base mb-12 max-w-2xl mx-auto">
            Child Savings Accounts are a new tax-advantaged investment account launching in 
            July 2026, designed to help American families build their children's financial 
            security.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="bg-white border-2 border-blue-200 rounded-lg p-2 flex-shrink-0">
                <Gift className="w-6 h-6 text-[#1D4ED8]" />
              </div>
              <p className="text-gray-700 pt-1">Tax-free contributions from family</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white border-2 border-blue-200 rounded-lg p-2 flex-shrink-0">
                <CreditCard className="w-6 h-6 text-[#1D4ED8]" />
              </div>
              <p className="text-gray-700 pt-1">Tax-free growth for up to 18 years</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white border-2 border-blue-200 rounded-lg p-2 flex-shrink-0">
                <Shield className="w-6 h-6 text-[#1D4ED8]" />
              </div>
              <p className="text-gray-700 pt-1">Parents maintain full control</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white border-2 border-blue-200 rounded-lg p-2 flex-shrink-0">
                <Lock className="w-6 h-6 text-[#1D4ED8]" />
              </div>
              <p className="text-gray-700 pt-1">Secure your child's future</p>
            </div>
          </div>
          <p className="text-center text-gray-700 text-base mb-8 max-w-2xl mx-auto">
            StockSprout is positioning to be a trusted partner platform - making it easy for 
            families to access Child Savings Accounts from day one.
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💡</span>
              <h4 className="font-semibold text-gray-900">Real Example:</h4>
            </div>
            <p className="text-gray-700 mb-2">
              $350/year invested from birth = <span className="font-bold text-[#1E40AF]">$12,000+ by age 18</span>
            </p>
            <p className="text-gray-600 text-xs">
              (assuming 7% annual return, tax-free)
            </p>
          </div>
        </div>
      </section>

      {/* Built by Americans Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Built by Americans, For American Families
          </h2>
          <div className="flex justify-center mb-12">
            <img 
              src="/team-image.png" 
              alt="StockSprout team" 
              className="w-full max-w-2xl rounded-xl shadow-lg"
            />
          </div>
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-4">Our team brings together:</p>
            <div className="space-y-2 text-gray-700">
              <p>• 15+ years in financial services</p>
              <p>• Deep experience with custodial accounts</p>
              <p>• Commitment to American family values</p>
            </div>
          </div>
          <div className="border-t border-gray-300 my-12"></div>
          <div className="mb-8">
            <div className="flex items-center gap-3 justify-center mb-6">
              <Shield className="w-8 h-8 text-[#1D4ED8]" />
              <h3 className="text-xl font-bold text-gray-900">Your Family's Security Matters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-[#1D4ED8]" />
                <p className="text-gray-700">Bank-level encryption</p>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-6 h-6 text-[#1D4ED8]" />
                <p className="text-gray-700">Partnering with regulated brokerages</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-[#1D4ED8]" />
                <p className="text-gray-700">FDIC/SIPC insured custodial accounts</p>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-[#1D4ED8]" />
                <p className="text-gray-700">Parents maintain complete control</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-300 my-12"></div>
          <div>
            <div className="flex items-center gap-3 justify-center mb-6">
              <Smartphone className="w-8 h-8 text-[#B91C1C]" />
              <h3 className="text-xl font-bold text-gray-900">Access Anywhere, Anytime</h3>
            </div>
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#1D4ED8]" />
                <p className="text-gray-700">iPhone & Android apps</p>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#1D4ED8]" />
                <p className="text-gray-700">Full web platform</p>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#1D4ED8]" />
                <p className="text-gray-700">Desktop application</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reserve Your Early Access Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            Reserve Your Early Access
          </h2>
          <div className="text-center mb-8 space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Launch Date:</span> July 2026
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Early Access Spots:</span> Limited to first 1,000 families
            </p>
          </div>
          <div className="bg-white border-2 border-blue-200 rounded-xl shadow-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-4">
              Early Access Reservation
            </h3>
            <p className="font-semibold text-gray-900 mb-6 text-center">
              Reserve today for just $20 and get:
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#1D4ED8] flex-shrink-0" />
                <p className="text-black">First access before public launch</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#1D4ED8] flex-shrink-0" />
                <p className="text-black">Free first year (no fees)</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#1D4ED8] flex-shrink-0" />
                <p className="text-black">$50 initial contribution bonus</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-[#1D4ED8] flex-shrink-0" />
                <p className="text-black">Priority support at launch</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-600 mb-2">Regular Price: $99/year</p>
              <p className="text-xl font-bold text-[#1E40AF]">Your Price: FREE Year 1</p>
            </div>
            <Button 
              className="w-full bg-[#B91C1C] text-white text-base font-semibold py-4 rounded-lg h-auto mb-6"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Reserve Now - $20'}
            </Button>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="font-semibold text-gray-900 mb-3">100% Refundable Guarantee:</p>
              <p className="text-gray-600 text-sm">
                If we don't launch by July 2026 or you're not satisfied, full refund - no 
                questions asked.
              </p>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            <span className="font-semibold">247 families</span> have already reserved their spot
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is my $20 refundable?",
                a: "Yes! 100% refundable anytime until launch. If we don't launch by July 2026, automatic refund."
              },
              {
                q: "What happens to my child's money?",
                a: "We partner with regulated brokerages (FDIC/SIPC insured). You maintain full custodial control. We never touch funds directly."
              },
              {
                q: "What if Child Savings Accounts don't launch?",
                a: "StockSprout works with all custodial accounts (UGMA/UTMA). Child Savings Accounts just add tax benefits. Either way, you get the platform."
              },
              {
                q: "Can I gift if I'm not the parent?",
                a: "Yes! That's the point. Grandparents, aunts, uncles, friends can all contribute via gift link - no account needed."
              },
              {
                q: "What are the fees?",
                a: "Early access members get Year 1 FREE. After that, $99/year (or 0.25% of assets, whichever is lower)."
              },
              {
                q: "When do I get access?",
                a: "July 2026 at launch. You'll get: 30-day advance notice, beta access invitation, and setup guidance before public release."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <p className="font-semibold text-gray-900 mb-2">
                  <span className="text-gray-900">Q: </span>{faq.q}
                </p>
                <p className="text-gray-700">
                  <span className="text-gray-700">A: </span>{faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-red-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Invest in Your Child's American Dream
          </h2>
          <p className="text-gray-700 text-base mb-8">
            Join 247 families who've already reserved their spot for Child Savings Accounts early access
          </p>
          <Button 
            className="bg-[#B91C1C] text-white text-base font-semibold px-8 py-3 rounded-lg h-auto mb-8"
            onClick={handleSubmit}
          >
            Reserve Now - $20 (Refundable)
          </Button>
          <p className="text-gray-600 text-sm">
            Questions? Email: <a href="mailto:hello@stocksprout.com" className="text-[#1D4ED8]">hello@stocksprout.com</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <img 
              src="/stocksprout-logo.png" 
              alt="StockSprout Logo" 
              className="h-12 w-auto mx-auto"
            />
          </div>
          <p className="text-sm mb-2">StockSprout LLC, Member NYSE, SIPC, FCC.</p>
          <p className="text-sm mb-2">700 Sprout Street, Phoenix, AZ 85235</p>
          <p className="text-sm mb-4">©2025, All rights reserved.</p>
          <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 text-sm">
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}
