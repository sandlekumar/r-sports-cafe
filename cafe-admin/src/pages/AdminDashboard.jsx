import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config.js';
import '../admin.css';

/* ─── Greeting helper ─────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

/* ─── Status badge lookup ─────────────────────────────────────────────────── */
const STATUS_BADGE = {
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-confirmed',
  ARRIVED: 'badge-arrived',
  SEATED: 'badge-seated',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
};
const getStatusBadge = (s) => STATUS_BADGE[s] || 'badge-pending';

/* ─── Category badge lookup ───────────────────────────────────────────────── */
const CAT_BADGE = {
  weekly: 'badge-weekly',
  tournament: 'badge-tournament',
  special: 'badge-special',
};
const CAT_COLORS = {
  weekly: { bg: 'rgba(46,125,50,0.12)', color: '#2E7D32', border: 'rgba(46,125,50,0.35)' },
  tournament: { bg: 'rgba(215,38,61,0.12)', color: '#D7263D', border: 'rgba(215,38,61,0.35)' },
  special: { bg: 'rgba(201,123,61,0.12)', color: '#C97B3D', border: 'rgba(201,123,61,0.35)' },
};
const getCatBadge = (c) => CAT_BADGE[c] || 'badge-special';

/* ─── Event form blank ────────────────────────────────────────────────────── */
const BLANK_EVENT_FORM = {
  title: '', description: '', category: 'special', sportType: '', date: '', time: '',
  recurrenceDay: '', cta_label: 'Book Now', cta_link: '#booking',
  status: 'upcoming', is_featured: false, is_trending: false, trending_score: 0, display_order: 0,
  price: '', capacity: '', spotsLeft: '', tags: '',
};

/* ─── Menu form blank ─────────────────────────────────────────────────────── */
const BLANK_MENU_FORM = {
  name: '', category: 'SIGNATURE BURGER', desc: '', price: '₹349',
  photo: '', video_loop_url: '', is_trending: false, trending_score: 0,
  accent: '#C8956C', status: 'active', display_order: 0,
};

/* ─── Reel form blank ─────────────────────────────────────────────────────── */
const BLANK_REEL_FORM = {
  caption: '', handle: '@rsports.cafe', videoUrl: '', tag: 'HIGHLIGHTS',
  likes: '1.2K', comments: '45', status: 'active', display_order: 0,
};

/* ─── Sidebar SVG icons ───────────────────────────────────────────────────── */
const NavIcons = {
  overview: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  bookings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  turf: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  events: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  tables: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
      <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
  ),
  customers: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  menu: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  reels: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <polygon points="10 8 16 12 10 16 10 8"/>
    </svg>
  ),
  settings: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',         icon: NavIcons.overview  },
  { id: 'bookings',  label: 'Reservations',      icon: NavIcons.bookings  },
  { id: 'turf',      label: 'Turf Bookings',     icon: NavIcons.turf      },
  { id: 'events',    label: 'Events',            icon: NavIcons.events    },
  { id: 'menu',      label: 'Menu Items',        icon: NavIcons.menu      },
  { id: 'reels',     label: 'Reels & Videos',    icon: NavIcons.reels     },
  { id: 'tables',    label: 'Floor Plan',        icon: NavIcons.tables    },
  { id: 'customers', label: 'Customers',         icon: NavIcons.customers },
  { id: 'settings',  label: 'Settings',          icon: NavIcons.settings  },
];

const TAB_TITLES = {
  overview:  'Dashboard Overview',
  bookings:  'Table Reservations',
  turf:      'Turf Court Management',
  events:    'Events Management',
  menu:      'Menu & Trending Motion Loops',
  reels:     'Instagram Reels & Video Clips',
  tables:    'Tables & Floor Plan',
  customers: 'Customer Directory',
  settings:  'System Settings',
};

