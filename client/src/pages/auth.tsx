import React, { useState } from 'react';
import { Link } from 'wouter';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Button } from '@/components/ui/button';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Status Bar */}
      <div className="bg-gray-800 text-white text-sm px-4 py-1 flex justify-between items-center">
        <span className="text-sm">9:41</span>
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3 h-1 bg-white rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/stocksprout-logo.png" 
              alt="StockSprout Logo" 
              className="h-24 w-auto sm:h-32 md:h-36"
            />
          </div>
          <p className="text-base text-gray-600">
            {isLogin ? "Grow the future our kids deserve" : "Growing the future our kids deserve"}
          </p>
        </div>
        
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <>
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
            {/* Sign in link below the form */}
            <div className="text-center mt-6">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-blue-600 font-medium"
                onClick={() => setIsLogin(true)}
              >
                Already have an account? Sign in
              </Button>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-gray-600 space-y-1">
          <p>StockSprout LLC, Member NYSE, SIPC, FCC.</p>
          <p>700 Sprout Street, Phoenix, AZ 85235</p>
          <p>©2025, All rights reserved.</p>
          <Link href="/privacy-policy">
            <p className="text-blue-600 cursor-pointer hover:text-blue-800">Privacy Policy</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
