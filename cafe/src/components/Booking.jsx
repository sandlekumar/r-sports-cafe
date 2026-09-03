import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { trackEvent } from '../utils/analytics';

import bgImage from '../assets/tasteandplay/hero.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'elite-membership',
    date: '',
    time: '',
  });
  
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const sectionRef = useRef(null);
  const formColRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        formColRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', service: 'elite-membership', date: '', time: '' });
        
        // Track Form Submission (Booking Completed / Event Enquiry)
        if (formData.service === 'events-parties') {
          trackEvent('Event Enquiry', 'Form Submission', 'Booking Section');
        } else {
          trackEvent('Booking Completed', 'Form Submission', `Service: ${formData.service}`);
        }
      }, 4000);
    } catch (error) {
      console.error('Booking error:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative w-full min-h-[90vh] flex items-center justify-center py-24 md:py-32 px-6 md:px-16 overflow-hidden bg-[#0A0A0A]"
      id="booking"
    >
      {/* Aesthetic Background */}
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="Luxury Interior" className="w-full h-full object-cover" style={{ filter: 'brightness(0.35) contrast(1.15) sepia(0.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent opacity-80" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        
        {/* Left Side: Aesthetic Typography */}
        <div className="lg:w-1/2 text-white">
          <div className="mb-8">
            <span className="font-inter font-medium text-[12px] tracking-[0.24em] text-[#D4AF37] mb-6 block">
              YOUR TABLE. YOUR TIME.
            </span>
            <h2 className="font-sans font-bold text-[clamp(40px,10vw,72px)] text-white leading-[0.95] tracking-[-0.03em] uppercase">
              Make<br />It R.
            </h2>
          </div>
          <div className="font-inter font-normal text-[16px] md:text-[18px] text-white/60 tracking-[-0.01em] leading-[1.8] max-w-md space-y-4">
            <p><strong>What's Your Plan Today?</strong></p>
            <p className="text-[15px]">
              <strong>A game?</strong> Book the turf.<br />
              <strong>A meal?</strong> Reserve your table.<br />
              <strong>A celebration?</strong> Plan it with us.
            </p>
            <p>Reserve your table before you arrive and spend less time waiting and more time enjoying the moment.</p>
          </div>
          <div className="mt-12 flex items-center gap-4">
            <div className="w-12 h-[1px] bg-gradient-to-r from-[#D4AF37] to-transparent" />
            <span className="font-inter text-[11px] tracking-[0.2em] text-[#D4AF37] uppercase">
              Find Us in Thoothukudi
            </span>
          </div>
          <div className="mt-8">
            <p className="font-inter text-white text-[14px] leading-relaxed mb-6 opacity-80">
              <strong className="text-white">R SPORTS & CAFE</strong><br/>
              SNR Nagar, 4/4,<br/>
              Caldwell Colony,<br/>
              Thoothukudi,<br/>
              Tamil Nadu – 628003<br/>
              <span className="text-[#D4AF37] mt-2 block">Phone: +91 73585 85151</span>
            </p>
            <div className="flex items-center gap-6 md:gap-8">
              <a 
                href="tel:+917358585151" 
                onClick={() => trackEvent('Phone Call Click', 'Contact', 'Booking Section')}
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="block font-sans font-bold text-[14px] md:text-[16px] text-white uppercase tracking-wider">Call Now</span>
              </a>
              <div className="w-[1px] h-8 bg-white/10" />
              <a 
                href="https://wa.me/917358585151"
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('WhatsApp Click', 'Contact', 'Booking Section')}
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="block font-sans font-bold text-[14px] md:text-[16px] text-white uppercase tracking-wider">WhatsApp</span>
              </a>
              <div className="w-[1px] h-8 bg-white/10" />
              <a 
                href="https://www.google.com/maps/place/R+SPORTS+%26+CAFE/@8.7912405,78.1450406,15z/data=!4m6!3m5!1s0x3b03ef5a831e4fcb:0x6d5a035b4757c634!8m2!3d8.7859027!4d78.1408559!16s%2Fg%2F11nhm7b7hs"
                target="_blank" rel="noopener noreferrer"
                onClick={() => trackEvent('Directions Click', 'Contact', 'Booking Section')}
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="block font-sans font-bold text-[14px] md:text-[16px] text-white uppercase tracking-wider">Directions</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Form */}
        <div ref={formColRef} className="lg:w-1/2 w-full opacity-0 relative">
          {/* Aesthetic background image behind the form */}
          <div className="absolute -inset-4 z-0 rounded-[40px] overflow-hidden opacity-50 blur-[2px] hidden md:block">
             <img src={bgImage} className="w-full h-full object-cover" style={{ filter: 'brightness(1.5) contrast(1.2)' }} alt="" />
             <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent" />
          </div>
          
          <div className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/10 border-l-[#D4AF37]/30 border-l-2 rounded-[32px] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form 
                  key="booking-form"
                  onSubmit={handleSubmit}
                  className="space-y-8"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
                >
                  {/* Name field */}
                  <div className="relative group">
                    <label 
                      className={`absolute left-0 top-0 font-sans text-[13px] tracking-[0.1em] text-white/50 transition-all duration-300 pointer-events-none uppercase ${
                        focusedField === 'name' || formData.name ? '-translate-y-6 text-white scale-90' : 'translate-y-3'
                      }`}
                    >
                      FULL NAME
                    </label>
                    <input 
                      type="text" name="name" required value={formData.name}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-white/20 py-3 text-[16px] font-sans text-white focus:outline-none focus:border-white transition-colors duration-500"
                    />
                    <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37] origin-left scale-x-0 transition-transform duration-500 ${focusedField === 'name' ? 'scale-x-100' : ''}`} />
                  </div>

                  {/* Email field */}
                  <div className="relative group">
                    <label 
                      className={`absolute left-0 top-0 font-sans text-[13px] tracking-[0.1em] text-white/50 transition-all duration-300 pointer-events-none uppercase ${
                        focusedField === 'email' || formData.email ? '-translate-y-6 text-white scale-90' : 'translate-y-3'
                      }`}
                    >
                      EMAIL ADDRESS
                    </label>
                    <input 
                      type="email" name="email" required value={formData.email}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-white/20 py-3 text-[16px] font-sans text-white focus:outline-none focus:border-white transition-colors duration-500"
                    />
                    <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37] origin-left scale-x-0 transition-transform duration-500 ${focusedField === 'email' ? 'scale-x-100' : ''}`} />
                  </div>

                  {/* Service selection */}
                  <div className="relative group">
                    <label className="absolute left-0 -translate-y-6 font-sans text-[11px] tracking-[0.1em] text-white/50 uppercase">
                      SELECT SERVICE
                    </label>
                    <select 
                      name="service" value={formData.service}
                      onFocus={() => setFocusedField('service')} onBlur={() => setFocusedField(null)} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-white/20 py-3 text-[16px] font-sans text-white focus:outline-none focus:border-white transition-colors duration-500 appearance-none rounded-none cursor-pointer"
                    >
                      <option value="elite-membership" className="bg-[#111] text-white">ELITE MEMBERSHIP INQUIRY</option>
                      <option value="turf-booking" className="bg-[#111] text-white">TURF COURT RESERVATION</option>
                      <option value="table-booking" className="bg-[#111] text-white">TABLE BOOKING</option>
                      <option value="gastronomy-booking" className="bg-[#111] text-white">GASTRONOMY RESERVATION</option>
                      <option value="private-event" className="bg-[#111] text-white">PRIVATE EVENT HIRE</option>
                    </select>
                    <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37] origin-left scale-x-0 transition-transform duration-500 ${focusedField === 'service' ? 'scale-x-100' : ''}`} />
                    <div className="absolute right-0 top-4 pointer-events-none text-white/50">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative group">
                      <label className="absolute left-0 -translate-y-6 font-sans text-[11px] tracking-[0.1em] text-white/50 uppercase">DATE</label>
                      <input 
                        type="date" name="date" value={formData.date}
                        onFocus={() => setFocusedField('date')} onBlur={() => setFocusedField(null)} onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-white/20 py-3 text-[16px] font-sans text-white focus:outline-none focus:border-[#D4AF37] transition-colors duration-500"
                      />
                      <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37] origin-left scale-x-0 transition-transform duration-500 ${focusedField === 'date' ? 'scale-x-100' : ''}`} />
                    </div>
                    <div className="relative group">
                      <label className="absolute left-0 -translate-y-6 font-sans text-[11px] tracking-[0.1em] text-white/50 uppercase">TIME</label>
                      <input 
                        type="time" name="time" value={formData.time}
                        onFocus={() => setFocusedField('time')} onBlur={() => setFocusedField(null)} onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-white/20 py-3 text-[15px] font-sans text-white focus:outline-none focus:border-[#D4AF37] transition-colors duration-500"
                      />
                      <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#D4AF37] origin-left scale-x-0 transition-transform duration-500 ${focusedField === 'time' ? 'scale-x-100' : ''}`} />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="relative w-full py-4 md:py-5 font-sans text-[14px] font-bold tracking-[0.1em] uppercase rounded-[12px] overflow-hidden group transition-all duration-500 hover:shadow-[0_0_50px_rgba(212,175,55,0.4)]"
                      style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)' }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        SUBMIT REQUEST
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </span>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="booking-success"
                  className="flex flex-col items-center justify-center text-center py-12"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-8">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-sans font-bold text-2xl md:text-3xl text-white mb-4">Request Received.</h3>
                  <p className="font-inter text-[15px] text-white/60 max-w-[280px] leading-relaxed">
                    Our concierge team is reviewing your details and will connect with you shortly.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