/* ─── Sidebar component ───────────────────────────────────────────────────── */
function Sidebar({ activeTab, setActiveTab, onClose, handleLogout }) {
  return (
    <div className="glass-sidebar w-64 h-full flex flex-col justify-between p-5">
      <div>
        {/* Logo */}
        <div className="mb-8">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5 mb-3 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.24)' }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.2">
                <rect x="3" y="3" width="18" height="18" rx="4"/>
                <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
                <path d="M13 13l4 4"/>
              </svg>
            </div>
            <span className="font-sans font-bold text-[14px] tracking-[0.06em] text-[#1a1a2e] group-hover:text-violet-700 transition-colors leading-tight">
              R SPORTS &amp; CAFE
            </span>
          </Link>
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.18em] uppercase"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.24)', color: '#5b21b6' }}>
            Admin Dashboard
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose?.(); }}
              className={`nav-pill ${activeTab === item.id ? 'nav-pill-active' : ''}`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom status row */}
      <div className="pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-[11px] font-medium text-[#6b7280]">Live API</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] font-semibold text-red-400 hover:text-red-600 uppercase tracking-wider transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Dashboard
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer

  /* ── All original state preserved exactly ─────────────────────────────── */
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tablesData, setTablesData] = useState({ areas: [], tables: [] });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState(BLANK_EVENT_FORM);
  const [eventFormError, setEventFormError] = useState('');
  const [eventSaving, setEventSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [photoUploadId, setPhotoUploadId] = useState(null);
  const photoInputRef = useRef(null);

  /* ── Menu Items State ────────────────────────────────────────────────── */
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState(BLANK_MENU_FORM);
  const [menuFormError, setMenuFormError] = useState('');
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuDeleteConfirm, setMenuDeleteConfirm] = useState(null);
  const [menuPhotoUploadId, setMenuPhotoUploadId] = useState(null);
  const [menuVideoUploadId, setMenuVideoUploadId] = useState(null);
  const menuPhotoInputRef = useRef(null);
  const menuVideoInputRef = useRef(null);

  /* ── Reels State ─────────────────────────────────────────────────────── */
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [showReelModal, setShowReelModal] = useState(false);
  const [editingReel, setEditingReel] = useState(null);
  const [reelForm, setReelForm] = useState(BLANK_REEL_FORM);
  const [reelFormError, setReelFormError] = useState('');
  const [reelSaving, setReelSaving] = useState(false);
  const [reelDeleteConfirm, setReelDeleteConfirm] = useState(null);
  const [reelVideoUploadId, setReelVideoUploadId] = useState(null);
  const reelVideoInputRef = useRef(null);

  /* ── Manual Table Booking State ─────────────────────────────────────── */
  const [selectedTableForBooking, setSelectedTableForBooking] = useState(null);
  const [bookingForm, setBookingForm] = useState({ date: new Date().toISOString().split('T')[0], time: '19:00', name: '', phone: '', guests: 2 });
  const [bookingFormError, setBookingFormError] = useState('');
  const [bookingSaving, setBookingSaving] = useState(false);

  /* ── All original logic preserved exactly ─────────────────────────────── */
  const getHeaders = () => {
    const token = localStorage.getItem('adminToken') || 'admin-session-token';
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || 'admin-session-token';
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, tablesRes, customersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/overview`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/admin/bookings?status=${statusFilter}&search=${search}`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/admin/tables`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/admin/customers`, { headers: getHeaders() }),
      ]);
      if (statsRes.ok)    { const d = await statsRes.json();    if (d.success) setStats(d.data); }
      if (bookingsRes.ok) { const d = await bookingsRes.json(); if (d.success) setBookings(d.data); }
      if (tablesRes.ok)   { const d = await tablesRes.json();   if (d.success) setTablesData(d.data); }
      if (customersRes.ok){ const d = await customersRes.json();if (d.success) setCustomers(d.data); }
    } catch (err) { console.error('Failed to load dashboard data:', err); }
    finally { setLoading(false); }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events`, { headers: getHeaders() });
      const d = await res.json();
      if (d.success) setEvents(d.data);
    } catch (err) { console.error('Failed to load events:', err); }
    finally { setEventsLoading(false); }
  };

  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/menu`, { headers: getHeaders() });
      const d = await res.json();
      if (d.success) setMenuItems(d.data);
    } catch (err) { console.error('Failed to load menu items:', err); }
    finally { setMenuLoading(false); }
  };

  const fetchReels = async () => {
    setReelsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reels`, { headers: getHeaders() });
      const d = await res.json();
      if (d.success) setReels(d.data);
    } catch (err) { console.error('Failed to load reels:', err); }
    finally { setReelsLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, [activeTab, statusFilter]);
  useEffect(() => { if (activeTab === 'events') fetchEvents(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'menu') fetchMenuItems(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'reels') fetchReels(); }, [activeTab]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) fetchDashboardData();
    } catch (err) { console.error('Failed to update status:', err); }
    finally { setUpdatingId(null); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  const openCreateModal = () => {
    setEditingEvent(null); setEventForm(BLANK_EVENT_FORM); setEventFormError(''); setShowEventModal(true);
  };
  const openEditModal = (ev) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title || '', description: ev.description || '', category: ev.category || 'special',
      sportType: ev.sportType || '', date: ev.date || '', time: ev.time || '',
      recurrenceDay: ev.recurrenceDay || '',
      cta_label: ev.cta_label || 'Book Now', cta_link: ev.cta_link || '#booking',
      status: ev.status || 'upcoming',
      is_featured: ev.is_featured || false, is_trending: ev.is_trending || false,
      trending_score: ev.trending_score || 0, display_order: ev.display_order || 0,
      price: ev.price ?? '', capacity: ev.capacity ?? '', spotsLeft: ev.spotsLeft ?? '',
      tags: Array.isArray(ev.tags) ? ev.tags.join(', ') : '',
    });
    setEventFormError(''); setShowEventModal(true);
  };
  const handleEventFormChange = (field, value) => setEventForm(prev => ({ ...prev, [field]: value }));

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date) { setEventFormError('Title and date are required.'); return; }
    setEventSaving(true); setEventFormError('');
    try {
      const url = editingEvent ? `${API_BASE_URL}/admin/events/${editingEvent._id}` : `${API_BASE_URL}/admin/events`;
      const method = editingEvent ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(eventForm) });
      const d = await res.json();
      if (d.success) { setShowEventModal(false); fetchEvents(); }
      else setEventFormError(d.error?.message || 'Failed to save event.');
    } catch { setEventFormError('Network error. Please try again.'); }
    finally { setEventSaving(false); }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/${id}`, { method: 'DELETE', headers: getHeaders() });
      const d = await res.json();
      if (d.success) { setDeleteConfirm(null); fetchEvents(); }
    } catch (err) { console.error('Failed to delete event:', err); }
  };

  const handlePhotoUpload = async (eventId, file) => {
    if (!file) return;
    setPhotoUploadId(eventId);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/events/${eventId}/photo`, {
        method: 'POST', headers: getAuthHeaders(), body: formData,
      });
      const d = await res.json();
      if (d.success) fetchEvents();
    } catch (err) { console.error('Photo upload failed:', err); }
    finally { setPhotoUploadId(null); }
  };

  /* ── Menu Handlers ─────────────────────────────────────────────────── */
  const openCreateMenuModal = () => {
    setEditingMenuItem(null);
    setMenuForm(BLANK_MENU_FORM);
    setMenuFormError('');
    setShowMenuModal(true);
  };

  const openEditMenuModal = (item) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name || '',
      category: item.category || 'SIGNATURE BURGER',
      desc: item.desc || '',
      price: item.price || '',
      photo: item.photo || '',
      video_loop_url: item.video_loop_url || '',
      is_trending: Boolean(item.is_trending),
      trending_score: item.trending_score || 0,
      accent: item.accent || '#C8956C',
      status: item.status || 'active',
      display_order: item.display_order || 0,
    });
    setMenuFormError('');
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = async () => {
    if (!menuForm.name || !menuForm.price) {
      setMenuFormError('Name and price are required.');
      return;
    }
    setMenuSaving(true);
    setMenuFormError('');
    try {
      const url = editingMenuItem
        ? `${API_BASE_URL}/admin/menu/${editingMenuItem._id}`
        : `${API_BASE_URL}/admin/menu`;
      const method = editingMenuItem ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(menuForm) });
      const d = await res.json();
      if (d.success) {
        setShowMenuModal(false);
        fetchMenuItems();
      } else setMenuFormError(d.error?.message || 'Failed to save menu item.');
    } catch {
      setMenuFormError('Network error. Please try again.');
    } finally {
      setMenuSaving(false);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/menu/${id}`, { method: 'DELETE', headers: getHeaders() });
      const d = await res.json();
      if (d.success) {
        setMenuDeleteConfirm(null);
        fetchMenuItems();
      }
    } catch (err) {
      console.error('Failed to delete menu item:', err);
    }
  };

  const handleMenuPhotoUpload = async (itemId, file) => {
    if (!file) return;
    setMenuPhotoUploadId(itemId);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/menu/${itemId}/photo`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const d = await res.json();
      if (d.success) fetchMenuItems();
    } catch (err) {
      console.error('Menu photo upload failed:', err);
    } finally {
      setMenuPhotoUploadId(null);
    }
  };

  const handleMenuVideoUpload = async (itemId, file) => {
    if (!file) return;
    setMenuVideoUploadId(itemId);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/menu/${itemId}/video`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const d = await res.json();
      if (d.success) fetchMenuItems();
    } catch (err) {
      console.error('Menu video upload failed:', err);
    } finally {
      setMenuVideoUploadId(null);
    }
  };

  /* ── Reel Handlers ─────────────────────────────────────────────────── */
  const openCreateReelModal = () => {
    setEditingReel(null);
    setReelForm(BLANK_REEL_FORM);
    setReelFormError('');
    setShowReelModal(true);
  };

  const openEditReelModal = (item) => {
    setEditingReel(item);
    setReelForm({
      caption: item.caption || '',
      handle: item.handle || '@rsports.cafe',
      videoUrl: item.videoUrl || item.src || '',
      tag: item.tag || 'HIGHLIGHTS',
      likes: item.likes || '1.2K',
      comments: item.comments || '45',
      status: item.status || 'active',
      display_order: item.display_order || 0,
    });
    setReelFormError('');
    setShowReelModal(true);
  };

  const handleSaveReel = async () => {
    if (!reelForm.caption || !reelForm.videoUrl) {
      setReelFormError('Caption and Video URL are required.');
      return;
    }
    setReelSaving(true);
    setReelFormError('');
    try {
      const url = editingReel
        ? `${API_BASE_URL}/admin/reels/${editingReel._id}`
        : `${API_BASE_URL}/admin/reels`;
      const method = editingReel ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(reelForm) });
      const d = await res.json();
      if (d.success) {
        setShowReelModal(false);
        fetchReels();
      } else setReelFormError(d.error?.message || 'Failed to save reel.');
    } catch {
      setReelFormError('Network error. Please try again.');
    } finally {
      setReelSaving(false);
    }
  };

  const handleDeleteReel = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reels/${id}`, { method: 'DELETE', headers: getHeaders() });
      const d = await res.json();
      if (d.success) {
        setReelDeleteConfirm(null);
        fetchReels();
      }
    } catch (err) {
      console.error('Failed to delete reel:', err);
    }
  };

  const handleReelVideoUpload = async (reelId, file) => {
    if (!file) return;
    setReelVideoUploadId(reelId);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reels/${reelId}/video`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      const d = await res.json();
      if (d.success) fetchReels();
    } catch (err) {
      console.error('Reel video upload failed:', err);
    } finally {
      setReelVideoUploadId(null);
    }
  };

  const handleManualBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingFormError('');
    setBookingSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/public/table-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          areaId: selectedTableForBooking.area._id || selectedTableForBooking.area,
          tableId: selectedTableForBooking._id
        })
      });
      const d = await res.json();
      if (!res.ok || !d.success) {
        throw new Error(d.error?.message || 'Booking failed');
      }
      setSelectedTableForBooking(null);
      fetchDashboardData();
    } catch (err) {
      setBookingFormError(err.message || 'An error occurred');
    } finally {
      setBookingSaving(false);
    }
  };

  const trendingCount = events.filter(e => e.is_trending).length;

  /* ── Stat card config ─────────────────────────────────────────────────── */
  const STAT_CARDS = [
    { label: 'Total Reservations', value: stats?.totalBookings ?? 0, sub: 'All-time bookings', numColor: '#3b82f6', accent: 'glass-card-blue' },
    { label: "Today's Bookings",   value: stats?.todayBookings ?? 0,  sub: 'Scheduled for today', numColor: '#059669', accent: 'glass-card-mint' },
    { label: 'Pending Review',     value: stats?.pendingBookings ?? 0,sub: 'Awaiting confirmation', numColor: '#b45309', accent: 'glass-card-amber' },
    { label: 'Active Areas',       value: stats?.activeAreas ?? 0,   sub: `${stats?.totalTables ?? 0} total tables`, numColor: '#6d28d9', accent: 'glass-card-lavender' },
  ];

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="admin-root flex" style={{ minHeight: '100vh' }}>
      {/* Ambient orbs */}
      <div className="admin-orb admin-orb-lavender" />
      <div className="admin-orb admin-orb-mint" />
      <div className="admin-orb admin-orb-blue" />

      {/* ─── MOBILE sidebar overlay ─────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="admin-mobile-overlay md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR — desktop: static column, mobile: drawer ──────────── */}
      {/* Desktop */}
      <div className="hidden md:flex flex-col w-64 min-h-screen" style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => {}} handleLogout={handleLogout} />
      </div>

      {/* Mobile drawer */}
      <div className={`admin-sidebar-drawer md:hidden ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onClose={() => setSidebarOpen(false)} handleLogout={handleLogout} />
      </div>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ position: 'relative', zIndex: 1 }}>

        {/* Top Header */}
        <header className="admin-header px-6 md:px-8 py-4 flex items-center justify-between gap-4">
          {/* Left: hamburger (mobile) + greeting/title */}
          <div className="flex items-center gap-3">
            <button
              className="glass-btn-icon md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              {activeTab === 'overview' ? (
                <>
                  <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#9ca3af] leading-none mb-0.5">{getGreeting()}</p>
                  <h1 className="font-sans font-bold text-[20px] text-[#1a1a2e] leading-none tracking-tight">R Sports Cafe</h1>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#9ca3af] leading-none mb-0.5">Management</p>
                  <h1 className="font-sans font-bold text-[20px] text-[#1a1a2e] leading-none tracking-tight">{TAB_TITLES[activeTab]}</h1>
                </>
              )}
            </div>
          </div>

          {/* Right: date + refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="glass-btn-secondary text-[12px] py-2 px-3.5"
              style={{ borderRadius: 10 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="px-3.5 py-2 rounded-[10px] text-[12px] font-medium text-[#1e40af]"
              style={{ background: 'rgba(219,234,254,0.70)', border: '1px solid rgba(96,165,250,0.40)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* ─── Tab content area ────────────────────────────────────────── */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">

          {/* Greeting sub-line (overview only) */}
          {activeTab === 'overview' && !loading && (
            <p className="text-[13px] text-[#6b7280] font-medium mb-6">Here's what's happening today.</p>
          )}

          {/* Loading spinner */}
          {loading && activeTab !== 'events' && (
            <div className="flex justify-center py-20">
              <div className="admin-spinner" />
            </div>
          )}

          {(!loading || activeTab === 'events') && (
            <AnimatePresence mode="wait">

              {/* ══ OVERVIEW ══ */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                  {/* Stat grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STAT_CARDS.map((s) => (
                      <div key={s.label} className={`stat-card ${s.accent}`}>
                        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#9ca3af] mb-3">{s.label}</p>
                        <p className="font-sans font-bold text-[38px] leading-none mb-2" style={{ color: s.numColor }}>{s.value}</p>
                        <p className="text-[11px] text-[#6b7280]">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent bookings */}
                  <div className="glass-card overflow-hidden p-0">
                    <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <h3 className="font-sans font-bold text-[16px] text-[#1a1a2e] tracking-tight">Recent Reservations</h3>
                      <button onClick={() => setActiveTab('bookings')} className="text-[12px] font-semibold text-violet-600 hover:text-violet-800 uppercase tracking-wider transition-colors">
                        View All →
                      </button>
                    </div>
                    <div className="overflow-x-auto px-6 pb-4">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Reference</th><th>Customer</th><th>Date &amp; Time</th>
                            <th>Guests</th><th>Area / Table</th><th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats?.recentBookings?.map((b) => (
                            <tr key={b._id}>
                              <td className="font-mono font-bold text-[13px] text-violet-600 pr-4">{b.bookingNumber}</td>
                              <td className="pr-4">
                                <div className="font-medium text-[13px] text-[#1a1a2e]">{b.customer?.name}</div>
                                <div className="text-[11px] text-[#9ca3af]">{b.customer?.phone}</div>
                              </td>
                              <td className="text-[13px] text-[#374151] pr-4">{b.bookingDate} · {b.startTime}</td>
                              <td className="text-[13px] text-[#374151] pr-4">{b.guestCount} guests</td>
                              <td className="text-[13px] text-[#374151] pr-4">{b.table?.name || 'Auto'} ({b.area?.name})</td>
                              <td>
                                <span className={`glass-badge ${getStatusBadge(b.status)}`}>{b.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ TABLE RESERVATIONS ══ */}
              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                  {/* Search + filter bar */}
                  <div className="glass-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by name, phone, or reference…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="glass-input pl-10"
                        style={{ borderRadius: 10 }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                        <button key={st} onClick={() => setStatusFilter(st)}
                          className={`filter-pill ${statusFilter === st ? 'filter-pill-active' : ''}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bookings table */}
                  <div className="glass-card overflow-hidden p-0">
                    <div className="overflow-x-auto px-6 py-5">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Reference</th><th>Customer</th><th>Date &amp; Time</th>
                            <th>Guests</th><th>Area / Table</th><th>Occasion</th><th>Status</th>
                            <th className="text-right">Update</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-10 text-[13px] text-[#9ca3af]">No reservations found.</td>
                            </tr>
                          ) : bookings.map((b) => (
                            <tr key={b._id}>
                              <td className="font-mono font-bold text-[13px] text-violet-600 pr-4">{b.bookingNumber}</td>
                              <td className="pr-4">
                                <div className="font-medium text-[13px] text-[#1a1a2e]">{b.customer?.name || b.name}</div>
                                <div className="text-[11px] text-[#9ca3af]">{b.customer?.phone || b.phone}</div>
                              </td>
                              <td className="text-[13px] text-[#374151] pr-4">{b.bookingDate} · {b.startTime}</td>
                              <td className="text-[13px] text-[#374151] pr-4">{b.guestCount}</td>
                              <td className="text-[13px] text-[#374151] pr-4">{b.table?.name || 'Auto'} ({b.area?.name})</td>
                              <td className="text-[13px] text-[#374151] capitalize pr-4">{b.occasion?.replace('_', ' ') || 'Casual'}</td>
                              <td className="pr-4">
                                <span className={`glass-badge ${getStatusBadge(b.status)}`}>{b.status}</span>
                              </td>
                              <td className="text-right">
                                <select
                                  disabled={updatingId === b._id}
                                  value={b.status}
                                  onChange={(e) => handleStatusChange(b._id, e.target.value)}
                                  className="glass-select glass-select-sm"
                                  style={{ width: 'auto', minWidth: 100 }}
                                >
                                  {['PENDING','CONFIRMED','COMPLETED','CANCELLED'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ TURF BOOKINGS ══ */}
              {activeTab === 'turf' && (
                <motion.div key="turf" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Pitch A — Main Arena',  sport: 'Football / Cricket',  slots: '18 slots available today' },
                      { name: 'Pitch B — Multi-Sport', sport: '5-a-Side Football',   slots: '14 slots available today' },
                      { name: 'Badminton Court 1',     sport: 'Badminton',           slots: '20 slots available today' },
                    ].map((court, i) => (
                      <div key={i} className="glass-card glass-card-mint p-6 hover-lift">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#6b7280]">{court.sport}</span>
                          <span className="glass-badge badge-active">Active</span>
                        </div>
                        <h3 className="font-sans font-bold text-[18px] text-[#1a1a2e] mb-2 tracking-tight">{court.name}</h3>
                        <p className="text-[12px] text-[#6b7280]">{court.slots}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ══ EVENTS ══ */}
              {activeTab === 'events' && (
                <motion.div key="events" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                  {/* Trending warning */}
                  {trendingCount > 5 && (
                    <div className="admin-alert-amber flex items-center gap-3 px-5 py-3.5">
                      <span className="text-[18px]">⚠️</span>
                      <span className="text-[13px] font-medium">
                        <strong>{trendingCount} events</strong> are marked trending — consider reducing to 5 or fewer for best public page results.
                      </span>
                    </div>
                  )}

                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-[#6b7280]">
                      {events.length} event{events.length !== 1 ? 's' : ''}&nbsp;·&nbsp;
                      <span className="text-orange-600 font-medium">{trendingCount} trending</span>&nbsp;·&nbsp;
                      <span className="text-emerald-600 font-medium">{events.filter(e => e.is_featured).length} featured</span>
                    </p>
                    <button id="create-event-btn" onClick={openCreateModal} className="glass-btn-primary">
                      <span className="text-[16px] leading-none">+</span> New Event
                    </button>
                  </div>

                  {/* Warning past 5–6 trending events */}
                  {trendingCount >= 6 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 text-[12px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px]">⚠️</span>
                        <span>
                          <strong>High Trending Count:</strong> You have <strong>{trendingCount} trending events</strong>.
                          Keeping 5–6 max is recommended to prevent crowding the Trending shelf on the public Events page.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Events list */}
                  {eventsLoading ? (
                    <div className="flex justify-center py-20"><div className="admin-spinner"/></div>
                  ) : events.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                      <div className="text-[48px] mb-4">🎉</div>
                      <p className="text-[15px] text-[#6b7280]">No events yet. Create your first event.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((ev) => (
                        <motion.div
                          key={ev._id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card hover-lift p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                          {/* Photo thumbnail */}
                          <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.85)' }}>
                            {ev.photo ? (
                              <img src={`http://localhost:5000${ev.photo}`} alt={ev.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[22px]">📷</span>
                            )}
                            {photoUploadId === ev._id && (
                              <div className="absolute inset-0 flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.75)' }}>
                                <div className="admin-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span
                                className="text-[10px] font-bold tracking-[0.12em] uppercase px-2 py-0.5 rounded-md border"
                                style={{
                                  background: (CAT_COLORS[ev.category] || CAT_COLORS.special).bg,
                                  color: (CAT_COLORS[ev.category] || CAT_COLORS.special).color,
                                  borderColor: (CAT_COLORS[ev.category] || CAT_COLORS.special).border,
                                }}
                              >{ev.category}</span>
                              {ev.sportType && <span className="text-[10px] text-[#6b7280] font-medium">{ev.sportType}</span>}
                              {ev.is_featured && <span className="glass-badge badge-featured">⭐ Featured</span>}
                              {ev.is_trending && <span className="glass-badge badge-trending">🔥 Trending</span>}
                              {ev.status === 'draft' && <span className="glass-badge badge-draft">Draft</span>}
                              {ev.recurrenceDay && <span className="text-[9px] text-emerald-600 font-medium">🔄 {ev.recurrenceDay}s</span>}
                            </div>
                            <h3 className="font-sans font-bold text-[15px] text-[#1a1a2e] truncate">{ev.title}</h3>
                            <p className="text-[11px] text-[#6b7280] mt-0.5">
                              {ev.date}{ev.time ? ` · ${ev.time}` : ''}
                              {ev.price != null && ev.price !== '' ? ` · ₹${ev.price}` : ''}
                              {ev.description ? ` — ${ev.description.slice(0, 70)}${ev.description.length > 70 ? '…' : ''}` : ''}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                            {/* Photo upload */}
                            <button
                              onClick={() => { setPhotoUploadId(ev._id); photoInputRef.current.dataset.evid = ev._id; photoInputRef.current.click(); }}
                              className="glass-btn-secondary py-1.5 px-3 text-[11px] rounded-[9px]"
                            >
                              📷 Photo
                            </button>
                            {/* Trending toggle */}
                            <button
                              onClick={async () => {
                                await fetch(`${API_BASE_URL}/admin/events/${ev._id}`, {
                                  method: 'PUT', headers: getHeaders(), body: JSON.stringify({ is_trending: !ev.is_trending }),
                                });
                                fetchEvents();
                              }}
                              className="py-1.5 px-3 text-[11px] font-semibold rounded-[9px] border transition-all"
                              style={ev.is_trending
                                ? { background: 'rgba(255,237,213,0.70)', color: '#c2410c', borderColor: 'rgba(251,146,60,0.42)' }
                                : { background: 'rgba(255,255,255,0.55)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.82)' }}
                            >
                              🔥 {ev.is_trending ? 'Trending' : 'Trend'}
                            </button>
                            {/* Featured toggle */}
                            <button
                              onClick={async () => {
                                await fetch(`${API_BASE_URL}/admin/events/${ev._id}`, {
                                  method: 'PUT', headers: getHeaders(), body: JSON.stringify({ is_featured: !ev.is_featured }),
                                });
                                fetchEvents();
                              }}
                              className="py-1.5 px-3 text-[11px] font-semibold rounded-[9px] border transition-all"
                              style={ev.is_featured
                                ? { background: 'rgba(209,250,229,0.70)', color: '#065f46', borderColor: 'rgba(52,211,153,0.42)' }
                                : { background: 'rgba(255,255,255,0.55)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.82)' }}
                            >
                              ⭐ {ev.is_featured ? 'Featured' : 'Feature'}
                            </button>
                            {/* Edit */}
                            <button onClick={() => openEditModal(ev)} className="glass-btn-primary py-1.5 px-3 text-[11px] rounded-[9px]">
                              ✏️ Edit
                            </button>
                            {/* Delete */}
                            <button onClick={() => setDeleteConfirm(ev)} className="glass-btn-danger py-1.5 px-3 text-[11px] rounded-[9px]">
                              🗑️
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Hidden photo input */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const evId = e.target.dataset.evid;
                      if (file && evId) handlePhotoUpload(evId, file);
                      e.target.value = '';
                    }}
                  />
                </motion.div>
              )}

              {/* ══ MENU ITEMS & TRENDING MOTION LOOPS ══ */}
              {activeTab === 'menu' && (
                <motion.div key="menu" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-[#6b7280]">
                      {menuItems.length} dish{menuItems.length !== 1 ? 'es' : ''}&nbsp;·&nbsp;
                      <span className="text-orange-600 font-medium">{menuItems.filter(m => m.is_trending).length} trending</span>&nbsp;·&nbsp;
                      <span className="text-purple-600 font-medium">{menuItems.filter(m => m.video_loop_url).length} with video loops</span>
                    </p>
                    <button id="create-menu-btn" onClick={openCreateMenuModal} className="glass-btn-primary">
                      <span className="text-[16px] leading-none">+</span> New Menu Item
                    </button>
                  </div>

                  {/* Menu items list */}
                  {menuLoading ? (
                    <div className="flex justify-center py-20"><div className="admin-spinner"/></div>
                  ) : menuItems.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                      <div className="text-[48px] mb-4">🍽️</div>
                      <p className="text-[15px] text-[#6b7280]">No menu items yet. Click "+ New Menu Item" to add your first dish.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {menuItems.map((item) => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card hover-lift p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                          {/* Media Thumbnail (Video Loop or Static Photo) */}
                          <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-black/30 border border-white/20">
                            {item.video_loop_url && item.is_trending ? (
                              <video
                                src={item.video_loop_url.startsWith('http') ? item.video_loop_url : `http://localhost:5000${item.video_loop_url}`}
                                poster={item.photo ? (item.photo.startsWith('http') ? item.photo : `http://localhost:5000${item.photo}`) : undefined}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : item.photo ? (
                              <img
                                src={item.photo.startsWith('http') ? item.photo : `http://localhost:5000${item.photo}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[24px]">🍽️</span>
                            )}

                            {item.video_loop_url && (
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-orange-400 uppercase">
                                🎬 Loop
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-0.5 rounded-md border"
                                style={{ background: `${item.accent}20`, color: item.accent, borderColor: `${item.accent}40` }}>
                                {item.category}
                              </span>
                              <span className="font-bold text-[14px] text-emerald-600">{item.price}</span>
                              {item.is_trending && <span className="glass-badge badge-trending">🔥 Trending</span>}
                              {item.video_loop_url && <span className="glass-badge badge-featured">🎥 Video Loop</span>}
                            </div>
                            <h3 className="font-sans font-bold text-[16px] text-[#1a1a2e] truncate">{item.name}</h3>
                            <p className="text-[12px] text-[#6b7280] mt-0.5 line-clamp-1">
                              {item.desc || 'No description provided.'}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                            {/* Photo upload */}
                            <button
                              onClick={() => {
                                setMenuPhotoUploadId(item._id);
                                if (menuPhotoInputRef.current) {
                                  menuPhotoInputRef.current.dataset.itemid = item._id;
                                  menuPhotoInputRef.current.click();
                                }
                              }}
                              className="glass-btn-secondary py-1.5 px-3 text-[11px] rounded-[9px]"
                            >
                              📷 Photo
                            </button>

                            {/* Video Loop upload */}
                            <button
                              onClick={() => {
                                setMenuVideoUploadId(item._id);
                                if (menuVideoInputRef.current) {
                                  menuVideoInputRef.current.dataset.itemid = item._id;
                                  menuVideoInputRef.current.click();
                                }
                              }}
                              className="py-1.5 px-3 text-[11px] font-semibold rounded-[9px] border transition-all"
                              style={{ background: 'rgba(238,242,255,0.85)', color: '#4f46e5', borderColor: 'rgba(199,210,254,0.6)' }}
                              title="Trending loop video — optional, 2-4 sec, under 2MB"
                            >
                              🎥 Video Loop
                            </button>

                            {/* Trending toggle */}
                            <button
                              onClick={async () => {
                                await fetch(`${API_BASE_URL}/admin/menu/${item._id}`, {
                                  method: 'PUT',
                                  headers: getHeaders(),
                                  body: JSON.stringify({ is_trending: !item.is_trending }),
                                });
                                fetchMenuItems();
                              }}
                              className="py-1.5 px-3 text-[11px] font-semibold rounded-[9px] border transition-all"
                              style={item.is_trending
                                ? { background: 'rgba(255,237,213,0.70)', color: '#c2410c', borderColor: 'rgba(251,146,60,0.42)' }
                                : { background: 'rgba(255,255,255,0.55)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.82)' }}
                            >
                              🔥 {item.is_trending ? 'Trending' : 'Trend'}
                            </button>

                            {/* Edit */}
                            <button onClick={() => openEditMenuModal(item)} className="glass-btn-primary py-1.5 px-3 text-[11px] rounded-[9px]">
                              ✏️ Edit
                            </button>

                            {/* Delete */}
                            <button onClick={() => setMenuDeleteConfirm(item)} className="glass-btn-danger py-1.5 px-3 text-[11px] rounded-[9px]">
                              🗑️
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Hidden Photo & Video Inputs */}
                  <input
                    ref={menuPhotoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const itemId = e.target.dataset.itemid;
                      if (file && itemId) handleMenuPhotoUpload(itemId, file);
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={menuVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const itemId = e.target.dataset.itemid;
                      if (file && itemId) handleMenuVideoUpload(itemId, file);
                      e.target.value = '';
                    }}
                  />
                </motion.div>
              )}

              {/* ══ REELS & VIDEO CLIPS ══ */}
              {activeTab === 'reels' && (
                <motion.div key="reels" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-[#6b7280]">
                      {reels.length} reel{reels.length !== 1 ? 's' : ''}&nbsp;·&nbsp;
                      <span className="text-emerald-600 font-medium">{reels.filter(r => r.status === 'active').length} active on site</span>
                    </p>
                    <button id="create-reel-btn" onClick={openCreateReelModal} className="glass-btn-primary">
                      <span className="text-[16px] leading-none">+</span> Add New Reel
                    </button>
                  </div>

                  {/* Reels list */}
                  {reelsLoading ? (
                    <div className="flex justify-center py-20"><div className="admin-spinner"/></div>
                  ) : reels.length === 0 ? (
                    <div className="glass-card p-16 text-center">
                      <div className="text-[48px] mb-4">🎬</div>
                      <p className="text-[15px] text-[#6b7280]">No reels added yet. Click "+ Add New Reel" to upload your first clip.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reels.map((reel) => (
                        <motion.div
                          key={reel._id || reel.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-card hover-lift p-4 flex gap-4 items-center"
                        >
                          {/* Video Thumbnail (Muted Autoplay) */}
                          <div className="relative w-24 h-36 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/20">
                            <video
                              src={reel.videoUrl.startsWith('http') || reel.videoUrl.startsWith('/src') ? reel.videoUrl : `http://localhost:5000${reel.videoUrl}`}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1">
                              <span className="px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-bold text-[#D4AF37] uppercase">
                                {reel.tag}
                              </span>
                            </div>
                          </div>

                          {/* Reel Info & Actions */}
                          <div className="flex-1 flex flex-col justify-between h-36">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[11px] font-bold text-[#D4AF37]">{reel.handle}</span>
                                <span className={`glass-badge ${reel.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                                  {reel.status}
                                </span>
                              </div>
                              <h4 className="font-sans font-bold text-[14px] text-[#1a1a2e] line-clamp-2 leading-tight mb-2">
                                {reel.caption}
                              </h4>
                              <p className="text-[11px] text-[#6b7280]">
                                ❤️ {reel.likes} likes &nbsp;·&nbsp; 💬 {reel.comments} comments
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-black/5">
                              {/* Upload Video Button */}
                              <button
                                onClick={() => {
                                  setReelVideoUploadId(reel._id);
                                  if (reelVideoInputRef.current) {
                                    reelVideoInputRef.current.dataset.reelid = reel._id;
                                    reelVideoInputRef.current.click();
                                  }
                                }}
                                className="py-1 px-2.5 text-[10px] font-bold rounded-lg border bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                              >
                                🎥 Video
                              </button>

                              {/* Edit Button */}
                              <button onClick={() => openEditReelModal(reel)} className="glass-btn-primary py-1 px-2.5 text-[10px] rounded-lg">
                                ✏️ Edit
                              </button>

                              {/* Delete Button */}
                              <button onClick={() => setReelDeleteConfirm(reel)} className="glass-btn-danger py-1 px-2.5 text-[10px] rounded-lg">
                                🗑️
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Hidden Reel Video File Input */}
                  <input
                    ref={reelVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const reelId = e.target.dataset.reelid;
                      if (file && reelId) handleReelVideoUpload(reelId, file);
                      e.target.value = '';
                    }}
                  />
                </motion.div>
              )}

              {/* ══ FLOOR PLAN ══ */}
              {activeTab === 'tables' && (
                <motion.div key="tables" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                  {tablesData.areas?.map((area) => (
                    <div key={area._id} className="glass-card p-6 space-y-5">
                      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                        <div>
                          <h3 className="font-sans font-bold text-[18px] text-[#1a1a2e] tracking-tight">{area.name}</h3>
                          <p className="text-[12px] text-[#6b7280] mt-0.5">{area.description}</p>
                        </div>
                        <span className="glass-badge badge-active">Active Area</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {tablesData.tables
                          ?.filter((t) => t.area?._id === area._id || t.area === area._id)
                          .map((tbl) => {
                            const activeBooking = bookings.find(b => 
                              (b.table?._id === tbl._id || b.table === tbl._id) && 
                              ['CONFIRMED', 'SEATED', 'ARRIVED'].includes(b.status)
                            );
                            
                            return (
                              <div key={tbl._id}
                                onClick={() => {
                                  if (activeBooking) return;
                                  setSelectedTableForBooking({ ...tbl, area: area });
                                  setBookingForm(prev => ({ ...prev, guests: tbl.capacity }));
                                }}
                                className={`p-4 rounded-2xl text-center transition-transform ${activeBooking ? 'opacity-90' : 'hover-lift cursor-pointer'}`}
                                style={activeBooking 
                                  ? { background: 'rgba(254,226,226,0.60)', border: '1px solid rgba(252,165,165,0.85)' }
                                  : { background: 'rgba(255,255,255,0.60)', border: '1px solid rgba(255,255,255,0.85)' }
                                }>
                                <div className="font-sans font-bold text-[16px] text-[#1a1a2e] uppercase mb-1">{tbl.name}</div>
                                <div className="text-[11px] text-[#6b7280] mb-2">
                                  {activeBooking ? `Booked by ${activeBooking.customer?.name || 'Guest'}` : `Seats ${tbl.capacity}`}
                                </div>
                                <span className={`glass-badge ${activeBooking ? 'badge-cancelled text-red-600' : 'table-chip-bookable'}`}>
                                  {activeBooking ? 'Unavailable' : 'Book Table'}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ══ CUSTOMERS ══ */}
              {activeTab === 'customers' && (
                <motion.div key="customers" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <div className="glass-card overflow-hidden p-0">
                    <div className="overflow-x-auto px-6 py-5">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Customer Name</th><th>Phone</th><th>Email</th>
                            <th>Total Reservations</th><th className="text-right">Tier</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-10 text-[13px] text-[#9ca3af]">No customers yet.</td></tr>
                          ) : customers.map((c) => (
                            <tr key={c._id}>
                              <td className="font-medium text-[13px] text-[#1a1a2e]">{c.name}</td>
                              <td className="text-[13px] text-[#374151]">{c.phone}</td>
                              <td className="text-[13px] text-[#6b7280]">{c.email || 'N/A'}</td>
                              <td className="text-[13px] font-semibold text-[#1a1a2e]">{c.totalBookings || 1} bookings</td>
                              <td className="text-right">
                                <span className="glass-badge badge-vip">VIP Member</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ══ SETTINGS ══ */}
              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5 max-w-2xl">
                  <div className="glass-card p-6 space-y-0">
                    <h3 className="font-sans font-bold text-[16px] text-[#1a1a2e] mb-4">System Diagnostics</h3>
                    {[
                      { label: 'Backend REST API',     value: 'http://localhost:5000/api', color: '#059669' },
                      { label: 'Database System',      value: 'MongoDB Connected',         color: '#059669' },
                      { label: 'Dining Duration',      value: '90 Minutes',                color: '#1a1a2e' },
                      { label: 'Booking Intervals',    value: '30-Minute Slots',           color: '#1a1a2e' },
                    ].map((row, i, arr) => (
                      <div key={row.label} className="flex items-center justify-between py-3.5"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                        <span className="text-[13px] text-[#6b7280]">{row.label}</span>
                        <span className="text-[13px] font-semibold" style={{ color: row.color }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card p-6 space-y-0">
                    <h3 className="font-sans font-bold text-[16px] text-[#1a1a2e] mb-4">Operating Rules</h3>
                    {[
                      { label: 'Online Booking',      value: 'Active' },
                      { label: 'Auto Confirmation',   value: 'Manual review' },
                      { label: 'Capacity Buffer',     value: '10% reserved' },
                    ].map((row, i, arr) => (
                      <div key={row.label} className="flex items-center justify-between py-3.5"
                        style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                        <span className="text-[13px] text-[#6b7280]">{row.label}</span>
                        <span className="glass-badge badge-active">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ─── EVENT CREATE / EDIT MODAL ───────────────────────────────────── */}
      <AnimatePresence>
        {showEventModal && (
          <>
            <motion.div
              key="event-modal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-modal-backdrop"
              onClick={() => setShowEventModal(false)}
            />
            <motion.div
              key="event-modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-modal w-full max-w-2xl p-7 md:p-9 max-h-[90vh] overflow-y-auto">
                {/* Modal header */}
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h2 className="font-sans font-bold text-[22px] text-[#1a1a2e] tracking-tight">
                      {editingEvent ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <p className="text-[12px] text-[#9ca3af] mt-1">
                      {editingEvent ? `Editing: ${editingEvent.title}` : 'Event will appear live on the public Events page.'}
                    </p>
                  </div>
                  <button onClick={() => setShowEventModal(false)} className="glass-btn-icon flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Event Title *</label>
                    <input type="text" value={eventForm.title}
                      onChange={(e) => handleEventFormChange('title', e.target.value)}
                      placeholder="e.g. Saturday Night Football"
                      className="glass-input" />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Description</label>
                    <textarea rows={3} value={eventForm.description}
                      onChange={(e) => handleEventFormChange('description', e.target.value)}
                      placeholder="Short description shown on event cards…"
                      className="glass-input" style={{ resize: 'none', lineHeight: '1.6' }} />
                  </div>

                  {/* Category + Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Category</label>
                      <select value={eventForm.category} onChange={(e) => handleEventFormChange('category', e.target.value)} className="glass-select">
                        <option value="weekly">⚽ Weekly (Recurring)</option>
                        <option value="tournament">🏆 Tournament</option>
                        <option value="special">🎯 Special (One-off)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Status</label>
                      <select value={eventForm.status} onChange={(e) => handleEventFormChange('status', e.target.value)} className="glass-select">
                        <option value="upcoming">Upcoming (Public)</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="draft">Draft (Hidden)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sport Type */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Sport Type</label>
                    <input type="text" value={eventForm.sportType}
                      onChange={(e) => handleEventFormChange('sportType', e.target.value)}
                      placeholder="e.g. Football Turf, Cricket Box, Cafe Quiz Night"
                      className="glass-input" />
                  </div>

                  {/* Recurrence Day (weekly only) */}
                  {eventForm.category === 'weekly' && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Recurrence Day <span className="text-[#9ca3af] font-normal normal-case">(auto-computes next date)</span>
                      </label>
                      <select value={eventForm.recurrenceDay} onChange={(e) => handleEventFormChange('recurrenceDay', e.target.value)} className="glass-select">
                        <option value="">Select day…</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                  )}

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Date * {eventForm.category === 'weekly' && eventForm.recurrenceDay && <span className="text-emerald-600 font-normal normal-case">(auto-updated for weekly)</span>}
                      </label>
                      <input type="date" value={eventForm.date} onChange={(e) => handleEventFormChange('date', e.target.value)} className="glass-input" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Time</label>
                      <input type="text" value={eventForm.time} onChange={(e) => handleEventFormChange('time', e.target.value)} placeholder="e.g. 7:00 PM" className="glass-input" />
                    </div>
                  </div>

                  {/* Price + Capacity + Spots Left */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Price (₹)</label>
                      <input type="number" min="0" value={eventForm.price}
                        onChange={(e) => handleEventFormChange('price', e.target.value)}
                        placeholder="1500" className="glass-input" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Capacity</label>
                      <input type="number" min="0" value={eventForm.capacity}
                        onChange={(e) => handleEventFormChange('capacity', e.target.value)}
                        placeholder="20" className="glass-input" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Spots Left</label>
                      <input type="number" min="0" value={eventForm.spotsLeft}
                        onChange={(e) => handleEventFormChange('spotsLeft', e.target.value)}
                        placeholder="12" className="glass-input" />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                      Tags <span className="text-[#9ca3af] font-normal normal-case">(comma-separated: Trending, Filling Fast, New)</span>
                    </label>
                    <input type="text" value={eventForm.tags}
                      onChange={(e) => handleEventFormChange('tags', e.target.value)}
                      placeholder="Trending, Filling Fast, New"
                      className="glass-input" />
                  </div>

                  {/* CTA */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">CTA Label</label>
                      <input type="text" value={eventForm.cta_label} onChange={(e) => handleEventFormChange('cta_label', e.target.value)} placeholder="Book Now" className="glass-input" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">CTA Link</label>
                      <input type="text" value={eventForm.cta_link} onChange={(e) => handleEventFormChange('cta_link', e.target.value)} placeholder="#booking" className="glass-input" />
                    </div>
                  </div>

                  {/* Toggle: Featured */}
                  <div className="flex flex-wrap gap-3">
                    <button type="button"
                      onClick={() => handleEventFormChange('is_featured', !eventForm.is_featured)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[12px] font-semibold transition-all"
                      style={eventForm.is_featured
                        ? { background: 'rgba(209,250,229,0.70)', color: '#065f46', borderColor: 'rgba(52,211,153,0.42)' }
                        : { background: 'rgba(255,255,255,0.55)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.82)' }}>
                      <span>{eventForm.is_featured ? '✅' : '⭐'}</span>
                      <span>Featured (carousel pin)</span>
                    </button>

                    {/* Toggle: Trending */}
                    <button type="button"
                      onClick={() => handleEventFormChange('is_trending', !eventForm.is_trending)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[12px] font-semibold transition-all"
                      style={eventForm.is_trending
                        ? { background: 'rgba(255,237,213,0.70)', color: '#c2410c', borderColor: 'rgba(251,146,60,0.42)' }
                        : { background: 'rgba(255,255,255,0.55)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.82)' }}>
                      <span>🔥</span>
                      <span>Trending tag</span>
                    </button>
                  </div>

                  {trendingCount >= 6 && eventForm.is_trending && (!editingEvent || !editingEvent.is_trending) && (
                    <p className="text-[11px] text-amber-700 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Note: {trendingCount} events are already marked as Trending. Recommended maximum is 5–6 to prevent crowding.</span>
                    </p>
                  )}

                  {/* Trending score */}
                  {eventForm.is_trending && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Trending Score <span className="text-[#9ca3af] font-normal normal-case">(higher = shown first)</span>
                      </label>
                      <input type="number" min="0" value={eventForm.trending_score}
                        onChange={(e) => handleEventFormChange('trending_score', e.target.value)}
                        className="glass-input" style={{ width: 120 }} />
                    </div>
                  )}

                  {/* Error */}
                  {eventFormError && (
                    <div className="px-4 py-3 rounded-xl text-[13px]"
                      style={{ background: 'rgba(254,226,226,0.75)', border: '1px solid rgba(252,165,165,0.45)', color: '#991b1b' }}>
                      {eventFormError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                    <button onClick={() => setShowEventModal(false)} className="glass-btn-secondary">Cancel</button>
                    <button id="save-event-btn" onClick={handleSaveEvent} disabled={eventSaving} className="glass-btn-primary">
                      {eventSaving ? (
                        <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Saving…</>
                      ) : (editingEvent ? '✓ Save Changes' : '+ Create Event')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRM MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              key="del-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-modal-backdrop"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              key="del-modal"
              initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-modal w-full max-w-sm p-8 text-center"
                style={{ border: '1px solid rgba(252,165,165,0.45)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(254,226,226,0.70)', border: '1px solid rgba(252,165,165,0.45)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </div>
                <h3 className="font-sans font-bold text-[18px] text-[#1a1a2e] mb-2">Delete Event?</h3>
                <p className="text-[13px] text-[#6b7280] mb-6">
                  "<strong className="text-[#1a1a2e]">{deleteConfirm.title}</strong>" will be permanently removed from the public Events page.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="glass-btn-secondary flex-1 justify-center">Cancel</button>
                  <button onClick={() => handleDeleteEvent(deleteConfirm._id)} className="glass-btn-danger flex-1 justify-center">Yes, Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MENU ITEM CREATE / EDIT MODAL ─────────────────────────────────── */}
      <AnimatePresence>
        {showMenuModal && (
          <>
            <motion.div
              key="menu-modal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-modal-backdrop"
              onClick={() => setShowMenuModal(false)}
            />
            <motion.div
              key="menu-modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-modal w-full max-w-2xl p-7 md:p-9 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h2 className="font-sans font-bold text-[22px] text-[#1a1a2e] tracking-tight">
                      {editingMenuItem ? 'Edit Menu Item' : 'Create New Menu Item'}
                    </h2>
                    <p className="text-[12px] text-[#9ca3af] mt-1">
                      Configure dish details, photo, and optional 2-4s trending motion loop video.
                    </p>
                  </div>
                  <button onClick={() => setShowMenuModal(false)} className="glass-btn-icon flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. THE ROYAL SMASH"
                      value={menuForm.name}
                      onChange={(e) => setMenuForm(p => ({ ...p, name: e.target.value }))}
                      className="glass-input"
                    />
                  </div>

                  {/* Category & Price */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Category
                      </label>
                      <select
                        value={menuForm.category}
                        onChange={(e) => setMenuForm(p => ({ ...p, category: e.target.value }))}
                        className="glass-input cursor-pointer"
                      >
                        <option value="SIGNATURE BURGER">SIGNATURE BURGER</option>
                        <option value="ARTISAN PIZZA">ARTISAN PIZZA</option>
                        <option value="FRESH PRESSED JUICE">FRESH PRESSED JUICE</option>
                        <option value="SPECIALTY COFFEE">SPECIALTY COFFEE</option>
                        <option value="ROYAL MAINS">ROYAL MAINS</option>
                        <option value="ENERGY BOWL">ENERGY BOWL</option>
                        <option value="DESSERTS">DESSERTS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Price *
                      </label>
                      <input
                        type="text"
                        placeholder="₹349"
                        value={menuForm.price}
                        onChange={(e) => setMenuForm(p => ({ ...p, price: e.target.value }))}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Handcrafted double-smashed wagyu patties, aged cheddar, truffle aioli…"
                      value={menuForm.desc}
                      onChange={(e) => setMenuForm(p => ({ ...p, desc: e.target.value }))}
                      className="glass-input resize-none"
                    />
                  </div>

                  {/* Photo URL & Video Loop URL */}
                  <div className="space-y-4 pt-2 border-t border-black/10">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Static Photo (Poster Frame Fallback)
                      </label>
                      <input
                        type="text"
                        placeholder="/uploads/menu/menu-photo-123.jpg"
                        value={menuForm.photo}
                        onChange={(e) => setMenuForm(p => ({ ...p, photo: e.target.value }))}
                        className="glass-input"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Trending loop video — optional, 2-4 sec, under 2MB
                      </label>
                      <input
                        type="text"
                        placeholder="/uploads/menu/menu-video-123.mp4"
                        value={menuForm.video_loop_url}
                        onChange={(e) => setMenuForm(p => ({ ...p, video_loop_url: e.target.value }))}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  {/* Inline Muted Looping Video Preview */}
                  {menuForm.video_loop_url && (
                    <div className="p-3 rounded-2xl bg-[#09090b] border border-orange-500/30 flex items-center gap-4">
                      <video
                        src={menuForm.video_loop_url.startsWith('http') || menuForm.video_loop_url.startsWith('blob:') || menuForm.video_loop_url.startsWith('data:') ? menuForm.video_loop_url : `http://localhost:5000${menuForm.video_loop_url}`}
                        poster={menuForm.photo ? (menuForm.photo.startsWith('http') ? menuForm.photo : `http://localhost:5000${menuForm.photo}`) : undefined}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-24 h-24 rounded-xl object-cover border border-orange-500/50 flex-shrink-0"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest block mb-1">
                          🔥 Trending Video Loop Preview
                        </span>
                        <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                          This muted 2-4s video will autoplay smoothly as a background loop when this dish scrolls into view on the Menu section.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Toggles */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setMenuForm(p => ({ ...p, is_trending: !p.is_trending }))}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-[12px] font-semibold transition-all"
                      style={menuForm.is_trending
                        ? { background: 'rgba(255,237,213,0.70)', color: '#c2410c', borderColor: 'rgba(251,146,60,0.42)' }
                        : { background: 'rgba(255,255,255,0.55)', color: '#6b7280', borderColor: 'rgba(255,255,255,0.82)' }}
                    >
                      <span>🔥</span>
                      <span>Mark as Trending (Trending Motion Loop)</span>
                    </button>
                  </div>

                  {/* Form Error */}
                  {menuFormError && (
                    <div className="px-4 py-3 rounded-xl text-[13px] bg-red-100 border border-red-300 text-red-800">
                      {menuFormError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10">
                    <button onClick={() => setShowMenuModal(false)} className="glass-btn-secondary">Cancel</button>
                    <button onClick={handleSaveMenuItem} disabled={menuSaving} className="glass-btn-primary">
                      {menuSaving ? 'Saving…' : (editingMenuItem ? '✓ Save Changes' : '+ Create Dish')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MENU ITEM DELETE CONFIRM MODAL ────────────────────────────────── */}
      <AnimatePresence>
        {menuDeleteConfirm && (
          <>
            <motion.div
              key="menu-del-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-modal-backdrop"
              onClick={() => setMenuDeleteConfirm(null)}
            />
            <motion.div
              key="menu-del-modal"
              initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-modal w-full max-w-sm p-8 text-center" style={{ border: '1px solid rgba(252,165,165,0.45)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-100 border border-red-200">
                  <span className="text-[24px]">🗑️</span>
                </div>
                <h3 className="font-sans font-bold text-[18px] text-[#1a1a2e] mb-2">Delete Dish?</h3>
                <p className="text-[13px] text-[#6b7280] mb-6">
                  "<strong className="text-[#1a1a2e]">{menuDeleteConfirm.name}</strong>" will be removed from the menu.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setMenuDeleteConfirm(null)} className="glass-btn-secondary flex-1 justify-center">Cancel</button>
                  <button onClick={() => handleDeleteMenuItem(menuDeleteConfirm._id)} className="glass-btn-danger flex-1 justify-center">Yes, Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── REEL CREATE / EDIT MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {showReelModal && (
          <>
            <motion.div
              key="reel-modal-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-modal-backdrop"
              onClick={() => setShowReelModal(false)}
            />
            <motion.div
              key="reel-modal"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-modal w-full max-w-xl p-7 md:p-9 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h2 className="font-sans font-bold text-[22px] text-[#1a1a2e] tracking-tight">
                      {editingReel ? 'Edit Video Reel' : 'Add New Reel'}
                    </h2>
                    <p className="text-[12px] text-[#9ca3af] mt-1">
                      Upload vertical video clips (MP4/WebM) to feature on the website's Reels section.
                    </p>
                  </div>
                  <button onClick={() => setShowReelModal(false)} className="glass-btn-icon flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Caption */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                      Caption / Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Match day energy hits different ⚡"
                      value={reelForm.caption}
                      onChange={(e) => setReelForm(p => ({ ...p, caption: e.target.value }))}
                      className="glass-input"
                    />
                  </div>

                  {/* Tag & Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Tag / Badge
                      </label>
                      <input
                        type="text"
                        placeholder="MATCH DAY"
                        value={reelForm.tag}
                        onChange={(e) => setReelForm(p => ({ ...p, tag: e.target.value }))}
                        className="glass-input uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Instagram Handle
                      </label>
                      <input
                        type="text"
                        placeholder="@rsports.cafe"
                        value={reelForm.handle}
                        onChange={(e) => setReelForm(p => ({ ...p, handle: e.target.value }))}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  {/* Likes & Comments Counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Likes Count Display
                      </label>
                      <input
                        type="text"
                        placeholder="2.4K"
                        value={reelForm.likes}
                        onChange={(e) => setReelForm(p => ({ ...p, likes: e.target.value }))}
                        className="glass-input"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                        Comments Count Display
                      </label>
                      <input
                        type="text"
                        placeholder="186"
                        value={reelForm.comments}
                        onChange={(e) => setReelForm(p => ({ ...p, comments: e.target.value }))}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  {/* Video URL & File Upload */}
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">
                      Video File URL *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="/uploads/reels/reel-123.mp4"
                        value={reelForm.videoUrl}
                        onChange={(e) => setReelForm(p => ({ ...p, videoUrl: e.target.value }))}
                        className="glass-input flex-1"
                      />
                      <label className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#1a1a2e] text-[11px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 transition-colors flex-shrink-0">
                        🎥 Choose File
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const blobUrl = URL.createObjectURL(file);
                            setReelForm(p => ({ ...p, videoUrl: blobUrl }));
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Inline Live Video Reel Preview */}
                  {reelForm.videoUrl && (
                    <div className="p-3 rounded-2xl bg-[#09090b] border border-[#D4AF37]/40 flex items-center gap-4">
                      <video
                        src={reelForm.videoUrl.startsWith('http') || reelForm.videoUrl.startsWith('blob:') || reelForm.videoUrl.startsWith('/src') ? reelForm.videoUrl : `http://localhost:5000${reelForm.videoUrl}`}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-20 h-32 rounded-xl object-cover border border-[#D4AF37]/60 flex-shrink-0"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
                          🎬 Live Reel Video Preview
                        </span>
                        <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                          This clip will loop seamlessly in the 3D Carousel and Fullscreen viewer on the site.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Form Error */}
                  {reelFormError && (
                    <div className="px-4 py-3 rounded-xl text-[13px] bg-red-100 border border-red-300 text-red-800">
                      {reelFormError}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10">
                    <button onClick={() => setShowReelModal(false)} className="glass-btn-secondary">Cancel</button>
                    <button onClick={handleSaveReel} disabled={reelSaving} className="glass-btn-primary">
                      {reelSaving ? 'Saving…' : (editingReel ? '✓ Save Changes' : '+ Add Reel')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── REEL DELETE CONFIRM MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {reelDeleteConfirm && (
          <>
            <motion.div
              key="reel-del-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-modal-backdrop"
              onClick={() => setReelDeleteConfirm(null)}
            />
            <motion.div
              key="reel-del-modal"
              initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="glass-modal w-full max-w-sm p-8 text-center" style={{ border: '1px solid rgba(252,165,165,0.45)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-100 border border-red-200">
                  <span className="text-[24px]">🗑️</span>
                </div>
                <h3 className="font-sans font-bold text-[18px] text-[#1a1a2e] mb-2">Delete Reel?</h3>
                <p className="text-[13px] text-[#6b7280] mb-6">
                  "<strong className="text-[#1a1a2e]">{reelDeleteConfirm.caption}</strong>" will be permanently removed from the website.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setReelDeleteConfirm(null)} className="glass-btn-secondary flex-1 justify-center">Cancel</button>
                  <button onClick={() => handleDeleteReel(reelDeleteConfirm._id || reelDeleteConfirm.id)} className="glass-btn-danger flex-1 justify-center">Yes, Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* ─── MANUAL TABLE BOOKING MODAL ──────────────────────────────────── */}
        {selectedTableForBooking && (
          <>
            <motion.div
              key="booking-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-modal-backdrop"
              onClick={() => setSelectedTableForBooking(null)}
            />
            <motion.div
              key="booking-modal"
              initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
              <div className="glass-modal w-full max-w-lg p-7">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-sans font-bold text-[20px] text-[#1a1a2e]">Book {selectedTableForBooking.name}</h3>
                    <p className="text-[12px] text-[#6b7280]">Admin Manual Booking (Bypass Limits)</p>
                  </div>
                  <button onClick={() => setSelectedTableForBooking(null)} className="text-[#9ca3af] hover:text-[#1a1a2e] transition-colors p-1 rounded-md hover:bg-black/5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                {bookingFormError && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-[12px] font-medium text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {bookingFormError}
                  </div>
                )}
                <form onSubmit={handleManualBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input type="date" required min={new Date().toISOString().split('T')[0]} className="form-input" value={bookingForm.date} onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input type="time" required className="form-input" value={bookingForm.time} onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-[2fr_1fr] gap-4">
                    <div className="form-group">
                      <label className="form-label">Customer Name</label>
                      <input type="text" required placeholder="John Doe" className="form-input" value={bookingForm.name} onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Guests</label>
                      <input type="number" required min="1" max={selectedTableForBooking.capacity} className="form-input" value={bookingForm.guests} onChange={(e) => setBookingForm({...bookingForm, guests: parseInt(e.target.value) || 1})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" required placeholder="+91 9876543210" className="form-input" value={bookingForm.phone} onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})} />
                  </div>
                  
                  <div className="pt-2 flex gap-3">
                    <button type="button" onClick={() => setSelectedTableForBooking(null)} className="glass-btn-secondary flex-1 justify-center">Cancel</button>
                    <button type="submit" disabled={bookingSaving} className="glass-btn-primary flex-1 justify-center">
                      {bookingSaving ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
