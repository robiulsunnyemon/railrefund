import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Zap, Check, ArrowLeft, PlusCircle, Train, ScanLine, CreditCard, ChevronRight, CheckCircle2, Clock, Loader2, ArrowRight, User, Home } from 'lucide-react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';

export default function RailRefundPremium() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [iban, setIban] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [claimFilter, setClaimFilter] = useState('ALL');
  const [userData, setUserData] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Auto-login listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('https://refundboy.fastapicloud.dev/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUserData(data.user);
              setIban(data.user.iban_no || '');
              setCurrentScreen(prev => (prev === 'splash' || prev === 'onboarding' || prev === 'auth' ? 'home' : prev));
            }
          }
        } catch (error) {
          console.error("Auto login failed", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto redirect from splash to onboarding
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen(prev => prev === 'splash' ? 'onboarding' : prev);
      }, 2500); // 2.5 seconds delay
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Helper for navigation
  const navigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  // 0. Splash Screen (NEW)
  const renderSplash = () => (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in bg-[#0A0D12] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#E3000F] rounded-full blur-[120px] opacity-20"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <img 
          src={`${import.meta.env.BASE_URL}logo.png`} 
          alt="RefundBoy Logo" 
          className="w-24 h-24 rounded-3xl shadow-[0_0_40px_rgba(227,0,15,0.6)] mb-6 animate-pulse object-cover" 
        />
        <h1 className="text-3xl font-black text-white font-display tracking-tight mb-2">RefundBoy</h1>
        <p className="text-[10px] text-[#00E5FF] font-mono tracking-[0.3em] uppercase">Enterprise Edition</p>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center">
        <Loader2 className="text-[#E3000F] animate-spin mb-4" size={24} />
        <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Initializing System...</p>
      </div>
    </div>
  );

  const onboardingSlides = [
    {
      title: "Never lose money on late DB trains.",
      desc: "Upload your ticket. We track the train and automatically file refund claims if it's delayed by 60+ minutes.",
      svg: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-28">
          <rect width="120" height="120" rx="30" fill="url(#grad1)"/>
          <path d="M40 70L80 70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          <rect x="45" y="40" width="30" height="25" rx="5" fill="white" fillOpacity="0.9"/>
          <circle cx="50" cy="70" r="8" fill="#181E29" stroke="white" strokeWidth="3"/>
          <circle cx="70" cy="70" r="8" fill="#181E29" stroke="white" strokeWidth="3"/>
          <path d="M50 50H70" stroke="#E3000F" strokeWidth="3" strokeLinecap="round"/>
          <defs>
            <linearGradient id="grad1" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E3000F" />
              <stop offset="1" stopColor="#FF4D4D" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      title: "Upload once, we track forever.",
      desc: "Our AI monitors DB's live systems. We know exactly when your train is delayed without you doing anything.",
      svg: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-28">
          <rect width="120" height="120" rx="30" fill="url(#grad2)"/>
          <circle cx="60" cy="60" r="30" stroke="white" strokeOpacity="0.2" strokeWidth="6"/>
          <circle cx="60" cy="60" r="30" stroke="white" strokeWidth="6" strokeDasharray="60 140" strokeLinecap="round"/>
          <path d="M60 45V60L70 70" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <defs>
            <linearGradient id="grad2" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E5FF" />
              <stop offset="1" stopColor="#0088CC" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    {
      title: "Payouts directly to your Bank.",
      desc: "We submit claims to DB with your IBAN. 100% of the refund goes straight to you with zero commission fees.",
      svg: (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-28 h-28">
          <rect width="120" height="120" rx="30" fill="url(#grad3)"/>
          <rect x="35" y="45" width="50" height="35" rx="8" fill="white" fillOpacity="0.9"/>
          <path d="M35 55H85" stroke="#181E29" strokeWidth="4"/>
          <circle cx="60" cy="35" r="8" fill="#FFD700" stroke="white" strokeWidth="2"/>
          <path d="M60 30V40M55 35H65" stroke="#B8860B" strokeWidth="2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="grad3" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C853" />
              <stop offset="1" stopColor="#69F0AE" />
            </linearGradient>
          </defs>
        </svg>
      )
    }
  ];

  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (userData && (currentScreen === 'home' || currentScreen === 'claims')) {
        try {
          const idToken = await auth.currentUser?.getIdToken();
          if (!idToken) return;
          const response = await fetch('https://refundboy.fastapicloud.dev/api/v1/tickets', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setTickets(data);
          }
        } catch (error) {
          console.error("Failed to fetch tickets", error);
        }
      }
    };
    fetchTickets();
  }, [userData, currentScreen]);
  // 1. Onboarding Screen
  const renderOnboarding = () => {
    const slide = onboardingSlides[onboardingStep];

    return (
      <div className="p-6 h-full flex flex-col justify-between pb-10 relative overflow-hidden bg-[#0A0D12]">
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#E3000F] rounded-full blur-[100px] opacity-20 mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#00E5FF] rounded-full blur-[100px] opacity-10 mix-blend-screen"></div>

        <div className="mt-20 relative z-10 w-full flex flex-col items-center">
          <div key={onboardingStep} className="animate-fade-in flex flex-col items-center text-center w-full">
            {/* 3D SVG Container */}
            <div className="mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[30px] transform transition-transform hover:scale-105">
              {slide.svg}
            </div>
            
            {/* Glassmorphism Card */}
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] p-8 rounded-[32px] shadow-2xl w-full">
              <h1 className="text-3xl font-extrabold text-white mb-4 tracking-tight leading-tight">{slide.title}</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                {slide.desc}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-auto mb-6 flex flex-col items-center relative z-10 w-full">
          {/* Continuous Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mb-8 overflow-hidden flex shadow-inner">
            {onboardingSlides.map((_, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 transition-all duration-500 ease-out ${i <= onboardingStep ? 'bg-[#E3000F]' : 'bg-transparent'} ${i !== onboardingSlides.length - 1 ? 'border-r border-slate-900' : ''}`}
              ></div>
            ))}
          </div>

          <button 
            onClick={() => {
              if (onboardingStep < onboardingSlides.length - 1) {
                setOnboardingStep(prev => prev + 1);
              } else {
                navigate('auth');
              }
            }}
            className="w-full bg-gradient-to-r from-[#E3000F] to-[#FF4D4D] text-white font-bold py-4 rounded-2xl flex justify-center items-center transition-all shadow-[0_10px_30px_rgba(227,0,15,0.4)] hover:shadow-[0_10px_40px_rgba(227,0,15,0.6)] hover:scale-[1.02] active:scale-[0.98]"
          >
            {onboardingStep < onboardingSlides.length - 1 ? 'CONTINUE' : 'GET STARTED'} <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
      </div>
    );
  };

  // 2. Authentication Screen
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      console.log("Firebase ID Token generated.");
      
      // Send token to FastAPI backend
      const response = await fetch('https://refundboy.fastapicloud.dev/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const data = await response.json();
      console.log("Backend login success:", data);
      
      if (data.user) {
        setUserData(data.user);
        setIban(data.user.iban_no || '');
      }

      navigate('paywall');
    } catch (error) {
      console.error("Google Login failed", error);
    }
  };

  const renderAuth = () => (
    <div className="p-6 h-full flex flex-col animate-fade-in pb-10 overflow-y-auto no-scrollbar">
      <button onClick={() => navigate('onboarding')} className="text-slate-400 mb-10 mt-4">
        <ArrowLeft size={24} />
      </button>
      
      <h2 className="text-2xl font-bold text-white mb-8 font-display">Create Account</h2>
      
      <div className="space-y-4 mb-8">
        <button onClick={() => navigate('paywall')} className="w-full bg-[#E3000F] text-white font-bold py-4 rounded-2xl flex justify-center items-center hover:bg-[#FF3333] transition-all shadow-[0_5px_20px_rgba(227,0,15,0.3)]">
          <img src={`${import.meta.env.BASE_URL}apple-logo.png`} alt="Apple" className="w-5 h-5 mr-2" /> Continue with Apple
        </button>
        <button onClick={handleGoogleLogin} className="w-full bg-[#181E29] border border-slate-700 text-white font-bold py-4 rounded-2xl flex justify-center items-center hover:bg-[#131921] transition-all">
          <img src={`${import.meta.env.BASE_URL}google-logo.png`} alt="Google" className="w-5 h-5 mr-2" /> Continue with Google
        </button>
      </div>
    </div>
  );

  const handleSubscribe = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('https://refundboy.fastapicloud.dev/api/v1/users/me/subscription', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'PRO_AUTOMATOR' })
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        navigate('iban-setup');
      }
    } catch (error) {
      console.error("Subscription failed", error);
    }
  };

  // 3. Paywall / Subscription Screen
  const renderPaywall = () => (
    <div className="p-6 h-full flex flex-col animate-fade-in pb-10 relative overflow-x-hidden overflow-y-auto no-scrollbar">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#E3000F] rounded-full blur-[100px] opacity-20"></div>
      
      <button onClick={() => navigate('auth')} className="text-slate-400 mb-8 mt-4 relative z-10">
        <ArrowLeft size={24} />
      </button>
      
      <h2 className="text-3xl font-extrabold text-white mb-2 relative z-10">Pro Automator</h2>
      <p className="text-slate-400 text-sm mb-8 relative z-10">Unlock completely hands-free refunds for all your trips.</p>
      
      <div className="bg-gradient-to-br from-[#181E29] to-[#131921] border border-[#E3000F]/40 p-6 rounded-[28px] mb-8 relative z-10 shadow-2xl">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-4xl font-black text-white">€4.99<span className="text-lg text-slate-500 font-normal">/mo</span></h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Zap className="text-[#00E5FF] mr-3 mt-0.5 shrink-0" size={18} />
            <p className="text-slate-300 text-sm">Unlimited automated refund claims</p>
          </div>
          <div className="flex items-start">
            <Zap className="text-[#00E5FF] mr-3 mt-0.5 shrink-0" size={18} />
            <p className="text-slate-300 text-sm">Real-time train tracking & alerts</p>
          </div>
          <div className="flex items-start">
            <Zap className="text-[#00E5FF] mr-3 mt-0.5 shrink-0" size={18} />
            <p className="text-slate-300 text-sm">Direct payouts to your bank account</p>
          </div>
        </div>
      </div>
      
      <button onClick={handleSubscribe} className="w-full bg-[#E3000F] text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(227,0,15,0.4)] mt-auto relative z-10">
        Subscribe via Apple Pay
      </button>
      <p className="text-center text-[10px] text-slate-500 mt-4 relative z-10">Cancel anytime in your settings.</p>
    </div>
  );

  const handleIbanSubmit = async () => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('https://refundboy.fastapicloud.dev/api/v1/users/me/iban', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ iban_no: iban })
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        navigate('home');
      }
    } catch (error) {
      console.error("IBAN update failed", error);
    }
  };

  // 4. IBAN Setup & Legal
  const renderIbanSetup = () => (
    <div className="p-6 h-full flex flex-col animate-fade-in pb-10 overflow-y-auto no-scrollbar">
      <button onClick={() => navigate('paywall')} className="text-slate-400 mb-8 mt-4">
        <ArrowLeft size={24} />
      </button>
      
      <h2 className="text-2xl font-bold text-white mb-2">Payout Setup</h2>
      <p className="text-slate-400 text-sm mb-8">Where should Deutsche Bahn send your refunds?</p>
      
      <div className="bg-[#181E29] border border-slate-700 rounded-2xl p-4 mb-6">
        <label className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2 block">Bank IBAN</label>
        <input 
          type="text" 
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          placeholder="DE89 3704 0044 0532 0130 00"
          className="w-full bg-transparent text-[#00E5FF] font-mono tracking-wider text-base outline-none"
        />
      </div>
      
      <div className="flex items-start space-x-3 mb-8">
        <button 
          onClick={() => setAgreed(!agreed)} 
          className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${agreed ? 'bg-[#E3000F] border-[#E3000F]' : 'border-slate-600'}`}
        >
          {agreed && <Check size={14} className="text-white" />}
        </button>
        <p className="text-xs text-slate-400 leading-relaxed">
          I authorize RefundBoy to file claims on my behalf and submit this IBAN to Deutsche Bahn for direct payouts. I agree to the <span className="text-white underline">Terms of Service</span>.
        </p>
      </div>
      
      <button 
        onClick={handleIbanSubmit}
        disabled={!agreed}
        className={`w-full font-bold py-4 rounded-2xl transition-all mt-auto ${agreed ? 'bg-white text-black' : 'bg-slate-800 text-slate-500'}`}
      >
                Complete Setup
      </button>
    </div>
  );

  // 5. Ticket Details Screen
  const renderTicketDetails = () => {
    if (!selectedTicket) return null;
    return (
    <div className="h-full flex flex-col animate-fade-in pb-10 bg-[#0A0D12]">
      {/* Header Area */}
      <div className="p-6 bg-[#131921] border-b border-slate-800">
        <button onClick={() => navigate('home')} className="text-slate-400 mb-6 mt-2">
          <ArrowLeft size={24} />
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-white">{selectedTicket.train_no}</h2>
            <p className="text-slate-400 text-sm">{selectedTicket.departure_station} → {selectedTicket.arrival_station}</p>
          </div>
          <span className={`text-xs font-bold border px-3 py-1 rounded-full uppercase ${selectedTicket.status === 'SETTLED' ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30'}`}>{selectedTicket.status}</span>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Basic Details Card */}
        <div className="bg-gradient-to-br from-[#181E29] to-[#131921] border border-slate-700 rounded-2xl p-5 mb-8 shadow-lg">
          <p className="text-[10px] text-slate-400 font-mono mb-1">PNR / BOOKING CODE</p>
          <h3 className="text-xl font-bold text-white mb-4">{selectedTicket.pnr}</h3>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-[10px] text-slate-500 font-mono">DATE</p>
              <p className="text-sm font-bold text-white">{selectedTicket.date}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-mono">DEPARTURE</p>
              <p className="text-sm font-bold text-white">{selectedTicket.departure_time}</p>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-white mb-6 font-mono tracking-wider uppercase">Tracking Timeline</h3>
        
        {/* Timeline Steps */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-700 before:to-transparent">
          
          <div className="relative flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#131921] border-2 border-green-500 flex items-center justify-center z-10 shrink-0">
              <Check size={16} className="text-green-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-bold text-white">Ticket Uploaded</h4>
              <p className="text-[10px] text-slate-500 font-mono">Scan complete</p>
            </div>
          </div>

          <div className="relative flex items-center">
            <div className={`h-10 w-10 rounded-full bg-[#131921] border-2 flex items-center justify-center z-10 shrink-0 ${selectedTicket.status === 'TRACKING' ? 'border-[#00E5FF]' : 'border-green-500'}`}>
              <Clock size={16} className={selectedTicket.status === 'TRACKING' ? 'text-[#00E5FF]' : 'text-green-500'} />
            </div>
            <div className="ml-4">
              <h4 className={`text-sm font-bold ${selectedTicket.status === 'TRACKING' ? 'text-[#00E5FF]' : 'text-white'}`}>Active Monitoring</h4>
              <p className="text-[10px] text-slate-500 font-mono">Checking DB for delays</p>
            </div>
          </div>

        </div>
      </div>
    </div>
    );
  };

  // 6. Home / Hub Screen
  const renderHome = () => {
    const activeTrackings = tickets.filter(t => t.status === 'TRACKING');
    
    return (
      <div className="flex flex-col h-full animate-fade-in">
        {/* Header */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex justify-between items-center mb-6 mt-2">
            <div>
              <p className="text-xs text-slate-400 font-mono tracking-wider">WELCOME BACK</p>
              <h1 className="text-2xl font-bold text-white font-display">{userData?.full_name?.split(' ')[0] || 'User'}</h1>
            </div>
            <img 
              src={userData?.profile_pic || `${import.meta.env.BASE_URL}logo.png`} 
              alt="Profile" 
              className="w-10 h-10 rounded-xl shadow-[0_0_15px_rgba(227,0,15,0.4)] object-cover" 
            />
          </div>
          
          {/* ব্যালেন্স কার্ড */}
          <div className="relative overflow-hidden bg-[#131921] border border-[#E3000F]/50 rounded-[28px] p-7 shadow-[0_0_30px_rgba(227,0,15,0.1)] mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E3000F] rounded-full blur-[70px] opacity-40"></div>
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-mono font-bold mb-2 uppercase tracking-widest flex items-center">
                <ShieldCheck size={14} className="mr-2 text-[#E3000F]" />
                Total Recovered
              </p>
              <h2 className="text-5xl font-extrabold text-white mb-2 tracking-tight">€ {userData?.balance?.toFixed(2).split('.')[0] || '0'}<span className="text-slate-500 text-3xl">.{userData?.balance?.toFixed(2).split('.')[1] || '00'}</span></h2>
              <p className="text-[10px] text-slate-500 font-mono">ALL PAYMENTS DIRECT TO YOUR IBAN</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-300 font-mono tracking-wider uppercase">Active Tracking</h3>
            <span className="text-[10px] bg-[#E3000F]/20 text-[#E3000F] border border-[#E3000F]/30 px-2 py-0.5 rounded uppercase font-mono font-bold animate-pulse">Live</span>
          </div>
        </div>
        
        {/* Scrollable List */}
        <div className="px-6 flex-1 overflow-y-auto no-scrollbar space-y-4 pb-28">
          {activeTrackings.length === 0 && (
            <div className="text-center text-slate-500 text-sm mt-10">No active tracking found. Scan a ticket to start.</div>
          )}
          {activeTrackings.map((item) => (
            <div 
              key={item.id}
              onClick={() => { setSelectedTicket(item); navigate('ticket-details'); }}
              className="bg-[#181E29] rounded-2xl p-4 border border-slate-800 shadow-lg flex items-center cursor-pointer hover:border-slate-500 transition-colors"
            >
              <div className="bg-[#131921] p-3 rounded-xl border border-slate-700 mr-4 shrink-0">
                <Train className="text-white" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{item.train_no} <span className="text-slate-500 font-normal">{item.departure_station} - {item.arrival_station}</span></h4>
                <p className="text-xs text-slate-400 font-mono mt-1">DEP: {item.departure_time} | DATE: {item.date}</p>
              </div>
              <div className="text-right flex flex-col items-end shrink-0 ml-2">
                <ChevronRight size={16} className="text-slate-500 mb-1" />
                <span className="text-[10px] font-bold border px-2 py-0.5 rounded-md tracking-wider text-[#00E5FF] border-[#00E5FF]/20 bg-[#00E5FF]/10 uppercase">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 7. Scan/Upload Screen

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://refundboy.fastapicloud.dev/api/v1/tickets/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });
      
      if (response.ok) {
        navigate('home');
      } else {
        alert("Failed to scan ticket. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading ticket.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderScan = () => (
    <div className="p-6 h-full flex flex-col items-center justify-center animate-fade-in relative">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#E3000F] blur-[50px] opacity-20 rounded-full"></div>
        <div className="relative bg-[#131921] border border-slate-700 w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-xl">
          <ScanLine size={40} className="text-[#E3000F]" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 font-display">Scan DB Ticket</h2>
      <p className="text-slate-400 mb-10 max-w-xs text-center text-sm">Upload your ticket image or point the camera at the QR code. AI will handle the rest.</p>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      <button 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        className="w-full bg-[#E3000F] hover:bg-[#FF3333] text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(227,0,15,0.3)] flex justify-center items-center mb-4 transition-all disabled:opacity-50"
      >
        {isUploading ? "SCANNING..." : <><PlusCircle className="mr-2" size={20} /> UPLOAD TICKET (IMAGE)</>}
      </button>
      <button 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        className="w-full bg-[#181E29] text-white font-bold py-4 rounded-2xl border border-slate-700 hover:bg-[#131921] transition-all flex justify-center items-center disabled:opacity-50"
      >
        SCAN QR CODE
      </button>
    </div>
  );

  // 8. Claims History
  const renderClaims = () => {
    const filteredClaims = tickets.filter(c => claimFilter === 'ALL' || c.status === claimFilter);
    return (
      <div className="flex flex-col h-full animate-fade-in">
        <div className="p-6 pb-2 shrink-0">
          <h2 className="text-xl font-bold text-white mb-6 font-mono uppercase tracking-wider mt-4">Claim Registry</h2>
          
          {/* Filtering System */}
          <div className="flex space-x-2 mb-2">
            {['ALL', 'TRACKING', 'PROCESSING', 'SETTLED'].map(filterOption => (
              <button 
                key={filterOption}
                onClick={() => setClaimFilter(filterOption)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider transition-colors ${claimFilter === filterOption ? 'bg-[#E3000F] text-white shadow-[0_0_10px_rgba(227,0,15,0.4)]' : 'bg-[#181E29] text-slate-400 border border-slate-800 hover:border-slate-600'}`}
              >
                {filterOption}
              </button>
            ))}
          </div>
        </div>
        
        <div className="px-6 flex-1 overflow-y-auto no-scrollbar space-y-3 pb-28">
          {filteredClaims.length === 0 && (
            <div className="text-center text-slate-500 text-sm mt-10">No tickets found in registry.</div>
          )}
          {filteredClaims.map((claim) => (
            <div 
              key={claim.id}
              onClick={() => { setSelectedTicket(claim); navigate('ticket-details'); }} 
              className="bg-[#181E29] rounded-2xl p-5 border border-slate-800 flex items-center cursor-pointer hover:border-slate-600 transition-colors"
            >
              <div className={`p-2 rounded-lg border mr-4 shrink-0 ${claim.status === 'SETTLED' ? 'bg-green-500/10 border-green-500/20' : 'bg-[#FF9900]/10 border-[#FF9900]/20'}`}>
                {claim.status === 'SETTLED' ? (
                  <CheckCircle2 className="text-green-500" size={20} />
                ) : (
                  <Clock className="text-[#FF9900]" size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm truncate">{claim.train_no}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-1">PNR: {claim.pnr}</p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className={`text-[10px] font-mono mt-1 uppercase ${claim.status === 'SETTLED' ? 'text-slate-500' : 'text-[#FF9900]'}`}>
                  {claim.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 9. Profile Screen
  const renderProfile = () => {
    const planName = userData?.subscription_plan === 'PRO_AUTOMATOR' ? 'Pro Automator' : 'Free Basic';
    const planStatus = userData?.subscription_status || 'ACTIVE';
    
    return (
      <div className="p-6 pb-24 h-full overflow-y-auto no-scrollbar animate-fade-in">
        <h2 className="text-xl font-bold text-white mb-6 font-mono uppercase tracking-wider mt-4">System Config</h2>
        
        {/* সাবস্ক্রিপশন স্ট্যাটাস */}
        <div className="bg-gradient-to-r from-[#131921] to-[#181E29] rounded-2xl p-6 border border-[#E3000F]/30 mb-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#E3000F]/10 to-transparent"></div>
          <div className="relative z-10">
            <p className="text-[10px] text-slate-400 font-mono mb-1">SUBSCRIPTION LAYER</p>
            <h3 className="text-lg font-bold text-white">{planName}</h3>
          </div>
          <span className={`border text-[10px] px-2 py-1 rounded font-mono font-bold relative z-10 ${planStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
            {planStatus}
          </span>
        </div>

        {/* IBAN সেটআপ */}
        <div className="bg-[#181E29] rounded-2xl p-5 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CreditCard className="text-slate-400 mr-2" size={18} />
              <h3 className="font-bold text-white text-sm">Payout IBAN</h3>
            </div>
            <ShieldCheck className="text-green-500" size={16} />
          </div>
          
          <div className="bg-[#0A0D12] border border-slate-700/50 rounded-xl p-4 flex items-center justify-between group focus-within:border-[#E3000F]/50 transition-colors">
            <input 
              type="text" 
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="DE89 3704 ..."
              className="bg-transparent text-[#00E5FF] font-mono tracking-[0.1em] text-xs outline-none w-full"
            />
            <button onClick={handleIbanSubmit} className="text-[#E3000F] font-bold text-xs ml-2 hover:text-[#FF3333]">
              SAVE
            </button>
          </div>
        </div>

        {/* Other Menu */}
        <div className="bg-[#181E29] rounded-2xl border border-slate-800 divide-y divide-slate-800">
          <button className="w-full flex items-center justify-between p-4 hover:bg-[#131921] transition-colors rounded-t-2xl text-slate-300 text-sm">
            <span>Legal & Privacy</span>
            <ChevronRight size={16} className="text-slate-500" />
          </button>
          <button onClick={async () => {
          await auth.signOut();
          setUserData(null);
          navigate('onboarding');
        }} className="w-full flex items-center justify-between p-4 hover:bg-[#131921] transition-colors rounded-b-2xl text-[#E3000F] text-sm font-bold">
          <span>Logout Session</span>
          <ChevronRight size={16} className="text-[#E3000F]" />
        </button>
        </div>
      </div>
    );
  };

  // Main Render Switcher
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'splash': return renderSplash();
      case 'onboarding': return renderOnboarding();
      case 'auth': return renderAuth();
      case 'paywall': return renderPaywall();
      case 'iban-setup': return renderIbanSetup();
      case 'ticket-details': return renderTicketDetails();
      case 'home': return renderHome();
      case 'scan': return renderScan();
      case 'claims': return renderClaims();
      case 'profile': return renderProfile();
      default: return renderSplash();
    }
  };

  // Check if we should show bottom nav
  const showBottomNav = ['home', 'scan', 'claims', 'profile'].includes(currentScreen);

  return (
    <div className="bg-[#0A0D12] h-full w-full font-sans flex flex-col justify-center items-center overflow-hidden">
      {/* App Container - Responsive */}
      <div className="relative w-full max-w-md h-full bg-[#0A0D12] flex flex-col overflow-hidden shadow-2xl">
        
        {/* মেইন কন্টেন্ট এরিয়া */}
        <div className="flex-1 relative z-10 h-full flex flex-col overflow-hidden">
          {renderCurrentScreen()}
        </div>

        {/* বটম নেভিগেশন বার */}
        {showBottomNav && (
          <div className="absolute bottom-0 left-0 w-full bg-[#131921]/95 backdrop-blur-3xl border-t border-slate-800 px-8 pt-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-between items-center z-50">
            {[
              { id: 'home', icon: Home, label: 'HUB' },
              { id: 'scan', icon: ScanLine, label: 'SCAN' },
              { id: 'claims', icon: Clock, label: 'VAULT' },
              { id: 'profile', icon: User, label: 'SYSTEM' }
            ].map((tab) => {
              const isActive = currentScreen === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => navigate(tab.id)} 
                  className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-[#E3000F]' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <tab.icon size={20} className={`mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(227,0,15,0.5)]' : ''}`} />
                  <span className={`text-[9px] font-mono tracking-widest ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
