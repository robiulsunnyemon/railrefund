import { useState, useEffect } from 'react';
import { 
  Home, ScanLine, Clock, User, PlusCircle, Train, 
  CheckCircle, ShieldCheck, CreditCard, ChevronRight, 
  ArrowLeft, ArrowRight, Zap, Smartphone, FileText, Mail, Check, Loader2
} from 'lucide-react';

export default function RailRefundPremium() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [iban, setIban] = useState('DE89 3704 0044 0532 0130 00');
  const [agreed, setAgreed] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Auto redirect from splash to onboarding
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('onboarding');
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
      icon: Train
    },
    {
      title: "Upload once, we track forever.",
      desc: "Our AI monitors DB's live systems. We know exactly when your train is delayed without you doing anything.",
      icon: Clock
    },
    {
      title: "Payouts directly to your Bank.",
      desc: "We submit claims to DB with your IBAN. 100% of the refund goes straight to you with zero commission fees.",
      icon: CreditCard
    }
  ];

  // 1. Onboarding Screen
  const renderOnboarding = () => {
    const slide = onboardingSlides[onboardingStep];
    const Icon = slide.icon;

    return (
      <div className="p-6 h-full flex flex-col justify-between pb-10 relative">
        <div className="mt-20 relative h-64">
          {/* Key ensures React re-mounts the div to trigger the animate-fade-in class again */}
          <div key={onboardingStep} className="animate-fade-in absolute w-full">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E3000F] to-[#FF4D4D] flex items-center justify-center shadow-[0_0_20px_rgba(227,0,15,0.5)] mb-8">
              <Icon className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">{slide.title}</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {slide.desc}
            </p>
          </div>
        </div>
        
        <div className="mt-auto mb-10 flex flex-col items-center">
          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mb-8">
            {onboardingSlides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setOnboardingStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === onboardingStep ? 'w-6 bg-[#E3000F]' : 'w-1.5 bg-slate-700'}`}
              ></button>
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
            className="w-full bg-white text-[#0A0D12] hover:bg-slate-200 font-bold py-4 rounded-2xl flex justify-center items-center transition-all shadow-[0_5px_15px_rgba(255,255,255,0.1)]"
          >
            {onboardingStep < onboardingSlides.length - 1 ? 'NEXT' : 'GET STARTED'} <ArrowRight className="ml-2" size={18} />
          </button>
        </div>
      </div>
    );
  };

  // 2. Authentication Screen
  const renderAuth = () => (
    <div className="p-6 h-full flex flex-col animate-fade-in pb-10">
      <button onClick={() => navigate('onboarding')} className="text-slate-400 mb-10 mt-4">
        <ArrowLeft size={24} />
      </button>
      
      <h2 className="text-2xl font-bold text-white mb-8 font-display">Create Account</h2>
      
      <div className="space-y-4 mb-8">
        <button onClick={() => navigate('paywall')} className="w-full bg-[#181E29] border border-slate-700 text-white font-bold py-4 rounded-2xl flex justify-center items-center hover:bg-[#131921] transition-all">
          <Smartphone className="mr-2" size={20} /> Continue with Apple
        </button>
        <button onClick={() => navigate('paywall')} className="w-full bg-[#181E29] border border-slate-700 text-white font-bold py-4 rounded-2xl flex justify-center items-center hover:bg-[#131921] transition-all">
          <Mail className="mr-2" size={20} /> Continue with Google
        </button>
      </div>
      
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="h-px bg-slate-800 flex-1"></div>
        <span className="text-slate-500 text-xs font-mono">OR EMAIL</span>
        <div className="h-px bg-slate-800 flex-1"></div>
      </div>
      
      <input type="email" placeholder="Email Address" className="w-full bg-[#0A0D12] border border-slate-700 text-white p-4 rounded-xl mb-4 outline-none focus:border-[#E3000F] transition-colors" />
      <button onClick={() => navigate('paywall')} className="w-full bg-[#E3000F] text-white font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(227,0,15,0.3)] hover:bg-[#FF3333] transition-all">
        Continue with Email
      </button>
    </div>
  );

  // 3. Paywall / Subscription Screen
  const renderPaywall = () => (
    <div className="p-6 h-full flex flex-col animate-fade-in pb-10 relative overflow-hidden">
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
      
      <button onClick={() => navigate('iban-setup')} className="w-full bg-[#E3000F] text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(227,0,15,0.4)] mt-auto relative z-10">
        Subscribe via Apple Pay
      </button>
      <p className="text-center text-[10px] text-slate-500 mt-4 relative z-10">Cancel anytime in your settings.</p>
    </div>
  );

  // 4. IBAN Setup & Legal
  const renderIbanSetup = () => (
    <div className="p-6 h-full flex flex-col animate-fade-in pb-10">
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
        onClick={() => navigate('home')}
        disabled={!agreed}
        className={`w-full font-bold py-4 rounded-2xl transition-all mt-auto ${agreed ? 'bg-white text-black' : 'bg-slate-800 text-slate-500'}`}
      >
        Complete Setup
      </button>
    </div>
  );

  // 5. Ticket Details Screen (NEW)
  const renderTicketDetails = () => (
    <div className="h-full flex flex-col animate-fade-in pb-10 bg-[#0A0D12]">
      {/* Header Area */}
      <div className="p-6 bg-[#131921] border-b border-slate-800">
        <button onClick={() => navigate('home')} className="text-slate-400 mb-6 mt-2">
          <ArrowLeft size={24} />
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-white">ICE 704</h2>
            <p className="text-slate-400 text-sm">Berlin Hbf → Munich Hbf</p>
          </div>
          <span className="text-xs font-bold text-[#E3000F] bg-[#E3000F]/10 border border-[#E3000F]/30 px-3 py-1 rounded-full">+ 65 MINS LATE</span>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Refund Status Card */}
        <div className="bg-gradient-to-br from-[#181E29] to-[#131921] border border-slate-700 rounded-2xl p-5 mb-8 shadow-lg">
          <p className="text-[10px] text-slate-400 font-mono mb-1">EXPECTED REFUND (25%)</p>
          <h3 className="text-3xl font-bold text-white mb-4">€ 15.50</h3>
          
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-[#FF9900] w-1/2 h-full rounded-full animate-pulse"></div>
          </div>
          <p className="text-[10px] text-[#FF9900] font-mono mt-2 text-right">PROCESSING BY DB</p>
        </div>

        <h3 className="text-sm font-bold text-white mb-6 font-mono tracking-wider uppercase">Claim Timeline</h3>
        
        {/* Timeline Steps */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-700 before:to-transparent">
          
          <div className="relative flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#131921] border-2 border-green-500 flex items-center justify-center z-10 shrink-0">
              <Check size={16} className="text-green-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-bold text-white">Ticket Uploaded</h4>
              <p className="text-[10px] text-slate-500 font-mono">12 Aug, 10:00 AM</p>
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#131921] border-2 border-green-500 flex items-center justify-center z-10 shrink-0">
              <Clock size={16} className="text-green-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-bold text-white">Delay Detected</h4>
              <p className="text-[10px] text-slate-500 font-mono">14 Aug, 15:35 PM</p>
            </div>
          </div>

          <div className="relative flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#181E29] border-2 border-[#FF9900] flex items-center justify-center z-10 shrink-0 shadow-[0_0_10px_rgba(255,153,0,0.3)]">
              <FileText size={16} className="text-[#FF9900]" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-bold text-white">Claim Filed to DB</h4>
              <p className="text-[10px] text-slate-400">Automated form submitted.</p>
            </div>
          </div>

          <div className="relative flex items-center opacity-40">
            <div className="h-10 w-10 rounded-full bg-[#131921] border-2 border-slate-700 flex items-center justify-center z-10 shrink-0">
              <CreditCard size={16} className="text-slate-500" />
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-bold text-white">Refund Sent</h4>
              <p className="text-[10px] text-slate-500">Awaiting DB processing...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 6. Home / Hub Screen (Existing, Updated navigation)
  const renderHome = () => (
    <div className="p-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-2">
        <div>
          <p className="text-xs text-slate-400 font-mono tracking-wider">WELCOME BACK</p>
          <h1 className="text-2xl font-bold text-white font-display">Fahim</h1>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E3000F] to-[#FF4D4D] flex items-center justify-center shadow-[0_0_15px_rgba(227,0,15,0.4)]">
          <span className="font-bold text-white">RR</span>
        </div>
      </div>
      
      {/* ব্যালেন্স কার্ড */}
      <div className="relative overflow-hidden bg-[#131921] border border-slate-700/80 rounded-[28px] p-7 shadow-2xl mb-8 group hover:border-[#E3000F]/50 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E3000F] rounded-full blur-[70px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-mono font-bold mb-2 uppercase tracking-widest flex items-center">
            <ShieldCheck size={14} className="mr-2 text-[#E3000F]" />
            Total Recovered
          </p>
          <h2 className="text-5xl font-extrabold text-white mb-2 tracking-tight">€ 145<span className="text-slate-500 text-3xl">.50</span></h2>
          <p className="text-[10px] text-slate-500 font-mono">ALL PAYMENTS DIRECT TO YOUR IBAN</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-slate-300 font-mono tracking-wider uppercase">Active Tracking</h3>
        <span className="text-[10px] bg-[#E3000F]/20 text-[#E3000F] border border-[#E3000F]/30 px-2 py-0.5 rounded uppercase font-mono font-bold animate-pulse">Live</span>
      </div>
      
      {/* ট্রেনের কার্ড (Clickable to Details) */}
      <div 
        onClick={() => navigate('ticket-details')}
        className="bg-[#181E29] rounded-2xl p-4 border border-slate-800 shadow-lg flex items-center mb-4 cursor-pointer hover:border-slate-500 transition-colors"
      >
        <div className="bg-[#131921] p-3 rounded-xl border border-slate-700 mr-4">
          <Train className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white text-sm">ICE 704 <span className="text-slate-500 font-normal">Berlin - Munich</span></h4>
          <p className="text-xs text-slate-400 font-mono mt-1">DEP: 14:30 | PLATFORM 3</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <ChevronRight size={16} className="text-slate-500 mb-1" />
          <span className="text-[10px] font-bold text-[#E3000F] bg-[#E3000F]/10 border border-[#E3000F]/20 px-2 py-0.5 rounded-md tracking-wider">+65m</span>
        </div>
      </div>
    </div>
  );

  // 7. Scan/Upload Screen
  const renderScan = () => (
    <div className="p-6 h-full flex flex-col justify-center items-center animate-fade-in text-center pb-24">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#E3000F] blur-[50px] opacity-20 rounded-full"></div>
        <div className="relative bg-[#131921] border border-slate-700 w-28 h-28 rounded-[2rem] flex items-center justify-center shadow-xl">
          <ScanLine size={40} className="text-[#E3000F]" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2 font-display">Scan DB Ticket</h2>
      <p className="text-slate-400 mb-10 max-w-xs text-sm">Upload your PDF ticket or point the camera at the QR code. AI will handle the rest.</p>
      
      <button className="w-full bg-[#E3000F] hover:bg-[#FF3333] text-white font-bold py-4 rounded-2xl shadow-[0_10px_30px_rgba(227,0,15,0.3)] flex justify-center items-center mb-4 transition-all">
        <PlusCircle className="mr-2" size={20} /> UPLOAD TICKET (PDF)
      </button>
      <button className="w-full bg-[#181E29] text-white font-bold py-4 rounded-2xl border border-slate-700 hover:bg-[#131921] transition-all flex justify-center items-center">
        SCAN QR CODE
      </button>
    </div>
  );

  // 8. Claims History
  const renderClaims = () => (
    <div className="p-6 animate-fade-in pb-24">
      <h2 className="text-xl font-bold text-white mb-6 font-mono uppercase tracking-wider mt-4">Claim Registry</h2>
      
      <div className="space-y-3">
        {/* সফল রিফান্ড */}
        <div className="bg-[#181E29] rounded-2xl p-5 border border-slate-800 flex items-center">
          <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20 mr-4">
            <CheckCircle className="text-green-500" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">ICE 109</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-1">CLAIM_ID: #REF-4492</p>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-green-400">+ € 35.00</h4>
            <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase">Settled</p>
          </div>
        </div>

        {/* প্রসেসিং রিফান্ড */}
        <div onClick={() => navigate('ticket-details')} className="bg-[#181E29] rounded-2xl p-5 border border-slate-800 flex items-center cursor-pointer hover:border-slate-600 transition-colors">
          <div className="bg-[#FF9900]/10 p-2 rounded-lg border border-[#FF9900]/20 mr-4">
            <Clock className="text-[#FF9900]" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white text-sm">IC 2024</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-1">60+ MINS LATE</p>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-white">€ 15.00</h4>
            <p className="text-[9px] text-[#FF9900] font-mono mt-1 uppercase">Processing</p>
          </div>
        </div>
      </div>
    </div>
  );

  // 9. Profile Screen
  const renderProfile = () => (
    <div className="p-6 animate-fade-in pb-24">
      <h2 className="text-xl font-bold text-white mb-6 font-mono uppercase tracking-wider mt-4">System Config</h2>
      
      {/* সাবস্ক্রিপশন স্ট্যাটাস */}
      <div className="bg-gradient-to-r from-[#131921] to-[#181E29] rounded-2xl p-6 border border-[#E3000F]/30 mb-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#E3000F]/10 to-transparent"></div>
        <div className="relative z-10">
          <p className="text-[10px] text-slate-400 font-mono mb-1">SUBSCRIPTION LAYER</p>
          <h3 className="text-lg font-bold text-white">Pro Automator</h3>
        </div>
        <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] px-2 py-1 rounded font-mono font-bold relative z-10">
          ACTIVE
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
            className="bg-transparent text-[#00E5FF] font-mono tracking-[0.1em] text-xs outline-none w-full"
          />
        </div>
      </div>

      {/* Other Menu */}
      <div className="bg-[#181E29] rounded-2xl border border-slate-800 divide-y divide-slate-800">
        <button className="w-full flex items-center justify-between p-4 hover:bg-[#131921] transition-colors rounded-t-2xl text-slate-300 text-sm">
          <span>Legal & Privacy</span>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
        <button onClick={() => navigate('onboarding')} className="w-full flex items-center justify-between p-4 hover:bg-[#131921] transition-colors rounded-b-2xl text-[#E3000F] text-sm font-bold">
          <span>Logout Session</span>
          <ChevronRight size={16} className="text-[#E3000F]" />
        </button>
      </div>
    </div>
  );

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
    <div className="bg-[#0A0D12] min-h-[100dvh] font-sans flex flex-col justify-center items-center">
      {/* App Container - Responsive */}
      <div className="relative w-full max-w-md h-[100dvh] bg-[#0A0D12] flex flex-col overflow-hidden shadow-2xl">
        
        {/* মেইন কন্টেন্ট এরিয়া */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 h-full">
          {renderCurrentScreen()}
        </div>

        {/* বটম নেভিগেশন বার */}
        {showBottomNav && (
          <div className="absolute bottom-0 left-0 w-full bg-[#131921]/95 backdrop-blur-3xl border-t border-slate-800 px-8 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-between items-center z-50">
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
                  <tab.icon size={24} className={`mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(227,0,15,0.5)]' : ''}`} />
                  <span className={`text-[10px] font-mono tracking-widest ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
