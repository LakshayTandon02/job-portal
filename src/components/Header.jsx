import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './Header.css'
import {
  SignedIn,
  SignedOut,
  UserButton,
  SignIn,
  useUser,
  SignInButton,
} from "@clerk/clerk-react";
import { Button } from './ui/button';
import { BriefcaseBusinessIcon, Heart, PenBox } from 'lucide-react';

const Header = () => {
  const [showSignIn, setshowSignIn] = useState(false);
  const [search, setsearch] = useSearchParams();

  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (search.get("sign-in") === "true") {
      setshowSignIn(true);
    }
  }, [search]);

  const handleoverlayclick = (e) => {
    if (e.target === e.currentTarget) {
      setshowSignIn(false);
      setsearch({});
    }
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <img src="/logo.png" className="logo" alt="Logo" />
      </Link>

      <div className='flex gap-8'>
        <SignedOut>
          <Button variant="outline" className="bg-transparent" onClick={() => setshowSignIn(true)}>Login</Button>
        </SignedOut>
        <SignedIn>
          {isLoaded && user?.unsafeMetadata?.role === 'recruiter' && (
            <Link to="/post-job">
              <Button variant="destructive" className="rounded-full bg-red-700">
                <PenBox size={20} className='mr-2' />
                Post a Job
              </Button>
            </Link>
          )}

          <UserButton appearance={{
            elements: {
              avatarBox: "w-10 h-10"
            }
          }}>
            <UserButton.MenuItems>
              <UserButton.Link
                label="My Jobs"
                labelIcon={<BriefcaseBusinessIcon size={15} />}
                href='/my-jobs'
              />
              <UserButton.Link
                label="Saved Jobs"
                labelIcon={<Heart size={15} />}
                href='/saved-jobs'
              />
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
      </div>

      {showSignIn && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleoverlayclick}
        >
          <SignIn
            signUpForceRedirectUrl='/onboarding'
            signUpFallbackRedirectUrl='/onboarding'
          />
        </div>
      )}
    </nav>
  );
};

export default Header;
