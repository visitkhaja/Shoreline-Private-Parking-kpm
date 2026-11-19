/**
 * ============================================================================
 * SUPABASE CLIENT CONFIGURATION
 * Shoreline Private Parking — Kayalpattinam Beach
 * ============================================================================
 * 
 * Replace the placeholders below with your Supabase Project credentials:
 * 1. Go to https://supabase.com -> Project Settings -> API
 * 2. Copy "Project URL" and paste into SUPABASE_URL
 * 3. Copy "anon public" API Key and paste into SUPABASE_ANON_KEY
 */

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase Client
let supabaseClient = null;

try {
  if (window.supabase && SUPABASE_URL && !SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized successfully for Shoreline Parking.');
  }
} catch (err) {
  console.warn('⚠️ Supabase client initialization error:', err);
}

/**
 * Saves a new parking reservation to the Supabase "bookings" table.
 * Gracefully logs if Supabase is unconfigured or offline so booking flow never breaks.
 *
 * @param {Object} bookingData - Details of the confirmed booking
 * @returns {Promise<Object>} - Status of the insert operation
 */
async function saveBookingToSupabase(bookingData) {
  if (!supabaseClient) {
    console.log('ℹ️ Supabase not yet configured with project keys. Booking handled locally.');
    return { success: false, reason: 'unconfigured' };
  }

  try {
    const { data, error } = await supabaseClient
      .from('bookings')
      .insert([
        {
          ref_code: bookingData.ref,
          full_name: bookingData.name,
          phone: bookingData.phone,
          vehicle_model: bookingData.vehicle,
          license_plate: bookingData.plate,
          parking_plan: bookingData.plan,
          spots_count: parseInt(bookingData.spots, 10) || 1,
          arrival_datetime: bookingData.arrival_iso,
          departure_datetime: bookingData.departure_iso,
          addons: bookingData.addons || 'Standard Parking Bay',
          total_cost: bookingData.total,
          payment_status: 'pending_verification',
          payment_method: 'PhonePe UPI QR'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Booking successfully stored in Supabase:', data);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Unexpected error saving to Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches recent bookings (used by admin or gate attendants).
 *
 * @param {number} limit - Maximum number of records to fetch
 * @returns {Promise<Array>} - List of bookings
 */
async function fetchBookingsFromSupabase(limit = 50) {
  if (!supabaseClient) {
    return { success: false, reason: 'unconfigured', data: [] };
  }

  try {
    const { data, error } = await supabaseClient
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Supabase fetch error:', error.message);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data };
  } catch (err) {
    console.error('❌ Error fetching from Supabase:', err);
    return { success: false, error: err.message, data: [] };
  }
}
