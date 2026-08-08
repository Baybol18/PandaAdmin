/* Panda Cargo — shared Supabase client */
(function (global) {
  'use strict';

  var SUPABASE_URL = 'https://qheezikpahxgsomtdiny.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_FRA0MQcPegj-1KCiwm8j7g_XOguXNXx';

  var STATUS_READY = 'Готов к выдаче';
  var STATUS_DELIVERED = 'delivered';
  /** @deprecated alias — UI still uses "received" internally */
  var STATUS_ISSUED = STATUS_DELIVERED;

  function createSupabase() {
    if (!global.supabase || typeof global.supabase.createClient !== 'function') {
      throw new Error('Supabase JS library is not loaded');
    }
    return global.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function isDeliveredStatus(statusRaw) {
    var s = String(statusRaw || '').trim().toLowerCase();
    return (
      s === 'delivered' ||
      s === 'received' ||
      s === 'выдано' ||
      statusRaw === 'Выдано'
    );
  }

  function mapParcelFromDb(row) {
    if (!row) return null;
    var statusRaw = String(row.status || '');
    var status = isDeliveredStatus(statusRaw) ? 'received' : 'arrived';

    var storageRaw = row.storage_fee;
    var storageFee =
      storageRaw === null || storageRaw === undefined || storageRaw === ''
        ? null
        : Math.round(Number(storageRaw) || 0);

    return {
      id: row.id,
      track: String(row.track_number || row.track || '').toUpperCase(),
      clientCode: String(row.client_code || row.clientCode || '').replace(/\D/g, ''),
      userId: String(row.user_id || row.userId || '').trim(),
      status: status,
      statusLabel: statusRaw || (status === 'received' ? STATUS_DELIVERED : STATUS_READY),
      weightKg: Number(row.weight) || 0,
      priceSom: Math.round(Number(row.price) || 0),
      storageFee: storageFee,
      createdAt: row.created_at || row.createdAt || row.updated_at || new Date().toISOString(),
      updatedAt: row.updated_at || row.updatedAt || row.created_at || new Date().toISOString(),
      deliveredAt: row.delivered_at || row.deliveredAt || null
    };
  }

  function mapStatusToDb(status) {
    return status === 'received' || status === 'delivered' ? STATUS_DELIVERED : STATUS_READY;
  }

  global.PandaSupabase = {
    URL: SUPABASE_URL,
    ANON_KEY: SUPABASE_ANON_KEY,
    STATUS_READY: STATUS_READY,
    STATUS_DELIVERED: STATUS_DELIVERED,
    STATUS_ISSUED: STATUS_ISSUED,
    createClient: createSupabase,
    mapParcelFromDb: mapParcelFromDb,
    mapStatusToDb: mapStatusToDb,
    isDeliveredStatus: isDeliveredStatus
  };
})(typeof window !== 'undefined' ? window : globalThis);
