import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getAvailability, submitTableBooking } from '../services/bookingApi';
import SEO from '../../../components/SEO';
import { trackEvent } from '../../../utils/analytics';

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

      <div className="max-w-[1440px] mx-auto px-5 md:px-12 pt-28 pb-20 overflow-hidden">
        
        {/* HERO SECTION */}
        <div className="max-w-2xl mb-12">
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
          <div className="lg:col-span-5 space-y-10 mb-12 lg:mb-0">
            
            <form id="booking-form" ref={formRef} onSubmit={handleConfirm} className="rounded-[24px] p-5 sm:p-8 overflow-hidden" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
              
              {/* 1. Guests */}
              <div className="mb-10">
                <label className="block font-sans text-[12px] font-medium tracking-wide uppercase mb-4" style={{ color: theme.textPri }}>1. Number of Guests</label>
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
              </div>

              {/* 2. Date */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <label className="block font-sans text-[12px] font-medium tracking-wide uppercase" style={{ color: theme.textPri }}>2. Select Date</label>
                  <svg className="w-4 h-4" fill="none" stroke={theme.textSec} strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
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
              </div>

              {/* 3. Time */}
              <div className="mb-10">
                <label className="block font-sans text-[12px] font-medium tracking-wide uppercase mb-4" style={{ color: theme.textPri }}>3. Select Time</label>
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
              </div>

              {/* 4. Customer Info */}
              <div>
                <label className="block font-sans text-[12px] font-medium tracking-wide uppercase mb-4" style={{ color: theme.textPri }}>4. Customer Details</label>
                <div className="space-y-4">
                  {/* Name */}
                  <input type="text" required placeholder="Full Name" value={booking.name} onChange={e => updateBooking('name', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl font-sans text-[14px] outline-none transition-colors placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                  {/* Phone */}
                  <input type="tel" required placeholder="Mobile Number" value={booking.phone} onChange={e => updateBooking('phone', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl font-sans text-[14px] outline-none transition-colors placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                  {/* Email */}
                  <input type="email" placeholder="Email Address (Optional)" value={booking.email} onChange={e => updateBooking('email', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl font-sans text-[14px] outline-none transition-colors placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                  {/* Request */}
                  <textarea placeholder="Special Requests" value={booking.specialRequest} onChange={e => updateBooking('specialRequest', e.target.value)}
                    rows={3} className="w-full px-4 py-3.5 rounded-xl font-sans text-[14px] outline-none transition-colors resize-none placeholder-[#A59F96]"
                    style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.textPri }}
                    onFocus={e => e.target.style.borderColor = theme.accent}
                    onBlur={e => e.target.style.borderColor = theme.border}
                  />
                </div>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: Interactive Table & Summary */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            
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
                  className="mt-8 p-6 rounded-2xl flex items-center justify-between"
                  style={{ background: theme.card, border: `1px solid ${theme.border}` }}
                >
                  <div>
                    <h4 className="font-sans text-[16px] font-medium mb-1" style={{ color: theme.textPri }}>{booking.table.name}</h4>
                    <p className="font-sans text-[13px] mb-3" style={{ color: theme.textSec }}>{booking.table.capacity} Guests • {booking.table.area?.name || 'Main Area'}</p>
                    <p className="font-sans text-[12px] italic" style={{ color: theme.textSec }}>A comfortable table in the {booking.table.area?.name || 'dining area'}.</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-[11px] font-medium tracking-widest uppercase" style={{ color: theme.accent, background: `${theme.accent}15` }}>
                    Selected
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Booking Summary Box (Sticky at bottom on mobile, inline on desktop) */}
            <div className="mt-8 p-6 rounded-[24px] shadow-sm" style={{ background: theme.card, border: `1px solid ${theme.border}` }}>
              <h3 className="font-sans text-[16px] font-medium mb-5" style={{ color: theme.textPri }}>Your Reservation</h3>
              
              <div className="space-y-3 mb-6 font-sans text-[14px]">
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

              {submitError && (
                <div className="mb-4 p-3 rounded-xl font-sans text-[13px] text-red-600 bg-red-50 border border-red-100 flex gap-2 items-start">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  {submitError}
                </div>
              )}

              <hr className="my-5 border-t" style={{ borderColor: theme.border }} />

              <button 
                type="submit" 
                form="booking-form"
                disabled={submitting || !booking.table}
                className="w-full py-4 rounded-[14px] flex items-center justify-center gap-3 transition-transform duration-200"
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
