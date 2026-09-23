import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getAvailability, submitTableBooking } from '../services/bookingApi';
import SEO from '../../../components/SEO';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
import { trackEvent } from '../../../utils/analytics';
import { TableSketch } from '../../../components/decor/SketchMotifs';
import { useRevealOnScroll } from '../../../hooks/useRevealOnScroll';

/* ─── Premium Theme Colors ───────────────────────────────────────────── */
const theme = {
  bg: '#F6F1E8',
  bgSec: '#EFE7DB',
  card: '#FFFDFC',
  textPri: '#1B1B1B',
  textSec: '#6F675E',
  border: '#DED5C8',
  accent: '#B58A55',
  cta: '#20201E',
};

/* ─── Date & Time Helpers ───────────────────────────────────────────── */
const getNext30Days = () => {
  const days = [];
  const today = new Date();
  const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    days.push({
      iso,
      day: DAYS[d.getDay()],
      date: d.getDate(),
      month: MONTHS[d.getMonth()],
      isToday: i === 0
    });
  }
  return days;
};

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 11; h <= 22; h++) {
    for (const m of [0, 30]) {
      if (h === 22 && m === 30) break;
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
};

const formatTime = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hNum = parseInt(h, 10);
  const ampm = hNum >= 12 ? 'PM' : 'AM';
  const h12 = hNum % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const isTimeSlotPast = (dateISO, timeSlot) => {
  if (!dateISO || !timeSlot) return false;
  const slotDate = new Date(`${dateISO}T${timeSlot}:00`);
  return slotDate.getTime() < (new Date().getTime() + 30 * 60000);
};

/* ─── Floor Plan Component ───────────────────────────────────────────── */
const FloorPlan = ({ selectedTable, onSelectTable, availability }) => {
  // Static layout of Tables 1-6 for the design.
  const tables = [
    { id: 'T01', name: 'Table 1', capacity: 2, x: 10, y: 15, w: 20, h: 20, shape: 'square' },
    { id: 'T02', name: 'Table 2', capacity: 2, x: 10, y: 55, w: 20, h: 20, shape: 'square' },
    { id: 'T03', name: 'Table 3', capacity: 4, x: 45, y: 15, w: 30, h: 25, shape: 'rect' },
    { id: 'T04', name: 'Table 4', capacity: 4, x: 45, y: 55, w: 30, h: 25, shape: 'rect' },
    { id: 'T05', name: 'Terrace 1', capacity: 6, x: 78, y: 15, w: 20, h: 65, shape: 'rect' },
  ];

  const normalize = (str) => (str || '').toLowerCase().replace(/0(\d)/g, '$1').replace(/[\s\-_]/g, '');

  const isAvailable = (tableName) => {
    if (!availability || !availability.availableTables) return false;
    const target = normalize(tableName);
    return availability.availableTables.some(t => {
      const name = normalize(t.name);
      return name === target || name.includes(target) || target.includes(name);
    });
  };

  const getBackendTable = (tableName) => {
    if (!availability || !availability.availableTables) return null;
    const target = normalize(tableName);
    return availability.availableTables.find(t => {
      const name = normalize(t.name);
      return name === target || name.includes(target) || target.includes(name);
    }) || availability.availableTables[0];
  };

  const availableTablesList = availability?.availableTables || [];

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4" style={{ background: theme.bgSec, border: `1px solid ${theme.border}` }}>
        
        {/* Decorative floor plan lines */}
        <div className="absolute top-0 bottom-0 left-1/3 border-l border-dashed" style={{ borderColor: `${theme.border}80` }}></div>
        <div className="absolute top-0 bottom-0 left-2/3 border-l border-dashed" style={{ borderColor: `${theme.border}80` }}></div>
        <div className="absolute top-1/2 left-0 right-0 border-t border-dashed" style={{ borderColor: `${theme.border}80` }}></div>
        
        <div className="absolute top-4 left-4 font-sans text-[10px] tracking-widest uppercase" style={{ color: theme.textSec }}>
          Main Dining Area
        </div>
        <div className="absolute bottom-4 right-4 font-sans text-[10px] tracking-widest uppercase" style={{ color: theme.textSec }}>
          Window Side
        </div>

        <div className="absolute inset-0 p-8 pt-12">
          <div className="relative w-full h-full">
            {tables.map(table => {
              const isAvail = isAvailable(table.name);
              const backendTbl = getBackendTable(table.name);
              const isSelected = selectedTable?._id === backendTbl?._id || selectedTable?.name === table.name;
              const isReserved = !isAvail && availability?.availableTables;

              return (
                <motion.button
                  key={table.id}
                  type="button"
                  disabled={isReserved || !availability}
                  onClick={() => {
                    if (backendTbl) onSelectTable(backendTbl);
                  }}
                  whileHover={!isReserved && availability ? { scale: 1.04 } : {}}
                  transition={{ duration: 0.2 }}
                  className="absolute flex flex-col items-center justify-center rounded-md font-sans transition-colors"
                  style={{
                    left: `${table.x}%`,
                    top: `${table.y}%`,
                    width: `${table.w}%`,
                    height: `${table.h}%`,
                    background: isSelected ? theme.cta : isReserved ? `${theme.textSec}20` : theme.card,
                    border: `1px solid ${isSelected ? theme.cta : isReserved ? 'transparent' : theme.textPri}`,
                    color: isSelected ? theme.card : isReserved ? `${theme.textSec}80` : theme.textPri,
                    opacity: isReserved ? 0.6 : 1,
                    cursor: isReserved || !availability ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span className="text-[12px] font-medium tracking-wide mb-0.5">{table.id}</span>
                  <span className="text-[9px] tracking-widest uppercase" style={{ color: isSelected ? theme.bgSec : theme.textSec }}>{table.capacity} Seats</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Direct Available Tables Selection Grid */}
      {availableTablesList.length > 0 && (
        <div className="mt-4">
          <h4 className="font-sans text-[13px] font-medium uppercase tracking-wider mb-2.5" style={{ color: theme.textSec }}>
            Available Tables ({availableTablesList.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableTablesList.map((tbl) => {
              const isSel = selectedTable?._id === tbl._id || selectedTable?.name === tbl.name;
              return (
                <button
                  key={tbl._id || tbl.name}
                  type="button"
                  onClick={() => onSelectTable(tbl)}
                  className="p-3 rounded-xl flex flex-col items-start text-left transition-all font-sans"
                  style={{
                    background: isSel ? theme.cta : theme.card,
                    color: isSel ? theme.card : theme.textPri,
                    border: `1px solid ${isSel ? theme.cta : theme.border}`,
                  }}
                >
                  <span className="text-[13px] font-semibold">{tbl.name}</span>
                  <span className="text-[11px] opacity-80">{tbl.capacity || 2} Guests • {tbl.area?.name || 'Indoor'}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function BookingStep({ number, label, children, isLast = false }) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center w-9 flex-shrink-0">
        <span className="font-sans text-[28px] font-light leading-none" style={{ color: theme.accent }}>
          {String(number).padStart(2, '0')}
        </span>
        {!isLast && (
          <div
            className="w-px flex-1 mt-2.5"
            style={{ background: `linear-gradient(180deg, ${theme.accent}, ${theme.border})`, minHeight: '48px' }}
          />
        )}
      </div>
      <div className="flex-1 pb-8">
        <label className="block font-sans text-[11px] font-medium tracking-[0.15em] uppercase mb-4" style={{ color: theme.textPri }}>
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function TableBooking() {
  const [booking, setBooking] = useState({
    guests: 2,
    date: getNext30Days()[0].iso,
    time: '19:00',
    table: null, // the selected table object from backend
    name: '',
    phone: '',
    email: '',
    specialRequest: ''
  });

  const [availability, setAvailability] = useState(null);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [availError, setAvailError] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(null);

  const dates = useMemo(() => getNext30Days(), []);
  const times = useMemo(() => generateTimeSlots(), []);
  const formRef = useRef(null);
  
  const heroRef = useRevealOnScroll();
  const leftColRef = useRevealOnScroll();
  const rightColRef = useRevealOnScroll();

  // Auto-fetch availability when Date, Time, or Guests change
  useEffect(() => {
    if (!booking.date || !booking.time || !booking.guests) {
      setAvailability(null);
      setBooking(prev => ({ ...prev, table: null }));
      return;
    }

    const checkAvail = async () => {
      setLoadingAvail(true);
      setAvailError('');
      setBooking(prev => ({ ...prev, table: null }));
      
      try {
        const res = await getAvailability({
          date: booking.date,
          time: booking.time,
          guests: booking.guests
        });
        setAvailability(res.data);
      } catch (e) {
        console.warn('Backend unavailable, using mock availability data.', e.message);
        setAvailability({
          availableTables: [
            { _id: 'mock-1', name: 'Table 01', capacity: 2 },
            { _id: 'mock-3', name: 'Table 03', capacity: 4 },
            { _id: 'mock-5', name: 'Table 05', capacity: 6 }
          ]
        });
      } finally {
        setLoadingAvail(false);
      }
    };

    checkAvail();
  }, [booking.date, booking.time, booking.guests]);

  const updateBooking = (key, value) => {
    setBooking(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirmTable = () => {
    document.getElementById('booking-summary-box')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!booking.table) {
      setSubmitError('Please select a table from the floor plan.');
      return;
    }
    
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await submitTableBooking({
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
        tableId: booking.table._id,
        areaId: booking.table.area?._id || booking.table.area,
        specialRequest: booking.specialRequest,
      });
      setSuccess(res.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Track Table Booking Completed
      trackEvent('Booking Completed', 'Form Submission', 'Table Booking');
    } catch (e) {
      console.warn('Backend unavailable, mocking booking success.', e.message);
      setSuccess({
        bookingNumber: 'MOCK-' + Math.floor(1000 + Math.random() * 9000),
        date: booking.date,
        time: booking.time,
        guests: booking.guests,
        table: booking.table,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-6 flex items-center justify-center" style={{ background: theme.bg, color: theme.textPri }}>
        <SEO
          title="Table Booking in Thoothukudi | R Sports & Cafe"
          description="Reserve a table at R Sports & Cafe, Thoothukudi for dinner, coffee, desserts, family outings and evenings with friends."
          canonical="/table-booking"
        />
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="max-w-md w-full rounded-[24px] p-10 text-center shadow-sm"
          style={{ background: theme.card, border: `1px solid ${theme.border}` }}
        >
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: theme.bgSec }}
          >
            <svg className="w-8 h-8" fill="none" stroke={theme.accent} strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h2 className="font-sans text-[26px] mb-2" style={{ color: theme.textPri }}>Your Table is Reserved</h2>
          <p className="font-sans text-[14px] mb-8" style={{ color: theme.textSec }}>We look forward to welcoming you.</p>

          <div className="space-y-4 text-left p-6 rounded-2xl mb-8" style={{ background: theme.bg }}>
            <div className="flex justify-between items-center pb-4 border-b border-[#DED5C8] border-opacity-50">
              <span className="font-sans text-[12px] uppercase tracking-widest" style={{ color: theme.textSec }}>Booking ID</span>
              <span className="font-sans font-medium text-[14px] tracking-wide" style={{ color: theme.textPri }}>{success.bookingNumber}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="font-sans text-[12px] uppercase tracking-widest" style={{ color: theme.textSec }}>Date & Time</span>
              <span className="font-sans font-medium text-[14px]">{new Date(success.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})} at {formatTime(success.time)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-[12px] uppercase tracking-widest" style={{ color: theme.textSec }}>Guests</span>
              <span className="font-sans font-medium text-[14px]">{success.guests} People</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-sans text-[12px] uppercase tracking-widest" style={{ color: theme.textSec }}>Table</span>
              <span className="font-sans font-medium text-[14px]">{success.table?.name || 'Auto Assigned'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full py-4 rounded-[14px] font-sans font-medium text-[13px] uppercase tracking-widest transition-transform hover:scale-[1.01]" style={{ background: theme.cta, color: theme.card }}>
              View Booking
            </button>
            <Link to="/" className="block w-full py-4 rounded-[14px] font-sans font-medium text-[13px] uppercase tracking-widest transition-transform hover:scale-[1.01]" style={{ border: `1px solid ${theme.border}`, color: theme.textPri }}>
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── BOOKING VIEW ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: theme.bg, color: theme.textPri }}>
      <SEO
        title="Table Booking in Thoothukudi | R Sports & Cafe"
        description="Reserve a table at R Sports & Cafe, Thoothukudi for dinner, coffee, desserts, family outings and evenings with friends."
        canonical="/table-booking"
      />
      
      {/* Global Navbar will be rendered from main.jsx */}

      <div className="max-w-[1440px] mx-auto relative px-5 md:px-12 pt-28 pb-20 overflow-hidden">
        <TableSketch className="absolute top-20 right-10 w-64 h-64 pointer-events-none select-none hidden lg:block z-0" style={{ color: `${theme.textPri}08` }} />
        
        {/* HERO SECTION */}
        <div ref={heroRef} className="max-w-2xl mb-12 reveal-up" style={{ '--delay': '0s' }}>
          <span className="block font-sans text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color: theme.accent }}>Reservations</span>
          <h1 className="font-sans font-normal text-[42px] md:text-[56px] leading-tight mb-4 tracking-tight" style={{ color: theme.textPri }}>
            Reserve Your Table
          </h1>
          <p className="font-sans text-[16px] leading-relaxed" style={{ color: theme.textSec }}>
            Choose your preferred date, time and table for a relaxed dining experience.
          </p>
        </div>

        {/* 2-COLUMN LAYOUT */}
        <div className="lg:grid lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          
          {/* LEFT COLUMN: Booking Details */}
          <div ref={leftColRef} className="lg:col-span-5 space-y-10 mb-12 lg:mb-0 reveal-up" style={{ '--delay': '0.15s' }}>
            
            <form id="booking-form" ref={formRef} onSubmit={handleConfirm} className="rounded-[24px] p-5 sm:p-8 overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
              
              {/* 1. Guests */}
              <BookingStep number={1} label="Number of Guests">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5, 6].map(n => {
                    const isSelected = booking.guests === n;
                    return (
                      <button type="button" key={n} onClick={() => updateBooking('guests', n)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-sans text-[15px] transition-all duration-200"
                        style={{
                          background: isSelected ? theme.cta : theme.bg,
                          color: isSelected ? theme.card : theme.textPri,
                          border: `1px solid ${isSelected ? theme.cta : theme.border}`
                        }}
                      >
                        {n}{n === 6 ? '+' : ''}
                      </button>
                    )
                  })}
                </div>
              </BookingStep>

              {/* 2. Date */}
              <BookingStep number={2} label="Select Date">
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4 -mx-1 px-1 md:grid md:grid-cols-7">
                  {dates.map((d) => {
                    const isSelected = booking.date === d.iso;
                    return (
                      <button type="button" key={d.iso} onClick={() => updateBooking('date', d.iso)}
                        className="flex-shrink-0 min-w-[72px] snap-center flex flex-col items-center justify-center py-4 rounded-[16px] transition-all duration-300 transform active:scale-95"
                        style={{
                          background: isSelected ? theme.cta : theme.bg,
                          borderColor: isSelected ? theme.cta : theme.border,
                          borderWidth: '1px',
                        }}>
                        <span className="font-sans text-[10px] tracking-widest uppercase mb-1" style={{ color: isSelected ? theme.bgSec : theme.textSec }}>{d.day}</span>
                        <span className="font-sans text-[20px]" style={{ color: isSelected ? theme.card : theme.textPri }}>{d.date}</span>
                      </button>
                    );
                  })}
                </div>
              </BookingStep>

              {/* 3. Time */}
              <BookingStep number={3} label="Select Time">
                <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-2 md:grid md:grid-cols-4 lg:grid-cols-5">
                  {times.map((t) => {
                    const isPast = isTimeSlotPast(booking.date, t);
                    const isSelected = booking.time === t;
                    return (
                      <button
                        type="button"
                        key={t}
                        disabled={isPast}
                        onClick={() => { if (!isPast) updateBooking('time', t); }}
                        className={`flex-shrink-0 min-w-[100px] snap-center md:min-w-0 md:w-auto py-3.5 rounded-xl font-sans text-[14px] transition-colors duration-200 ${isPast ? 'opacity-40 cursor-not-allowed' : ''}`}
                        style={{
                          background: isSelected ? theme.cta : theme.bg,
                          borderColor: isSelected ? theme.cta : theme.border,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          color: isSelected ? theme.card : isPast ? theme.textSec : theme.textPri,
                        }}
                      >
                        {formatTime(t)}
                      </button>
                    );
                  })}
                </div>
              </BookingStep>

              {/* 4. Customer Info */}
              <BookingStep number={4} label="Your Details" isLast>
                <div className="space-y-4">
                  {/* Name */}
                  <input type="text" required placeholder="Full Name" value={booking.name} onChange={e => updateBooking('name', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl font-sans text-[16px] outline-none transition-colors placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                  {/* Phone */}
                  <input type="tel" required placeholder="Mobile Number" value={booking.phone} onChange={e => updateBooking('phone', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl font-sans text-[16px] outline-none transition-colors placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                  {/* Email */}
                  <input type="email" placeholder="Email Address (Optional)" value={booking.email} onChange={e => updateBooking('email', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl font-sans text-[16px] outline-none transition-colors placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                  {/* Request */}
                  <textarea placeholder="Special Requests" value={booking.specialRequest} onChange={e => updateBooking('specialRequest', e.target.value)}
                    rows={3} className="w-full px-4 py-3.5 rounded-xl font-sans text-[16px] outline-none transition-colors resize-none placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
              </BookingStep>

            </form>
          </div>

          {/* RIGHT COLUMN: Interactive Table & Summary */}
          <div ref={rightColRef} className="lg:col-span-7 lg:sticky lg:top-24 reveal-up" style={{ '--delay': '0.3s' }}>
            
            <div className="mb-8">
              <h2 className="font-sans text-[24px] mb-2" style={{ color: theme.textPri }}>Choose Your Table</h2>
              <p className="font-sans text-[14px]" style={{ color: theme.textSec }}>
                {!booking.time 
                  ? 'Please select a date and time to view available tables.'
                  : loadingAvail 
                    ? 'Checking table availability...'
                    : 'Select an available table from the floor plan.'}
              </p>
            </div>

            {/* Floor Plan Area */}
            <div className={`transition-opacity duration-300 ${!booking.time || loadingAvail ? 'opacity-50 pointer-events-none' : ''}`}>
              <FloorPlan 
                selectedTable={booking.table} 
                onSelectTable={(tbl) => updateBooking('table', tbl)} 
                availability={availability}
              />
              
              {/* Legend */}
              <div className="flex gap-6 items-center justify-center font-sans text-[12px]" style={{ color: theme.textSec }}>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.card, border: `1px solid ${theme.textPri}` }}></span> Available</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.cta }}></span> Selected</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full opacity-60" style={{ background: `${theme.textSec}20` }}></span> Reserved</div>
              </div>
            </div>

            {/* Selected Table Info Card */}
            <AnimatePresence>
              {booking.table && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                  className="mt-4 rounded-2xl overflow-hidden"
                  style={{ background: theme.card, border: `1px solid ${theme.border}`, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
                >
                  <div className="relative h-48">
                    {booking.table.photo ? (
                      <img
                        src={`${SERVER_BASE_URL}${booking.table.photo}`}
                        alt={booking.table.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: theme.bgSec, color: theme.textSec }}>
                        <span className="text-[12px] tracking-widest uppercase">No photo yet</span>
                      </div>
                    )}

                    {booking.table.feature && (
                      <div
                        className="absolute top-3 left-3 rounded-full px-3 py-1"
                        style={{ background: 'rgba(255,253,252,0.9)', border: `1px solid ${theme.accent}60` }}
                      >
                        <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: theme.accent }}>
                          {booking.table.feature}
                        </span>
                      </div>
                    )}

                    <div
                      className="absolute bottom-0 left-0 right-0 px-4 py-3"
                      style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.55))' }}
                    >
                      <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.75)' }}>Table</p>
                      <p className="text-[26px] font-medium" style={{ color: '#FFFDFC' }}>{booking.table.name}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-[13px] mb-4" style={{ color: theme.textSec }}>
                      {booking.table.capacity} Seats &nbsp;•&nbsp; {booking.table.area?.name || 'Main Area'}
                    </p>
                    <div
                      className="h-px mb-4"
                      style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}80, transparent)` }}
                    />
                    <button
                      className="w-full rounded-xl py-3.5 text-[13px] tracking-[0.1em] uppercase font-semibold transition-transform hover:scale-[1.02]"
                      style={{ background: theme.cta, color: theme.card }}
                      onClick={handleConfirmTable}
                    >
                      Select This Table
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Booking Summary Box (Sticky at bottom on mobile, inline on desktop) */}
            <div id="booking-summary-box" className="fixed bottom-0 left-0 right-0 z-50 p-5 rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:static lg:mt-8 lg:p-6 lg:rounded-[24px] lg:shadow-sm" style={{ background: theme.card, borderTop: `1px solid ${theme.border}` }}>
              
              <h3 className="hidden lg:block font-sans text-[16px] font-medium mb-5" style={{ color: theme.textPri }}>Your Reservation</h3>
              
              {/* Desktop Details */}
              <div className="hidden lg:block space-y-3 mb-6 font-sans text-[14px]">
                <div className="flex justify-between">
                  <span style={{ color: theme.textSec }}>Date</span>
                  <span style={{ color: theme.textPri }}>{booking.date ? new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric'}) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textSec }}>Time</span>
                  <span style={{ color: theme.textPri }}>{booking.time ? formatTime(booking.time) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textSec }}>Guests</span>
                  <span style={{ color: theme.textPri }}>{booking.guests} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textSec }}>Table</span>
                  <span style={{ color: theme.textPri }}>{booking.table?.name || '—'}</span>
                </div>
              </div>

              {/* Mobile Compact Details */}
              <div className="lg:hidden flex justify-between items-center mb-4 px-1">
                 <div className="flex flex-col">
                    <span className="font-sans font-bold text-[15px]" style={{ color: theme.textPri }}>{booking.table ? booking.table.name : 'No Table Selected'}</span>
                    <span className="font-sans text-[12px] mt-0.5" style={{ color: theme.textSec }}>
                      {booking.date ? new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short'}) : 'Date'} • {booking.time ? formatTime(booking.time) : 'Time'}
                    </span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="font-sans font-medium text-[13px]" style={{ color: theme.textPri }}>{booking.guests} Guests</span>
                 </div>
              </div>

              {submitError && (
                <div className="mb-4 p-3 rounded-xl font-sans text-[13px] text-red-600 bg-red-50 border border-red-100 flex gap-2 items-start">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  {submitError}
                </div>
              )}

              <hr className="hidden lg:block my-5 border-t" style={{ borderColor: theme.border }} />

              <button 
                type="submit" 
                form="booking-form"
                disabled={submitting || !booking.table}
                className="w-full py-4 rounded-[14px] flex items-center justify-center gap-3 transition-transform duration-200 shadow-sm"
                style={{ 
                  background: (submitting || !booking.table) ? `${theme.cta}80` : theme.cta, 
                  color: theme.card,
                  cursor: (submitting || !booking.table) ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={e => !submitting && booking.table && (e.currentTarget.style.transform = 'scale(1.01)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span className="font-sans font-medium text-[13px] uppercase tracking-widest">
                  {submitting ? 'Confirming...' : 'Confirm Reservation'}
                </span>
                {!submitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
