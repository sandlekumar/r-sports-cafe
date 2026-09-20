import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, SERVER_BASE_URL } from '../config.js';

export default function ReviewsTab({ getHeaders, getAuthHeaders }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({ name: '', order: 0, text: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm({ name: '', order: 0, text: '' });
    setSelectedFile(null);
    setError('');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!form.name || !selectedFile) {
      setError('Name and image are required.');
      return;
    }
    
    setSaving(true);
    setError('');
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('order', form.order);
    if (form.text) formData.append('text', form.text);
    formData.append('image', selectedFile);

    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeaders()['Authorization']
        },
        body: formData
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchReviews();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save review');
      }
    } catch (err) {
      setError('Network error saving review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchReviews();
      }
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#6b7280]">Loading reviews...</div>;
  }

  return (
    <motion.div key="reviews" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[#6b7280]">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </p>
        <button onClick={openCreateModal} className="glass-btn-primary">
          <span className="text-[16px] leading-none">+</span> Add Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reviews.map(review => (
          <div key={review._id} className="glass-card flex flex-col overflow-hidden relative group">
            <div className="aspect-[4/3] bg-[#f8f9fa] relative border-b border-[rgba(0,0,0,0.05)]">
              {review.imageUrl ? (
                <img src={`${SERVER_BASE_URL}${review.imageUrl}`} alt={review.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9ca3af] text-[12px]">No Image</div>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-[14px] text-[#1a1a2e]">{review.name}</h3>
                <p className="text-[11px] text-[#6b7280] mt-0.5">Order: {review.order}</p>
              </div>
              <button onClick={() => setDeleteConfirm(review)} className="text-[#9ca3af] hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[#f8f9fa] border border-[rgba(0,0,0,0.05)]">
            <span className="text-[24px]">💬</span>
          </div>
          <h3 className="font-sans font-bold text-[16px] text-[#1a1a2e] mb-1">No Reviews Yet</h3>
          <p className="text-[13px] text-[#6b7280] max-w-sm mx-auto">Upload screenshots of customer reviews to display them on the website.</p>
        </div>
      )}

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-modal-backdrop" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="glass-modal w-full max-w-md p-7 md:p-9 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h2 className="font-sans font-bold text-[22px] text-[#1a1a2e] tracking-tight">Add Customer Review</h2>
                    <p className="text-[12px] text-[#9ca3af] mt-1">Upload a screenshot and provide the reviewer's name.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="glass-btn-icon flex-shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Reviewer Name *</label>
                    <input type="text" placeholder="e.g. John Doe" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="glass-input" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Review Text / Experience</label>
                    <textarea placeholder="e.g. The biryani was amazing and the turf was top class!" value={form.text} onChange={(e) => setForm({...form, text: e.target.value})} className="glass-input resize-none h-24" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Order (Sort priority)</label>
                    <input type="number" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})} className="glass-input" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.16em] uppercase text-[#9ca3af] mb-1.5">Screenshot Image *</label>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="w-full text-[13px] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[12px] file:font-semibold file:bg-[#f8f9fa] file:text-[#1a1a2e] hover:file:bg-[#e2e8f0]" />
                  </div>

                  {error && <div className="px-4 py-3 rounded-xl text-[13px]" style={{ background: 'rgba(254,226,226,0.75)', border: '1px solid rgba(252,165,165,0.45)', color: '#991b1b' }}>{error}</div>}

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[rgba(0,0,0,0.07)]">
                    <button onClick={() => setShowModal(false)} className="glass-btn-secondary">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="glass-btn-primary">
                      {saving ? 'Saving...' : 'Upload Review'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-modal-backdrop" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="glass-modal w-full max-w-sm p-8 text-center" style={{ border: '1px solid rgba(252,165,165,0.45)' }}>
                <h3 className="font-sans font-bold text-[18px] text-[#1a1a2e] mb-2">Delete Review?</h3>
                <p className="text-[13px] text-[#6b7280] mb-6">Review by "<strong className="text-[#1a1a2e]">{deleteConfirm.name}</strong>" will be permanently removed.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="glass-btn-secondary flex-1 justify-center">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm._id)} className="glass-btn-danger flex-1 justify-center">Delete</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
