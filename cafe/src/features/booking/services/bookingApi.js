import { apiClient } from '../../../services/apiClient';

/**
 * Fetch all active restaurant areas.
 */
export const getAreas = () => apiClient('/areas');

/**
 * Check table availability.
 * @param {Object} params - { date, time, guests, areaId? }
 */
export const getAvailability = ({ date, time, guests, areaId }) => {
  const query = new URLSearchParams({ date, time, guests });
  if (areaId) query.set('areaId', areaId);
  return apiClient(`/availability?${query.toString()}`);
};

/**
 * Submit a new table booking.
 * @param {Object} data - full booking payload
 */
export const submitTableBooking = (data) =>
  apiClient('/table-bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
