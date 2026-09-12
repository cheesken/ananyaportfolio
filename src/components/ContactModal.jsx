import { useState, useEffect } from 'react';

export default function ContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null); // 'sending' | 'sent' | 'error'

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('sent');
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => {
          setIsOpen(false);
          setStatus(null);
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass =
    "w-full bg-[#F7F2E7]/60 border border-[#2E2A22]/15 rounded-md px-3 py-2 sm:px-4 sm:py-2.5 text-[clamp(0.8rem,1.6vw,0.9rem)] text-[#2E2A22] placeholder-[#5B5340]/50 focus:outline-none focus:border-[#A63D40]/50 focus:ring-1 focus:ring-[#A63D40]/20 transition-colors";

  return (
    <>
      {/* Floating action buttons */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-40 flex flex-row md:flex-col gap-2 sm:gap-3">
        {/* GitHub button */}
        <a
          href="https://github.com/cheesken"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95"
          style={{
            backgroundColor: '#6B3FA0',
            border: '2.5px dashed rgba(255,255,255,0.35)',
            boxShadow: '0 4px 16px rgba(107,63,160,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" fill="#F7F2E7" className="w-5 h-5 sm:w-6 sm:h-6">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>

        {/* LinkedIn button */}
        <a
          href="https://www.linkedin.com/in/ananya-makwana"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95"
          style={{
            backgroundColor: '#3E6680',
            border: '2.5px dashed rgba(255,255,255,0.35)',
            boxShadow: '0 4px 16px rgba(62,102,128,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          title="LinkedIn"
        >
          <svg viewBox="0 0 24 24" fill="#F7F2E7" className="w-5 h-5 sm:w-6 sm:h-6">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>

        {/* Contact button */}
        <button
          onClick={() => { setIsOpen(true); setStatus(null); }}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95"
          style={{
            backgroundColor: '#A63D40',
            border: '2.5px dashed rgba(255,255,255,0.35)',
            boxShadow: '0 4px 16px rgba(166,61,64,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
          title="Contact me"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#F7F2E7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,4 12,13 2,4" />
          </svg>
        </button>
      </div>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#2E2A22]/60 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]" />

          {/* Panel */}
          <div
            className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-xl p-5 sm:p-8 md:p-10 animate-[scaleIn_250ms_ease-out]"
            style={{
              backgroundColor: '#F7F2E7',
              border: '2px solid #A63D40',
              boxShadow: '0 16px 48px rgba(0,0,0,0.25), 0 2px 0 rgba(255,255,255,0.3) inset',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#5B5340] hover:text-[#A63D40] hover:bg-[#A63D40]/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Stamp seal accent */}
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: '#A63D40',
                  border: '2px dashed rgba(255,255,255,0.3)',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#F7F2E7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="22,4 12,13 2,4" />
                </svg>
              </div>
              <div>
                <h2
                  className="text-[clamp(1.3rem,3.5vw,1.8rem)] text-[#2E2A22] leading-tight"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Get in Touch
                </h2>
                <p
                  className="text-[clamp(0.65rem,1.2vw,0.75rem)] text-[#5B5340] tracking-wide uppercase mt-0.5"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Drop me a note
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label
                  className="block text-[clamp(0.68rem,1.3vw,0.78rem)] text-[#5B5340] mb-1 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className={inputClass}
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                />
              </div>

              <div>
                <label
                  className="block text-[clamp(0.68rem,1.3vw,0.78rem)] text-[#5B5340] mb-1 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputClass}
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                />
              </div>

              <div>
                <label
                  className="block text-[clamp(0.68rem,1.3vw,0.78rem)] text-[#5B5340] mb-1 tracking-wide uppercase"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="What's on your mind?"
                  className={`${inputClass} resize-none`}
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending' || status === 'sent'}
                className="w-full py-2.5 sm:py-3 rounded-lg text-[clamp(0.78rem,1.5vw,0.88rem)] tracking-wide uppercase transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  backgroundColor: '#A63D40',
                  color: '#F7F2E7',
                  fontWeight: 600,
                }}
              >
                {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent!' : 'Send Message'}
              </button>

              {status === 'error' && (
                <p
                  className="text-center text-[clamp(0.7rem,1.3vw,0.8rem)] text-[#A63D40]"
                  style={{ fontFamily: "'Instrument Sans', sans-serif" }}
                >
                  Something went wrong. Please try again.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
