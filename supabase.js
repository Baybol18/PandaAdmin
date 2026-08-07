/* Panda Cargo — shared Supabase client */
(function (global) {
  'use strict';

  var SUPABASE_URL = 'https://qheezikpahxgsomtdiny.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_FRA0MQcPegj-1KCiwm8j7g_XOguXNXx';

  var STATUS_READY = 'Готов к выдаче';
  var STATUS_ISSUED = 'Выдано';

  function createSupabase() {
    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
      throw new Error('Supabase JS library is not loaded');
    }
    return global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function mapParcelFromDb(row) {
    if (!row) return null;
    var statusRaw = String(row.status || '');
    var status =
      statusRaw === STATUS_ISSUED || statusRaw === 'received' || statusRaw === 'Выдано'
        ? 'received'
        : 'arrived';

    return {
      id: row.id,
      track: String(row.track_number || row.track || '').toUpperCase(),
      clientCode: String(row.client_code || row.clientCode || '').replace(/\D/g, ''),
      status: status,
      statusLabel: statusRaw || (status === 'received' ? STATUS_ISSUED : STATUS_READY),
      weightKg: Number(row.weight) || 0,
      priceSom: Math.round(Number(row.price) || 0),
      createdAt: row.created_at || row.createdAt || row.updated_at || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || row.created_at || new Date().toISOString()
    };
  }

  function mapStatusToDb(status) {
    return status === 'received' ? STATUS_ISSUED : STATUS_READY;
  }

  global.PandaSupabase = {
    URL: SUPABASE_URL,
    ANON_KEY: SUPABASE_ANON_KEY,
    STATUS_READY: STATUS_READY,
    STATUS_ISSUED: STATUS_ISSUED,
    createClient: createSupabase,
    mapParcelFromDb: mapParcelFromDb,
    mapStatusToDb: mapStatusToDb
  };
})(typeof window !== 'undefined' ? window : globalThis);
