'use strict';

/* =========================================================================
   ملاحظاتي — application logic
   ========================================================================= */

const APP_PREFIX = 'molahzati.v1';
const THEME_KEY = `${APP_PREFIX}.theme`;
const VIEW_KEY_PREFIX = `${APP_PREFIX}.view.`;
const SORT_KEY_PREFIX = `${APP_PREFIX}.sort.`;
const LAST_EMAIL_KEY = `${APP_PREFIX}.lastEmail`;
const NOTES_TABLE = 'notes';
const PROFILES_TABLE = 'profiles';
const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 24;
const NOTE_COLORS = ['default', 'indigo', 'rose', 'mint', 'amber', 'sky', 'lilac'];
const TAG_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#a855f7', '#14b8a6', '#f97316'];
const AR_LOCALE = 'ar-u-nu-latn-ca-gregory';

const SUPABASE_CONFIG = window.MOLAHZATI_SUPABASE || {};
const supabaseClient =
  window.supabase && SUPABASE_CONFIG.url && SUPABASE_CONFIG.publishableKey
    ? window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

const ICON_PATHS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  notes:
    '<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/><path d="M8 13h8M8 17h5"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  pin:
    '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z"/>',
  star:
    '<path d="m12 2.8 2.9 5.87 6.48.94-4.69 4.57 1.11 6.45L12 17.58l-5.8 3.05 1.11-6.45-4.69-4.57 6.48-.94L12 2.8Z"/>',
  archive:
    '<rect x="3" y="3.5" width="18" height="5" rx="1.2"/><path d="M5 8.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5"/><path d="M10 12.5h4"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
  tag:
    '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4Z"/><circle cx="7.5" cy="7.5" r="1"/>',
  sliders:
    '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  sun:
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  grid:
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>',
  alert:
    '<path d="M10.3 3.6 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  'shield-check':
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off':
    '<path d="M9.9 4.24A9.8 9.8 0 0 1 12 4c6.5 0 10 8 10 8a17.8 17.8 0 0 1-2.16 3.19M6.6 6.6C3.6 8.7 2 12 2 12s3.5 8 10 8a10.4 10.4 0 0 0 5.4-1.5"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="m2 2 20 20"/>',
  sparkles:
    '<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  bolt: '<path d="M13 2 4.1 12.7a1 1 0 0 0 .8 1.6H11l-1 7.7 8.9-10.7a1 1 0 0 0-.8-1.6H12l1-7.7Z"/>',
  sort: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
  restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
};

/* -------------------------------------------------------------------------
   State & DOM helpers
   ------------------------------------------------------------------------- */
const state = {
  user: null,
  notes: [],
  sessionGeneration: 0,
  filter: 'all',
  tagFilter: null,
  query: '',
  sort: 'updated',
  view: 'grid',
  themeMode: 'system',
  renderedOnce: false,
  editor: {
    open: false,
    openToken: 0,
    isNew: true,
    noteId: null,
    draft: { title: '', content: '', tags: [], color: 'default' },
    meta: { pinned: false, favorite: false },
    rev: 0,
    dirty: false,
    contentDirty: false,
    saving: false,
    currentSave: null,
    saveTimer: null,
    closing: false,
    lastSavedAt: 0,
  },
};

let overlayStack = [];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function iconSvg(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ICON_PATHS.notes}</svg>`;
}

function setIcon(node, name) {
  if (!node) return;
  const holder = node.matches && node.matches('[data-icon]') ? node : node.querySelector('[data-icon]');
  if (!holder) return;
  holder.innerHTML = iconSvg(name);
  holder.setAttribute('data-icon', name);
}

function svgIcon(name, className = 'icon') {
  const span = el('span', className);
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = iconSvg(name);
  return span;
}

function hydrateIcons(root = document) {
  $$('[data-icon]', root).forEach((node) => {
    node.innerHTML = iconSvg(node.dataset.icon);
  });
}

/* -------------------------------------------------------------------------
   Formatting
   ------------------------------------------------------------------------- */
const fullDateFmt = new Intl.DateTimeFormat(AR_LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const mediumDateFmt = new Intl.DateTimeFormat(AR_LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const monthYearFmt = new Intl.DateTimeFormat(AR_LOCALE, {
  month: 'long',
  year: 'numeric',
});
const relativeFmt = new Intl.RelativeTimeFormat(AR_LOCALE, { numeric: 'auto' });
const numberFmt = new Intl.NumberFormat(AR_LOCALE);

function formatNum(value) {
  return numberFmt.format(Number(value) || 0);
}

function formatFullDate(timestamp) {
  if (!timestamp) return '—';
  try {
    return fullDateFmt.format(new Date(timestamp));
  } catch {
    return '—';
  }
}

function relativeDate(timestamp) {
  if (!timestamp) return 'الآن';
  const now = Date.now();
  const diff = timestamp - now;
  const abs = Math.abs(diff);

  if (abs < 45000) return 'الآن';

  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return relativeFmt.format(minutes, 'minute');

  const hours = Math.round(diff / 3600000);
  if (Math.abs(hours) < 24) return relativeFmt.format(hours, 'hour');

  const days = Math.round(diff / 86400000);
  if (Math.abs(days) < 31) return relativeFmt.format(days, 'day');

  const date = new Date(timestamp);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  try {
    return new Intl.DateTimeFormat(AR_LOCALE, {
      day: 'numeric',
      month: 'short',
      ...(sameYear ? {} : { year: 'numeric' }),
    }).format(date);
  } catch {
    return '—';
  }
}

function formatMonthYear(timestamp) {
  if (!timestamp) return '—';
  try {
    return monthYearFmt.format(new Date(timestamp));
  } catch {
    return '—';
  }
}

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${formatNum(bytes)} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return `${new Intl.NumberFormat(AR_LOCALE, { maximumFractionDigits: 1 }).format(kb)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${new Intl.NumberFormat(AR_LOCALE, { maximumFractionDigits: 1 }).format(mb)} MB`;
}

function countWords(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/u).length;
}

function normalizeSearch(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

function hashString(value) {
  let hash = 0;
  for (const char of String(value)) {
    hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  }
  return hash;
}

function tagColor(tag) {
  return TAG_COLORS[hashString(normalizeSearch(tag)) % TAG_COLORS.length];
}

function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'صديقنا';
}

function initials(name) {
  return Array.from(String(name || '').trim())[0] || 'م';
}

function hueFromString(value) {
  return hashString(String(value)) % 360;
}

function avatarGradient(hue) {
  const h = Number(hue) || 0;
  return `linear-gradient(135deg, hsl(${h} 62% 48%) 0%, hsl(${(h + 38) % 360} 70% 38%) 100%)`;
}

function pluralNotes(count) {
  if (count === 1) return 'ملاحظة واحدة';
  if (count === 2) return 'ملاحظتان';
  if (count >= 3 && count <= 10) return `${formatNum(count)} ملاحظات`;
  return `${formatNum(count)} ملاحظة`;
}

/* -------------------------------------------------------------------------
   Theme
   ------------------------------------------------------------------------- */
function getPreferredThemeMode() {
  try {
    const mode = localStorage.getItem(THEME_KEY);
    if (['light', 'dark', 'system'].includes(mode)) return mode;
  } catch {
    /* ignore */
  }
  return 'system';
}

function resolveTheme(mode) {
  if (mode === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode === 'dark' ? 'dark' : 'light';
}

function updateThemeUI(resolved) {
  $$('#authThemeBtn, #themeBtn').forEach((button) => {
    const isDark = resolved === 'dark';
    setIcon(button, isDark ? 'sun' : 'moon');
    const label = isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  });

  $$('.theme-option').forEach((button) => {
    const active = button.dataset.themeChoice === state.themeMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function applyTheme(mode, { persist = true } = {}) {
  if (!['light', 'dark', 'system'].includes(mode)) mode = 'system';
  state.themeMode = mode;
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute('data-theme', resolved);
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, mode);
    } catch {
      /* ignore */
    }
  }
  updateThemeUI(resolved);
}

function toggleTheme() {
  const resolved = resolveTheme(state.themeMode);
  applyTheme(resolved === 'dark' ? 'light' : 'dark');
}

/* -------------------------------------------------------------------------
   Supabase data layer
   ------------------------------------------------------------------------- */
function cloudReady() {
  return Boolean(supabaseClient);
}

function authErrorMessage(error) {
  const message = String(error?.message || error || '');
  if (/Invalid login credentials/i.test(message)) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if (/Email not confirmed/i.test(message)) return 'لم يتم تأكيد بريدك الإلكتروني بعد. افتح رسالة التأكيد ثم حاول مجددًا.';
  if (/User already registered/i.test(message)) return 'هذا البريد الإلكتروني مسجّل بالفعل. جرّب تسجيل الدخول.';
  if (/Password should be at least|weak password/i.test(message)) return 'كلمة المرور ضعيفة. استخدم 8 أحرف على الأقل.';
  if (/For security purposes|rate limit|too many requests/i.test(message)) return 'محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مجددًا.';
  if (/Invalid API key|No API key/i.test(message)) return 'إعدادات الاتصال بقاعدة البيانات غير صحيحة.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) return 'تعذّر الاتصال بخادم البيانات. تحقق من اتصالك بالإنترنت.';
  return 'تعذّر إتمام العملية الآن. حاول مجددًا.';
}

function dataErrorMessage(error, fallback = 'تعذّر حفظ التغيير. حاول مجددًا.') {
  const message = String(error?.message || error || '');
  if (/relation .* does not exist|schema cache|Could not find the table/i.test(message)) {
    return 'قاعدة البيانات غير مهيأة بعد. نفّذ ملف supabase-schema.sql من لوحة Supabase.';
  }
  if (/row-level security|permission denied/i.test(message)) return 'لا تملك صلاحية لهذا الإجراء.';
  if (/JWT expired|Auth session missing|invalid claim/i.test(message)) return 'انتهت الجلسة. سجّل الدخول مجددًا.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) return 'تعذّر الاتصال بخادم البيانات. تحقق من اتصالك بالإنترنت.';
  return fallback;
}

function parseTimestamp(value, fallback = Date.now()) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function randomId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    '$1-$2-$3-$4-$5'
  );
}

function rowToNote(row) {
  return {
    id: row.id,
    color: NOTE_COLORS.includes(row.color) ? row.color : 'default',
    pinned: Boolean(row.pinned),
    favorite: Boolean(row.favorite),
    archived: Boolean(row.archived),
    trashed: Boolean(row.trashed),
    createdAt: parseTimestamp(row.created_at),
    updatedAt: parseTimestamp(row.updated_at, parseTimestamp(row.created_at)),
    trashedAt: row.trashed_at ? parseTimestamp(row.trashed_at) : null,
    data: normalizeNoteData({
      title: row.title,
      content: row.content,
      tags: row.tags,
    }),
    corrupted: false,
  };
}

function noteToRow(note) {
  return {
    id: note.id,
    user_id: state.user.id,
    title: note.data.title,
    content: note.data.content,
    tags: note.data.tags,
    color: note.color,
    pinned: Boolean(note.pinned),
    favorite: Boolean(note.favorite),
    archived: Boolean(note.archived),
    trashed: Boolean(note.trashed),
    trashed_at: note.trashedAt ? new Date(note.trashedAt).toISOString() : null,
    created_at: new Date(note.createdAt).toISOString(),
    updated_at: new Date(note.updatedAt).toISOString(),
  };
}

async function insertNoteCloud(note) {
  const { data, error } = await supabaseClient
    .from(NOTES_TABLE)
    .insert(noteToRow(note))
    .select()
    .single();
  if (error) throw error;
  return rowToNote(data);
}

async function updateNoteCloud(note, fields = null) {
  const fullRow = noteToRow(note);
  const row = fields
    ? Object.fromEntries(fields.map((field) => [field, fullRow[field]]))
    : fullRow;
  delete row.created_at;
  const { data, error } = await supabaseClient
    .from(NOTES_TABLE)
    .update(row)
    .eq('id', note.id)
    .select()
    .single();
  if (error) throw error;
  return rowToNote(data);
}

async function persistExistingNote(note, fields = null) {
  const saved = await updateNoteCloud(note, fields);
  Object.assign(note, saved);
  return note;
}

async function deleteNoteCloud(noteId) {
  const { error } = await supabaseClient.from(NOTES_TABLE).delete().eq('id', noteId);
  if (error) throw error;
}

async function ensureProfile(authUser) {
  const fallbackName =
    String(authUser.user_metadata?.name || '').trim().slice(0, 60) ||
    String(authUser.email || '').split('@')[0] ||
    'مستخدم';

  let { data: profile, error } = await supabaseClient
    .from(PROFILES_TABLE)
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    const wrapped = new Error(dataErrorMessage(error, 'تعذّر تحميل ملفك الشخصي. تحقق من إعداد قاعدة البيانات.'));
    wrapped.isDataError = true;
    throw wrapped;
  }

  if (!profile) {
    const payload = {
      id: authUser.id,
      name: fallbackName,
      hue: hueFromString(authUser.email || authUser.id),
      welcome_seeded: false,
    };
    const result = await supabaseClient
      .from(PROFILES_TABLE)
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (result.error) {
      const wrapped = new Error(dataErrorMessage(result.error, 'تعذّر إنشاء ملفك الشخصي. تحقق من إعداد قاعدة البيانات.'));
      wrapped.isDataError = true;
      throw wrapped;
    }
    profile = result.data;
  }

  return {
    ...profile,
    name: String(profile.name || fallbackName).trim().slice(0, 60) || fallbackName,
    hue: Number.isFinite(profile.hue) ? profile.hue : hueFromString(authUser.email || authUser.id),
    createdAt: parseTimestamp(profile.created_at || authUser.created_at),
  };
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function rememberEmail(email) {
  try {
    localStorage.setItem(LAST_EMAIL_KEY, normalizeEmail(email));
  } catch {
    /* ignore */
  }
}

function getRememberedEmail() {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

/* -------------------------------------------------------------------------
   Toasts
   ------------------------------------------------------------------------- */
function clearToasts() {
  const container = $('#toasts');
  if (container) container.replaceChildren();
}

function showToast(message, options = {}) {
  const {
    type = 'default',
    actionLabel = '',
    onAction = null,
    duration = 4200,
  } = options;

  const container = $('#toasts');
  if (!container) return;

  while (container.children.length >= 3) {
    container.firstElementChild.remove();
  }

  const toast = el('div', `toast toast--${type}`);
  toast.setAttribute('role', 'status');

  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert' : 'notes';
  toast.append(svgIcon(iconName, 'toast-icon icon'));

  const text = el('span', 'toast-message', message);
  toast.append(text);

  let timer = null;

  const dismiss = () => {
    if (!toast.isConnected) return;
    clearTimeout(timer);
    toast.classList.add('is-leaving');
    window.setTimeout(() => toast.remove(), 250);
  };

  if (actionLabel && typeof onAction === 'function') {
    const action = el('button', 'toast-action', actionLabel);
    action.type = 'button';
    action.addEventListener('click', () => {
      dismiss();
      try {
        onAction();
      } catch (error) {
        console.error(error);
      }
    });
    toast.append(action);
  }

  container.append(toast);
  timer = window.setTimeout(dismiss, duration);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => {
    timer = window.setTimeout(dismiss, 1400);
  });
}

/* -------------------------------------------------------------------------
   Overlay manager
   ------------------------------------------------------------------------- */
function getFocusable(container) {
  return $$(
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    container
  ).filter((node) => {
    if (node.hidden || node.getAttribute('aria-hidden') === 'true') return false;
    return node.getClientRects().length > 0;
  });
}

function openOverlay(overlay, options = {}) {
  if (!overlay || !overlay.hidden) return;
  const entry = {
    overlay,
    beforeClose: typeof options.beforeClose === 'function' ? options.beforeClose : null,
    onClose: typeof options.onClose === 'function' ? options.onClose : null,
    previousFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    closing: false,
  };

  overlay.hidden = false;
  overlayStack.push(entry);
  document.body.classList.add('no-scroll');

  window.requestAnimationFrame(() => {
    if (overlay.hidden) return;
    const target = options.initialFocus || getFocusable(overlay)[0] || overlay;
    if (target && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  });
}

async function closeOverlay(overlay) {
  const entry = overlayStack.find((item) => item.overlay === overlay);
  if (!entry) {
    if (overlay) overlay.hidden = true;
    return true;
  }
  if (entry.closing) return false;

  entry.closing = true;

  if (entry.beforeClose) {
    let canClose = false;
    try {
      canClose = await entry.beforeClose();
    } catch (error) {
      console.error(error);
      canClose = false;
    }
    if (canClose === false) {
      entry.closing = false;
      return false;
    }
  }

  overlayStack = overlayStack.filter((item) => item !== entry);
  overlay.hidden = true;

  if (!overlayStack.length) {
    document.body.classList.remove('no-scroll');
  }

  if (entry.onClose) {
    try {
      entry.onClose();
    } catch (error) {
      console.error(error);
    }
  }

  const previous = entry.previousFocus;
  if (previous && document.contains(previous) && typeof previous.focus === 'function') {
    window.requestAnimationFrame(() => previous.focus({ preventScroll: true }));
  }

  return true;
}

function closeTopOverlay() {
  if (!overlayStack.length) return;
  const top = overlayStack[overlayStack.length - 1];
  closeOverlay(top.overlay);
}

async function forceCloseAllOverlays() {
  const entries = overlayStack.slice().reverse();
  overlayStack = [];
  for (const entry of entries) {
    entry.overlay.hidden = true;
  }
  document.body.classList.remove('no-scroll');
}

/* -------------------------------------------------------------------------
   Field validation helpers
   ------------------------------------------------------------------------- */
function setFieldError(input, message) {
  if (!input) return;
  const field = input.closest('.field');
  if (!field) return;
  field.classList.toggle('has-error', Boolean(message));
  const error = field.querySelector('.field-error');
  if (error) error.textContent = message || '';
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function clearFieldError(input) {
  setFieldError(input, '');
}

function clearFormErrors(form) {
  if (!form) return;
  $$('.field.has-error', form).forEach((field) => field.classList.remove('has-error'));
  $$('.field-error', form).forEach((error) => {
    error.textContent = '';
  });
  $$('input[aria-invalid="true"]', form).forEach((input) => input.removeAttribute('aria-invalid'));
}

function setButtonLoading(button, loading) {
  if (!button) return;
  button.classList.toggle('is-loading', loading);
  button.disabled = loading;
  button.setAttribute('aria-busy', loading ? 'true' : 'false');
}

function showAuthAlert(target, message, type = 'error') {
  if (!target) return;
  target.hidden = false;
  target.textContent = message;
  target.classList.toggle('is-success', type === 'success');
}

function hideAuthAlert(target) {
  if (!target) return;
  target.hidden = true;
  target.textContent = '';
  target.classList.remove('is-success');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// == AUTH LOGIC ==

function setAuthTab(tab, options = {}) {
  const { focus = true } = options;
  const isRegister = tab === 'register';

  $$('[data-auth-tab]').forEach((button) => {
    const active = button.dataset.authTab === tab;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });

  const loginForm = $('#loginForm');
  const registerForm = $('#registerForm');
  if (loginForm) loginForm.hidden = isRegister;
  if (registerForm) registerForm.hidden = !isRegister;

  const heading = $('#authHeading');
  const subheading = $('#authSubheading');
  if (isRegister) {
    if (heading) heading.textContent = 'أنشئ مساحتك الخاصة';
    if (subheading) subheading.textContent = 'مساحة واحدة لك، محمية بكلمة مرورك، ولا يشاركك فيها أحد.';
  } else {
    if (heading) heading.textContent = 'مرحبًا بعودتك';
    if (subheading) subheading.textContent = 'سجّل الدخول للوصول إلى مساحة ملاحظاتك الخاصة.';
  }

  hideAuthAlert($('#loginAlert'));
  hideAuthAlert($('#registerAlert'));
  if (loginForm) clearFormErrors(loginForm);
  if (registerForm) clearFormErrors(registerForm);

  if (focus) {
    const target = isRegister ? $('#registerName') : $('#loginEmail');
    window.requestAnimationFrame(() => target && target.focus({ preventScroll: true }));
  }
}

function scorePassword(value) {
  const password = String(value || '');
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12 || (/[A-Z]/.test(password) && /[a-z]/.test(password))) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;
  return Math.min(4, Math.max(1, score));
}

function updatePasswordStrength() {
  const input = $('#registerPassword');
  const container = $('#passwordStrength');
  if (!input || !container) return;

  const value = input.value;
  if (!value) {
    container.hidden = true;
    return;
  }

  const score = scorePassword(value);
  const labels = { 1: 'ضعيفة', 2: 'متوسطة', 3: 'جيدة', 4: 'قوية' };
  const colors = { 1: 'var(--danger)', 2: 'var(--warning)', 3: 'var(--brand)', 4: 'var(--success)' };
  container.hidden = false;
  container.dataset.strength = String(score);
  container.style.setProperty('--strength-color', colors[score]);
  const label = $('.strength-label', container);
  if (label) label.textContent = `قوة كلمة المرور: ${labels[score]}`;
}

function togglePasswordVisibility(button) {
  const id = button.dataset.reveal;
  const input = document.getElementById(id);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  setIcon(button, show ? 'eye-off' : 'eye');
  button.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
  input.focus({ preventScroll: true });
  const length = input.value.length;
  try {
    input.setSelectionRange(length, length);
  } catch {
    /* ignore */
  }
}

function showAuthView(options = {}) {
  const { tab = null, resetForms = false } = options;

  const authView = $('#authView');
  const appView = $('#appView');
  if (authView) authView.hidden = false;
  if (appView) appView.hidden = true;

  closeSidebar();

  const loginEmail = $('#loginEmail');
  if (loginEmail && !loginEmail.value) {
    loginEmail.value = getRememberedEmail();
  }

  if (resetForms) {
    ['loginPassword', 'registerName', 'registerEmail', 'registerPassword', 'registerConfirm'].forEach((id) => {
      const input = document.getElementById(id);
      if (input) input.value = '';
      if (input) input.type = 'password';
    });
    const strength = $('#passwordStrength');
    if (strength) strength.hidden = true;
    $$('[data-reveal]').forEach((button) => {
      setIcon(button, 'eye');
      button.setAttribute('aria-label', 'إظهار كلمة المرور');
    });
    const registerForm = $('#registerForm');
    if (registerForm) clearFormErrors(registerForm);
    const loginForm = $('#loginForm');
    if (loginForm) clearFormErrors(loginForm);
    hideAuthAlert($('#loginAlert'));
    hideAuthAlert($('#registerAlert'));
    if (loginEmail) loginEmail.value = getRememberedEmail();
  }

  const desiredTab = tab || 'login';
  setAuthTab(desiredTab, { focus: false });
  document.title = 'ملاحظاتي — مساحة آمنة لأفكارك';
  hideBootScreen();
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = $('#loginForm');
  const emailInput = $('#loginEmail');
  const passwordInput = $('#loginPassword');
  const alertBox = $('#loginAlert');
  const submit = $('#loginSubmit');
  if (!form || !emailInput || !passwordInput || !submit) return;

  clearFormErrors(form);
  hideAuthAlert(alertBox);

  const email = normalizeEmail(emailInput.value);
  const password = passwordInput.value;
  let hasError = false;

  if (!email) {
    setFieldError(emailInput, 'أدخل بريدك الإلكتروني.');
    hasError = true;
  } else if (!EMAIL_RE.test(email)) {
    setFieldError(emailInput, 'صيغة البريد الإلكتروني غير صحيحة.');
    hasError = true;
  }

  if (!password) {
    setFieldError(passwordInput, 'أدخل كلمة المرور.');
    hasError = true;
  }

  if (hasError) {
    form.classList.add('shake');
    window.setTimeout(() => form.classList.remove('shake'), 400);
    return;
  }

  if (!cloudReady()) {
    showAuthAlert(alertBox, 'تعذّر الاتصال بخدمة البيانات. تحقق من إعدادات Supabase أو تحديث الصفحة.');
    return;
  }

  setButtonLoading(submit, true);
  hideAuthAlert(alertBox);

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    const profile = await ensureProfile(data.user);
    rememberEmail(email);
    passwordInput.value = '';
    form.classList.remove('shake');
    await enterWorkspace(data.user, profile);
    showToast(`مرحبًا بعودتك، ${firstName(state.user.name)}.`, { type: 'success' });
  } catch (error) {
    console.warn('Login failed:', error);
    showAuthAlert(alertBox, error?.isDataError ? error.message : authErrorMessage(error));
    form.classList.add('shake');
    window.setTimeout(() => form.classList.remove('shake'), 400);
    passwordInput.select();
  } finally {
    setButtonLoading(submit, false);
  }
}

function validateNewPassword(password) {
  if (!password) return 'أدخل كلمة المرور.';
  if (password.length < 8) return 'استخدم 8 أحرف على الأقل.';
  return '';
}

function signupRedirectUrl() {
  if (!/^https?:$/.test(window.location.protocol)) return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const form = $('#registerForm');
  const nameInput = $('#registerName');
  const emailInput = $('#registerEmail');
  const passwordInput = $('#registerPassword');
  const confirmInput = $('#registerConfirm');
  const alertBox = $('#registerAlert');
  const submit = $('#registerSubmit');
  if (!form || !nameInput || !emailInput || !passwordInput || !confirmInput || !submit) return;

  clearFormErrors(form);
  hideAuthAlert(alertBox);

  const name = nameInput.value.trim().replace(/\s+/g, ' ');
  const email = normalizeEmail(emailInput.value);
  const password = passwordInput.value;
  const confirm = confirmInput.value;
  let hasError = false;

  if (name.length < 2) {
    setFieldError(nameInput, 'أدخل اسمك الكامل (حرفان على الأقل).');
    hasError = true;
  }

  if (!email) {
    setFieldError(emailInput, 'أدخل بريدك الإلكتروني.');
    hasError = true;
  } else if (!EMAIL_RE.test(email)) {
    setFieldError(emailInput, 'صيغة البريد الإلكتروني غير صحيحة.');
    hasError = true;
  }

  const passwordError = validateNewPassword(password);
  if (passwordError) {
    setFieldError(passwordInput, passwordError);
    hasError = true;
  }

  if (!confirm) {
    setFieldError(confirmInput, 'أعد كتابة كلمة المرور.');
    hasError = true;
  } else if (password !== confirm) {
    setFieldError(confirmInput, 'كلمتا المرور غير متطابقتين.');
    hasError = true;
  }

  if (hasError) {
    form.classList.add('shake');
    window.setTimeout(() => form.classList.remove('shake'), 400);
    return;
  }

  if (!cloudReady()) {
    showAuthAlert(alertBox, 'تعذّر الاتصال بخدمة البيانات. تحقق من إعدادات Supabase أو تحديث الصفحة.');
    return;
  }

  setButtonLoading(submit, true);

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: signupRedirectUrl(),
      },
    });
    if (error) throw error;

    // Supabase يعيد مستخدمًا بدون identities عند وجود البريد مسبقًا
    // عندما يكون تأكيد البريد مفعّلًا، دون كشف حالة الحساب.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      rememberEmail(email);
      setAuthTab('login');
      const loginEmail = $('#loginEmail');
      if (loginEmail) loginEmail.value = email;
      showAuthAlert(
        $('#loginAlert'),
        'إذا كان هذا البريد مسجلًا فستجد رسالة تأكيد أو يمكنك تسجيل الدخول مباشرة.',
        'success'
      );
      return;
    }

    rememberEmail(email);

    if (!data.session) {
      form.reset();
      const strength = $('#passwordStrength');
      if (strength) strength.hidden = true;
      setAuthTab('login');
      const loginEmail = $('#loginEmail');
      if (loginEmail) loginEmail.value = email;
      showAuthAlert(
        $('#loginAlert'),
        'تم إنشاء حسابك. افتح رسالة التأكيد في بريدك الإلكتروني، ثم سجّل الدخول.',
        'success'
      );
      return;
    }

    const profile = await ensureProfile(data.user);
    form.reset();
    const strength = $('#passwordStrength');
    if (strength) strength.hidden = true;
    $$('[data-reveal]', form).forEach((button) => {
      const input = document.getElementById(button.dataset.reveal);
      if (input) input.type = 'password';
      setIcon(button, 'eye');
      button.setAttribute('aria-label', 'إظهار كلمة المرور');
    });

    await enterWorkspace(data.user, profile);
    showToast(`أهلًا بك في ملاحظاتي، ${firstName(state.user.name)}. مساحتك جاهزة.`, {
      type: 'success',
      duration: 5200,
    });
  } catch (error) {
    console.warn('Registration failed:', error);
    showAuthAlert(alertBox, error?.isDataError ? error.message : authErrorMessage(error));
    form.classList.add('shake');
    window.setTimeout(() => form.classList.remove('shake'), 400);
  } finally {
    setButtonLoading(submit, false);
  }
}

async function seedWelcomeNoteIfNeeded() {
  const profile = state.user?.profile;
  if (!profile || profile.welcome_seeded) return;

  if (state.notes.length === 0) {
    const now = Date.now();
    const content = [
      `مرحبًا ${firstName(state.user.name)}،`,
      '',
      'هذه مساحتك الخاصة في «ملاحظاتي». لا يمكن لأي مستخدم آخر الوصول إلى ملاحظاتك بفضل العزل الآمن في قاعدة البيانات.',
      '',
      'إليك بعض النصائح للبدء:',
      '• أنشئ ملاحظة جديدة بزر «ملاحظة جديدة» أو بمفتاح N.',
      '• أضف وسومًا وألوانًا لتنظيم أفكارك حسب مشاريعك.',
      '• استخدم البحث السريع (Ctrl + K) للوصول إلى أي فكرة فورًا.',
      '• ثبّت الملاحظات المهمة لتظهر دائمًا في المقدمة.',
      '• يمكنك تصدير نسخة احتياطية من الإعدادات ← البيانات.',
      '',
      'ابدأ الآن، واكتب فكرتك الأولى.',
      '— فريق ملاحظاتي',
    ].join('\n');

    const note = {
      id: randomId(),
      color: 'indigo',
      pinned: true,
      favorite: true,
      archived: false,
      trashed: false,
      createdAt: now,
      updatedAt: now,
      trashedAt: null,
      data: {
        title: 'مرحبًا بك في ملاحظاتي',
        content,
        tags: ['بداية'],
      },
    };

    try {
      state.notes.push(await insertNoteCloud(note));
    } catch (error) {
      console.warn('Could not seed welcome note.', error);
    }
  }

  try {
    const result = await supabaseClient
      .from(PROFILES_TABLE)
      .update({ welcome_seeded: true, updated_at: new Date().toISOString() })
      .eq('id', state.user.id)
      .select()
      .single();

    if (!result.error && result.data) {
      state.user.profile = { ...profile, ...result.data };
    }
  } catch (error) {
    console.warn('Could not mark welcome note as seeded.', error);
  }
}

function hideBootScreen() {
  const boot = $('#bootScreen');
  if (!boot) return;
  boot.classList.add('is-hidden');
  document.body.classList.remove('is-booting');
  window.setTimeout(() => {
    boot.remove();
  }, 500);
}

// == WORKSPACE LOGIC ==

async function enterWorkspace(authUser, profile) {
  state.sessionGeneration += 1;
  state.user = {
    id: authUser.id,
    email: authUser.email || '',
    name: profile.name,
    createdAt: profile.createdAt,
    hue: profile.hue,
    profile,
  };
  state.filter = 'all';
  state.tagFilter = null;
  state.query = '';
  state.renderedOnce = false;
  state.notes = [];

  const searchInput = $('#searchInput');
  if (searchInput) searchInput.value = '';
  updateSearchClear();

  state.view = readPreference(VIEW_KEY_PREFIX, 'grid', ['grid', 'list']);
  state.sort = readPreference(SORT_KEY_PREFIX, 'updated', ['updated', 'created', 'title']);

  const sortSelect = $('#sortSelect');
  if (sortSelect) sortSelect.value = state.sort;

  try {
    await loadNotes();
    await purgeExpiredTrash();
    await seedWelcomeNoteIfNeeded();
  } catch (error) {
    state.user = null;
    state.notes = [];
    const wrapped = new Error(dataErrorMessage(error, 'تعذّر تحميل ملاحظاتك. حاول تحديث الصفحة.'));
    wrapped.isDataError = true;
    throw wrapped;
  }

  applyView(state.view, { persist: false });
  renderUser();
  renderAll();

  const authView = $('#authView');
  const appView = $('#appView');
  if (authView) authView.hidden = true;
  if (appView) appView.hidden = false;

  closeSidebar();
  hideBootScreen();
  updateThemeUI(resolveTheme(state.themeMode));
}

async function restoreSession() {
  if (!cloudReady()) return false;

  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (!data.session?.user) return false;

    const profile = await ensureProfile(data.session.user);
    await enterWorkspace(data.session.user, profile);
    return true;
  } catch (error) {
    console.warn('Session restore failed.', error);
    showAuthView({ tab: 'login' });
    window.setTimeout(() => {
      showToast(dataErrorMessage(error, 'تعذّر استعادة الجلسة. سجّل الدخول مجددًا.'), {
        type: 'error',
        duration: 6500,
      });
    }, 600);
    return false;
  }
}

function readPreference(prefix, fallback, allowed) {
  if (!state.user) return fallback;
  try {
    const value = localStorage.getItem(`${prefix}${state.user.id}`);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function writePreference(prefix, value) {
  if (!state.user) return;
  try {
    localStorage.setItem(`${prefix}${state.user.id}`, value);
  } catch {
    /* ignore */
  }
}

function normalizeNoteData(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  const tags = Array.isArray(data.tags)
    ? data.tags
        .filter((tag) => typeof tag === 'string' && tag.trim())
        .map((tag) => tag.trim().slice(0, MAX_TAG_LENGTH))
        .slice(0, MAX_TAGS)
    : [];
  return {
    title: typeof data.title === 'string' ? data.title : '',
    content: typeof data.content === 'string' ? data.content : '',
    tags,
  };
}

async function loadNotes() {
  const { data, error } = await supabaseClient
    .from(NOTES_TABLE)
    .select('*')
    .eq('user_id', state.user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  state.notes = (data || []).map(rowToNote);
  state.corruptedNoteCount = 0;
}

async function purgeExpiredTrash() {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const expired = state.notes.filter(
    (note) => note.trashed && note.trashedAt && note.trashedAt < cutoff
  );
  if (!expired.length) return;

  state.notes = state.notes.filter((note) => !expired.includes(note));
  try {
    const { error } = await supabaseClient
      .from(NOTES_TABLE)
      .delete()
      .in(
        'id',
        expired.map((note) => note.id)
      );
    if (error) throw error;
  } catch (error) {
    console.warn('Could not purge expired trash.', error);
  }
}

function renderUser() {
  if (!state.user) return;
  const hue = Number.isFinite(state.user.hue) ? state.user.hue : hueFromString(state.user.email);
  const gradient = avatarGradient(hue);
  const initial = initials(state.user.name);

  ['userAvatar', 'topbarAvatar', 'settingsAvatar'].forEach((id) => {
    const avatar = document.getElementById(id);
    if (!avatar) return;
    avatar.textContent = initial;
    avatar.style.background = gradient;
  });

  const userName = $('#userName');
  if (userName) userName.textContent = state.user.name;
  const userEmail = $('#userEmail');
  if (userEmail) userEmail.textContent = state.user.email;

  const settingsDisplayName = $('#settingsDisplayName');
  if (settingsDisplayName) settingsDisplayName.textContent = state.user.name;
  const settingsDisplayEmail = $('#settingsDisplayEmail');
  if (settingsDisplayEmail) settingsDisplayEmail.textContent = state.user.email;
  const settingsJoined = $('#settingsJoined');
  if (settingsJoined) settingsJoined.textContent = formatMonthYear(state.user.createdAt);

  const nameInput = $('#settingsNameInput');
  if (nameInput) nameInput.value = state.user.name;
  const emailInput = $('#settingsEmailInput');
  if (emailInput) emailInput.value = state.user.email;

  updateSettingsSummary();
}

function getTagStats() {
  const map = new Map();
  state.notes.forEach((note) => {
    if (note.trashed || note.archived || note.corrupted) return;
    note.data.tags.forEach((tag) => {
      map.set(tag, (map.get(tag) || 0) + 1);
    });
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count, color: tagColor(name) }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name, 'ar');
    });
}

function renderSidebar() {
  const activeNotes = state.notes.filter((note) => !note.trashed && !note.archived);
  const counts = {
    all: activeNotes.length,
    pinned: activeNotes.filter((note) => note.pinned).length,
    favorites: activeNotes.filter((note) => note.favorite).length,
    archived: state.notes.filter((note) => note.archived && !note.trashed).length,
    trash: state.notes.filter((note) => note.trashed).length,
  };

  $$('[data-count]').forEach((node) => {
    const key = node.dataset.count;
    node.textContent = formatNum(counts[key] ?? 0);
  });

  $$('.nav-item[data-filter]').forEach((button) => {
    const active = !state.tagFilter && button.dataset.filter === state.filter;
    button.classList.toggle('is-active', active);
  });

  const tags = getTagStats();
  if (state.tagFilter && !tags.some((tag) => tag.name === state.tagFilter)) {
    state.tagFilter = null;
  }

  const tagList = $('#tagList');
  const tagsEmpty = $('#tagsEmpty');
  const tagsTotal = $('#tagsTotal');
  if (!tagList) return;

  tagList.replaceChildren();
  if (tagsTotal) tagsTotal.textContent = formatNum(tags.length);

  if (!tags.length) {
    if (tagsEmpty) tagsEmpty.hidden = false;
    return;
  }
  if (tagsEmpty) tagsEmpty.hidden = true;

  const fragment = document.createDocumentFragment();
  tags.forEach((tag) => {
    const button = el('button', 'tag-item');
    button.type = 'button';
    button.dataset.tag = tag.name;
    button.classList.toggle('is-active', state.tagFilter === tag.name);
    const dot = el('span', 'tag-dot');
    dot.style.setProperty('--tag-color', tag.color);
    const name = el('span', 'tag-name', tag.name);
    const count = el('span', 'tag-count', formatNum(tag.count));
    button.append(dot, name, count);
    fragment.append(button);
  });
  tagList.append(fragment);
}

function getFilterMeta() {
  if (state.tagFilter) {
    return {
      title: `الوسم: ${state.tagFilter}`,
      subtitle: 'كل الملاحظات الموسومة بهذا الوسم، في مكان واحد.',
      emptyTitle: `لا ملاحظات بالوسم «${state.tagFilter}»`,
      emptyText: 'أضف هذا الوسم إلى ملاحظة جديدة، أو امسح التصفية للعودة إلى جميع ملاحظاتك.',
      emptyAction: 'مسح التصفية',
      emptyIcon: 'tag',
      emptyActionIcon: 'x',
    };
  }

  switch (state.filter) {
    case 'pinned':
      return {
        title: 'الملاحظات المثبّتة',
        subtitle: 'أفكارك الأهم، دائمًا في المقدمة.',
        emptyTitle: 'لا توجد ملاحظات مثبّتة',
        emptyText: 'ثبّت أي ملاحظة بالضغط على أيقونة التثبيت، وستجدها هنا دائمًا.',
        emptyAction: 'إنشاء ملاحظة جديدة',
        emptyIcon: 'pin',
        emptyActionIcon: 'plus',
      };
    case 'favorites':
      return {
        title: 'المفضّلة',
        subtitle: 'الملاحظات التي تحب العودة إليها.',
        emptyTitle: 'قائمتك المفضّلة فارغة',
        emptyText: 'أضف ملاحظة إلى المفضّلة بالضغط على النجمة لتصل إليها بسرعة.',
        emptyAction: 'إنشاء ملاحظة جديدة',
        emptyIcon: 'star',
        emptyActionIcon: 'plus',
      };
    case 'archived':
      return {
        title: 'الأرشيف',
        subtitle: 'ملاحظات بعيدة عن مساحة عملك، لكنها محفوظة بأمان.',
        emptyTitle: 'الأرشيف فارغ',
        emptyText: 'عندما تنتهي من ملاحظة وتريد إبقاءها بعيدًا عن مساحة العمل، أرشفها وستجدها هنا.',
        emptyAction: 'العودة إلى الملاحظات',
        emptyIcon: 'archive',
        emptyActionIcon: 'arrow-left',
      };
    case 'trash':
      return {
        title: 'سلة المهملات',
        subtitle: 'يمكنك استعادة الملاحظات أو حذفها نهائيًا. تُنظَّف السلة تلقائيًا بعد 30 يومًا.',
        emptyTitle: 'سلة المهملات فارغة',
        emptyText: 'الملاحظات المحذوفة ستظهر هنا قبل أن تتخذ قرارك النهائي.',
        emptyAction: 'العودة إلى الملاحظات',
        emptyIcon: 'trash',
        emptyActionIcon: 'arrow-left',
      };
    default:
      return {
        title: 'جميع الملاحظات',
        subtitle: 'أفكارك، مرتّبة كما تحب.',
        emptyTitle: 'مساحتك جاهزة للأفكار',
        emptyText: 'ابدأ بإنشاء أول ملاحظة، وستجد كل شيء في مكانه دائمًا. كل ما تكتبه يبقى خاصًا بحسابك.',
        emptyAction: 'إنشاء ملاحظة',
        emptyIcon: 'notes',
        emptyActionIcon: 'plus',
      };
  }
}

function renderHeader(visibleCount) {
  const meta = getFilterMeta();
  const titleNode = $('#viewTitle');
  const pageTitle = $('#pageTitle');
  const subtitle = $('#viewSubtitle');
  const countNode = $('#viewCount');
  const sortSelect = $('#sortSelect');

  if (titleNode) titleNode.textContent = meta.title;
  if (pageTitle) pageTitle.textContent = meta.title;
  if (subtitle) {
    subtitle.textContent = state.query
      ? `نتائج البحث عن «${state.query.length > 48 ? `${state.query.slice(0, 48)}…` : state.query}»`
      : meta.subtitle;
  }
  if (countNode) countNode.textContent = formatNum(visibleCount);
  if (sortSelect) sortSelect.value = state.sort;

  document.title = `${meta.title} — ملاحظاتي`;
}

function renderActiveFilter() {
  const bar = $('#activeFilterBar');
  const chip = $('#activeFilterChip');
  if (!bar) return;
  if (!state.tagFilter) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  if (chip) {
    chip.replaceChildren();
    const dot = el('span', 'tag-dot');
    dot.style.setProperty('--tag-color', tagColor(state.tagFilter));
    const label = el('span', '', state.tagFilter);
    chip.append(dot, label);
  }
}

function getVisibleNotes() {
  let list = state.notes.filter((note) => {
    if (state.filter === 'trash') return note.trashed;
    if (note.trashed) return false;
    if (state.filter === 'archived') return note.archived;
    if (note.archived) return false;
    if (state.filter === 'pinned') return note.pinned;
    if (state.filter === 'favorites') return note.favorite;
    return true;
  });

  if (state.tagFilter) {
    list = list.filter((note) => note.data.tags.some((tag) => tag === state.tagFilter));
  }

  const query = normalizeSearch(state.query);
  if (query) {
    list = list.filter((note) => {
      const title = normalizeSearch(note.data.title);
      const content = normalizeSearch(note.data.content);
      const tags = note.data.tags.map(normalizeSearch);
      return title.includes(query) || content.includes(query) || tags.some((tag) => tag.includes(query));
    });
  }

  const pinnedFirst = state.filter !== 'archived' && state.filter !== 'trash';
  list.sort((a, b) => {
    if (pinnedFirst && a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (state.filter === 'trash') {
      return (b.trashedAt || b.updatedAt) - (a.trashedAt || a.updatedAt);
    }
    if (state.sort === 'created') return b.createdAt - a.createdAt;
    if (state.sort === 'title') {
      const aTitle = a.data.title || 'بدون عنوان';
      const bTitle = b.data.title || 'بدون عنوان';
      return aTitle.localeCompare(bTitle, 'ar');
    }
    return b.updatedAt - a.updatedAt;
  });

  return list;
}

function renderAll() {
  if (!state.user) return;

  renderSidebar();
  const list = getVisibleNotes();
  renderHeader(list.length);
  renderActiveFilter();
  updateSearchClear();
  renderNotes(list);
  updateEmptyState(list);

  const grid = $('#notesGrid');
  if (grid) {
    if (state.renderedOnce) grid.classList.add('no-anim');
    else grid.classList.remove('no-anim');
  }
  state.renderedOnce = true;
}

function createNoteAction(action, icon, label, active = false, danger = false) {
  const button = el(
    'button',
    `note-action${active ? ' is-on' : ''}${danger ? ' note-action--danger' : ''}`
  );
  button.type = 'button';
  button.dataset.action = action;
  button.title = label;
  button.setAttribute('aria-label', label);
  button.innerHTML = iconSvg(icon);
  return button;
}

function createNoteCard(note) {
  const card = el('article', `note${note.trashed ? ' is-trashed' : ''}`);
  card.dataset.id = note.id;
  card.dataset.color = note.color;
  card.tabIndex = note.trashed || note.corrupted ? -1 : 0;
  card.setAttribute(
    'aria-label',
    note.trashed
      ? `ملاحظة في سلة المهملات: ${note.data.title || 'بدون عنوان'}`
      : `فتح الملاحظة: ${note.data.title || 'بدون عنوان'}`
  );
  if (note.corrupted) card.dataset.corrupted = 'true';

  const head = el('div', 'note-head');
  const tags = el('div', 'note-tags');
  const visibleTags = note.data.tags.slice(0, 2);
  visibleTags.forEach((tag) => {
    const chip = el('span', 'note-tag');
    const dot = el('span', 'note-tag-dot');
    dot.style.setProperty('--tag-color', tagColor(tag));
    chip.append(dot, document.createTextNode(tag));
    tags.append(chip);
  });
  if (note.data.tags.length > visibleTags.length) {
    tags.append(el('span', 'note-tag', `+${formatNum(note.data.tags.length - visibleTags.length)}`));
  }

  const flags = el('div', 'note-flags');
  if (note.pinned) {
    const flag = el('span', 'note-flag');
    flag.title = 'مثبّتة';
    flag.innerHTML = iconSvg('pin');
    flags.append(flag);
  }
  if (note.favorite) {
    const flag = el('span', 'note-flag note-flag--star');
    flag.title = 'في المفضّلة';
    flag.innerHTML = iconSvg('star');
    flags.append(flag);
  }
  head.append(tags, flags);

  const body = el('div', 'note-body');
  const title = el('h3', `note-title${note.data.title ? '' : ' is-untitled'}`, note.data.title || 'بدون عنوان');
  const rawPreview = note.data.content.trim();
  const preview = el(
    'p',
    'note-preview',
    rawPreview ? rawPreview.slice(0, 700) : 'لا يوجد محتوى بعد…'
  );
  body.append(title, preview);

  const footer = el('div', 'note-footer');
  const time = el(
    'time',
    'note-date',
    note.trashed
      ? `حُذفت ${relativeDate(note.trashedAt || note.updatedAt)}`
      : relativeDate(note.updatedAt)
  );
  try {
    const relevantTime = note.trashed ? note.trashedAt || note.updatedAt : note.updatedAt;
    time.dateTime = new Date(relevantTime).toISOString();
    time.title = formatFullDate(relevantTime);
  } catch {
    /* ignore */
  }

  const actions = el('div', 'note-actions');
  if (note.trashed) {
    actions.append(
      createNoteAction('restore', 'restore', 'استعادة الملاحظة'),
      createNoteAction('delete-forever', 'trash', 'حذف نهائيًا', false, true)
    );
  } else {
    actions.append(
      createNoteAction('pin', 'pin', note.pinned ? 'إلغاء التثبيت' : 'تثبيت الملاحظة', note.pinned),
      createNoteAction(
        'favorite',
        'star',
        note.favorite ? 'إزالة من المفضّلة' : 'إضافة إلى المفضّلة',
        note.favorite
      )
    );
    if (note.archived) {
      actions.append(createNoteAction('unarchive', 'restore', 'استعادة من الأرشيف'));
    } else {
      actions.append(createNoteAction('archive', 'archive', 'أرشفة الملاحظة'));
    }
    actions.append(createNoteAction('trash', 'trash', 'نقل إلى سلة المهملات', false, true));
  }

  footer.append(time, actions);
  card.append(head, body, footer);
  return card;
}

function renderNotes(list) {
  const grid = $('#notesGrid');
  if (!grid) return;
  grid.replaceChildren();
  const fragment = document.createDocumentFragment();
  list.forEach((note) => fragment.append(createNoteCard(note)));
  grid.append(fragment);
}

function getEmptyConfig() {
  const meta = getFilterMeta();
  if (state.query) {
    const query = state.query.length > 42 ? `${state.query.slice(0, 42)}…` : state.query;
    return {
      icon: 'search',
      title: 'لا توجد نتائج مطابقة',
      text: `لم نعثر على شيء يطابق «${query}». جرّب كلمة أخرى، أو امسح البحث للعودة إلى جميع ملاحظاتك.`,
      action: 'مسح البحث',
      actionIcon: 'x',
    };
  }
  return {
    icon: meta.emptyIcon,
    title: meta.emptyTitle,
    text: meta.emptyText,
    action: meta.emptyAction,
    actionIcon: meta.emptyActionIcon,
  };
}

function updateEmptyState(list) {
  const empty = $('#emptyState');
  const grid = $('#notesGrid');
  if (!empty || !grid) return;

  if (list.length) {
    empty.hidden = true;
    grid.hidden = false;
    return;
  }

  grid.hidden = true;
  empty.hidden = false;

  const config = getEmptyConfig();
  const icon = $('#emptyIcon');
  const title = $('#emptyTitle');
  const text = $('#emptyText');
  const action = $('#emptyActionBtn');
  const hints = $('#emptyHints');

  setIcon(icon, config.icon);
  if (title) title.textContent = config.title;
  if (text) text.textContent = config.text;
  if (action) {
    action.innerHTML = `${iconSvg(config.actionIcon)}<span>${config.action}</span>`;
  }
  if (hints) {
    hints.hidden = Boolean(state.query || state.tagFilter || state.filter !== 'all');
  }
}

function handleEmptyAction() {
  if (state.query) {
    clearSearch();
    return;
  }
  if (state.tagFilter) {
    clearTagFilter();
    return;
  }
  if (state.filter === 'archived' || state.filter === 'trash') {
    state.filter = 'all';
    renderAll();
    return;
  }
  openEditor(null);
}

function applyView(view, { persist = true } = {}) {
  state.view = view === 'list' ? 'list' : 'grid';
  const grid = $('#notesGrid');
  if (grid) grid.dataset.view = state.view;
  $$('[data-view]').forEach((button) => {
    if (button.closest('.view-toggle')) {
      const active = button.dataset.view === state.view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  });
  if (persist) writePreference(VIEW_KEY_PREFIX, state.view);
}

function applySort(value, { persist = true } = {}) {
  state.sort = ['updated', 'created', 'title'].includes(value) ? value : 'updated';
  const select = $('#sortSelect');
  if (select) select.value = state.sort;
  if (persist) writePreference(SORT_KEY_PREFIX, state.sort);
}

function updateSearchClear() {
  const input = $('#searchInput');
  const clear = $('#searchClear');
  if (!input || !clear) return;
  clear.hidden = !input.value;
}

function setSearchQuery(value) {
  state.query = String(value || '');
  renderAll();
}

function clearSearch({ focus = true, shouldRender = true } = {}) {
  state.query = '';
  const input = $('#searchInput');
  if (input) {
    input.value = '';
    if (focus) input.focus({ preventScroll: true });
  }
  updateSearchClear();
  if (shouldRender) renderAll();
}

function clearTagFilter() {
  state.tagFilter = null;
  renderAll();
}

function setFilter(filter) {
  if (!['all', 'pinned', 'favorites', 'archived', 'trash'].includes(filter)) return;
  state.filter = filter;
  state.tagFilter = null;
  state.query = '';
  const search = $('#searchInput');
  if (search) search.value = '';
  updateSearchClear();
  renderAll();
  closeSidebar();
}

function openSidebar() {
  if (window.innerWidth > 1024) return;
  const sidebar = $('#sidebar');
  const backdrop = $('#sidebarBackdrop');
  if (!sidebar) return;
  sidebar.classList.add('is-open');
  if (backdrop) backdrop.classList.add('is-visible');
  document.body.classList.add('sidebar-open');
  const menu = $('#menuBtn');
  if (menu) menu.setAttribute('aria-expanded', 'true');
  const main = $('.main');
  if (main) main.inert = true;

  window.requestAnimationFrame(() => {
    if (!sidebar.classList.contains('is-open')) return;
    const target = getFocusable(sidebar)[0];
    if (target) target.focus({ preventScroll: true });
  });
}

function closeSidebar() {
  const sidebar = $('#sidebar');
  const backdrop = $('#sidebarBackdrop');
  const wasOpen = Boolean(sidebar && sidebar.classList.contains('is-open'));
  if (sidebar) sidebar.classList.remove('is-open');
  if (backdrop) backdrop.classList.remove('is-visible');
  document.body.classList.remove('sidebar-open');
  const menu = $('#menuBtn');
  if (menu) menu.setAttribute('aria-expanded', 'false');
  const main = $('.main');
  if (main) main.inert = false;

  if (wasOpen && window.innerWidth <= 1024 && menu) {
    const active = document.activeElement;
    if (!active || active === document.body || (sidebar && sidebar.contains(active))) {
      window.requestAnimationFrame(() => {
        if (!document.body.classList.contains('sidebar-open')) {
          menu.focus({ preventScroll: true });
        }
      });
    }
  }
}

function toggleSidebar() {
  const sidebar = $('#sidebar');
  if (!sidebar) return;
  if (sidebar.classList.contains('is-open')) closeSidebar();
  else openSidebar();
}

async function logout(options = {}) {
  const { silent = false } = options;
  state.sessionGeneration += 1;
  await forceCloseAllOverlays();
  closeSidebar();

  try {
    if (cloudReady()) await supabaseClient.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.warn('Sign out failed.', error);
  }

  clearToasts();
  state.user = null;
  state.notes = [];
  state.filter = 'all';
  state.tagFilter = null;
  state.query = '';
  state.renderedOnce = false;
  resetEditorState();
  document.title = 'ملاحظاتي — مساحة آمنة لأفكارك';
  showAuthView({ tab: 'login', resetForms: true });
  if (!silent) {
    showToast('تم تسجيل الخروج بأمان.', { type: 'success' });
  }
}

function refocusNoteAction(noteId, action) {
  try {
    const selector = `.note[data-id="${noteId}"] .note-action[data-action="${action}"]`;
    const button = document.querySelector(selector);
    if (button) button.focus({ preventScroll: true });
  } catch {
    /* ignore */
  }
}

async function handleNoteAction(action, noteId, sourceButton = null) {
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  const hadFocus = sourceButton && document.activeElement === sourceButton;

  try {
    switch (action) {
      case 'pin': {
        const previous = note.pinned;
        note.pinned = !previous;
        try {
          await persistExistingNote(note, ['pinned']);
        } catch (error) {
          note.pinned = previous;
          throw error;
        }
        renderAll();
        if (hadFocus) refocusNoteAction(noteId, 'pin');
        break;
      }
      case 'favorite': {
        const previous = note.favorite;
        note.favorite = !previous;
        try {
          await persistExistingNote(note, ['favorite']);
        } catch (error) {
          note.favorite = previous;
          throw error;
        }
        renderAll();
        if (hadFocus) refocusNoteAction(noteId, 'favorite');
        break;
      }
      case 'archive': {
        note.archived = true;
        try {
          await persistExistingNote(note, ['archived']);
        } catch (error) {
          note.archived = false;
          throw error;
        }
        renderAll();
        showToast('تمت أرشفة الملاحظة.', {
          actionLabel: 'تراجع',
          onAction: async () => {
            note.archived = false;
            try {
              await persistExistingNote(note, ['archived']);
              renderAll();
            } catch (error) {
              note.archived = true;
              showToast(dataErrorMessage(error, 'تعذّر التراجع. حاول مجددًا.'), { type: 'error' });
            }
          },
        });
        break;
      }
      case 'unarchive': {
        note.archived = false;
        try {
          await persistExistingNote(note, ['archived']);
        } catch (error) {
          note.archived = true;
          throw error;
        }
        renderAll();
        showToast('تمت استعادة الملاحظة من الأرشيف.', {
          type: 'success',
          actionLabel: 'تراجع',
          onAction: async () => {
            note.archived = true;
            try {
              await persistExistingNote(note, ['archived']);
              renderAll();
            } catch (error) {
              note.archived = false;
              showToast(dataErrorMessage(error, 'تعذّر التراجع. حاول مجددًا.'), { type: 'error' });
            }
          },
        });
        break;
      }
      case 'trash': {
        const previousTrashedAt = note.trashedAt;
        note.trashed = true;
        note.trashedAt = Date.now();
        try {
          await persistExistingNote(note, ['trashed', 'trashed_at']);
        } catch (error) {
          note.trashed = false;
          note.trashedAt = previousTrashedAt || null;
          throw error;
        }
        renderAll();
        showToast('تم نقل الملاحظة إلى سلة المهملات.', {
          actionLabel: 'تراجع',
          onAction: async () => {
            note.trashed = false;
            note.trashedAt = previousTrashedAt || null;
            try {
              await persistExistingNote(note, ['trashed', 'trashed_at']);
              renderAll();
            } catch (error) {
              note.trashed = true;
              note.trashedAt = Date.now();
              showToast(dataErrorMessage(error, 'تعذّر التراجع. حاول مجددًا.'), { type: 'error' });
            }
          },
        });
        break;
      }
      case 'restore': {
        const previousTrashedAt = note.trashedAt;
        note.trashed = false;
        note.trashedAt = null;
        try {
          await persistExistingNote(note, ['trashed', 'trashed_at']);
        } catch (error) {
          note.trashed = true;
          note.trashedAt = previousTrashedAt || Date.now();
          throw error;
        }
        renderAll();
        showToast('تمت استعادة الملاحظة.', { type: 'success' });
        break;
      }
      case 'delete-forever': {
        const result = await confirmDialog({
          title: 'حذف الملاحظة نهائيًا؟',
          message: `سيتم حذف «${note.data.title || 'بدون عنوان'}» نهائيًا. لا يمكن التراجع عن هذه الخطوة.`,
          confirmLabel: 'حذف نهائيًا',
        });
        if (!result) return;
        await deleteNoteCloud(noteId);
        state.notes = state.notes.filter((item) => item.id !== noteId);
        renderAll();
        showToast('تم حذف الملاحظة نهائيًا.', { type: 'success' });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.warn('Note action failed:', error);
    showToast(dataErrorMessage(error, 'تعذّر حفظ التغيير. حاول مجددًا.'), { type: 'error' });
  }
}

// == EDITOR LOGIC ==

const COLOR_LABELS = {
  default: 'بلا لون',
  indigo: 'بنفسجي',
  rose: 'وردي',
  mint: 'أخضر',
  amber: 'عنبري',
  sky: 'أزرق',
  lilac: 'ليلكي',
};

function buildColorPicker() {
  const picker = $('#colorPicker');
  if (!picker) return;
  picker.replaceChildren();
  NOTE_COLORS.forEach((color) => {
    const button = el('button', 'color-dot');
    button.type = 'button';
    button.dataset.color = color;
    button.title = COLOR_LABELS[color] || color;
    button.setAttribute('aria-label', `لون الملاحظة: ${COLOR_LABELS[color] || color}`);
    button.setAttribute('aria-pressed', 'false');
    picker.append(button);
  });
}

function updateEditorColorPicker() {
  $$('.color-dot').forEach((button) => {
    const active = button.dataset.color === state.editor.draft.color;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function hasDraftContent() {
  const draft = state.editor.draft;
  return Boolean(draft.title.trim() || draft.content.trim() || draft.tags.length);
}

function wordLabel(count) {
  if (count === 0) return 'لا كلمات';
  if (count === 1) return 'كلمة واحدة';
  if (count === 2) return 'كلمتان';
  if (count <= 10) return `${formatNum(count)} كلمات`;
  return `${formatNum(count)} كلمة`;
}

function updateEditorWordCount() {
  const node = $('#editorWordCount');
  if (!node) return;
  node.textContent = wordLabel(countWords(state.editor.draft.content));
}

function setEditorStatus(type, message) {
  const status = $('#editorStatus');
  const text = $('#editorStatusText');
  if (!status) return;
  status.classList.remove('is-saving', 'is-error', 'is-dirty');
  let iconName = 'check';
  if (type === 'saving') {
    iconName = 'refresh';
    status.classList.add('is-saving');
  } else if (type === 'error') {
    iconName = 'alert';
    status.classList.add('is-error');
  } else if (type === 'dirty') {
    iconName = 'edit';
    status.classList.add('is-dirty');
  }
  setIcon(status.querySelector('.icon'), iconName);
  if (text) text.textContent = message;
}

function renderEditorTags() {
  const container = $('#tagEditorChips');
  const input = $('#tagInput');
  if (!container) return;
  container.replaceChildren();
  const ed = state.editor;

  ed.draft.tags.forEach((tag) => {
    const chip = el('span', 'editor-tag');
    chip.style.setProperty('--tag-color', tagColor(tag));
    const dot = el('span', 'editor-tag-dot');
    const label = el('span', 'editor-tag-name', tag);
    const remove = el('button', 'editor-tag-remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `إزالة الوسم ${tag}`);
    remove.title = `إزالة الوسم ${tag}`;
    remove.innerHTML = iconSvg('x');
    remove.addEventListener('click', (event) => {
      event.stopPropagation();
      removeEditorTag(tag);
    });
    chip.append(dot, label, remove);
    container.append(chip);
  });

  if (input) {
    input.placeholder = ed.draft.tags.length >= MAX_TAGS ? 'بلغت الحد الأقصى للوسوم' : 'أضف وسمًا…';
  }
}

function removeEditorTag(tag) {
  const ed = state.editor;
  const index = ed.draft.tags.indexOf(tag);
  if (index === -1) return;
  ed.draft.tags.splice(index, 1);
  renderEditorTags();
  markEditorDirty('content');
}

function addTagToDraft(rawTag) {
  const ed = state.editor;
  const tag = String(rawTag || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TAG_LENGTH);
  if (!tag) return false;
  if (ed.draft.tags.some((item) => normalizeSearch(item) === normalizeSearch(tag))) return false;
  if (ed.draft.tags.length >= MAX_TAGS) {
    showToast(`يمكنك إضافة ${formatNum(MAX_TAGS)} وسوم كحد أقصى للملاحظة.`, { type: 'error' });
    return false;
  }
  ed.draft.tags.push(tag);
  renderEditorTags();
  return true;
}

function commitTagInput() {
  const input = $('#tagInput');
  if (!input) return false;
  const value = input.value;
  if (!value.trim()) {
    input.value = '';
    return false;
  }
  const parts = value.split(/[,،]/).map((part) => part.trim());
  let added = false;
  parts.forEach((part) => {
    if (part && addTagToDraft(part)) added = true;
  });
  input.value = '';
  if (added) markEditorDirty('content');
  return added;
}

function updateEditorChrome() {
  const ed = state.editor;
  const eyebrow = $('#editorEyebrow');
  if (eyebrow) eyebrow.textContent = ed.isNew ? 'ملاحظة جديدة' : 'تحرير الملاحظة';

  const note = ed.noteId ? state.notes.find((item) => item.id === ed.noteId) : null;
  const archiveButton = $('#editorArchiveBtn');
  if (archiveButton) {
    const archived = Boolean(note && note.archived);
    setIcon(archiveButton, archived ? 'restore' : 'archive');
    const label = archiveButton.querySelector('span:last-child');
    if (label) label.textContent = archived ? 'استعادة' : 'أرشفة';
    archiveButton.title = archived ? 'استعادة من الأرشيف' : 'أرشفة الملاحظة';
  }

  const deleteButton = $('#editorDeleteBtn');
  if (deleteButton) {
    setIcon(deleteButton, ed.isNew ? 'x' : 'trash');
    const label = deleteButton.querySelector('span:last-child');
    if (label) label.textContent = ed.isNew ? 'إلغاء' : 'حذف';
    deleteButton.title = ed.isNew ? 'إلغاء المسودة' : 'نقل إلى سلة المهملات';
  }

  const date = $('#editorDate');
  if (date) {
    date.textContent = ed.isNew
      ? 'مسودة جديدة'
      : note
        ? `آخر تحديث ${relativeDate(note.updatedAt)}`
        : 'مسودة جديدة';
  }

  const pinButton = $('#editorPinBtn');
  if (pinButton) {
    pinButton.classList.toggle('is-on', ed.meta.pinned);
    pinButton.setAttribute('aria-pressed', String(ed.meta.pinned));
  }
  const favoriteButton = $('#editorFavBtn');
  if (favoriteButton) {
    favoriteButton.classList.toggle('is-on', ed.meta.favorite);
    favoriteButton.setAttribute('aria-pressed', String(ed.meta.favorite));
  }

  updateEditorWordCount();
}

function openEditor(note = null) {
  if (!state.user || state.editor.open) return;

  if (!note) {
    const needsReset = state.filter !== 'all' || state.tagFilter || state.query;
    if (needsReset) {
      state.filter = 'all';
      state.tagFilter = null;
      state.query = '';
      const search = $('#searchInput');
      if (search) search.value = '';
      updateSearchClear();
      renderAll();
    }
  }

  const ed = state.editor;
  clearTimeout(ed.saveTimer);
  ed.openToken += 1;
  ed.open = true;
  ed.isNew = !note;
  ed.noteId = note ? note.id : null;
  ed.draft = note
    ? {
        title: note.data.title,
        content: note.data.content,
        tags: note.data.tags.slice(),
        color: note.color,
      }
    : { title: '', content: '', tags: [], color: 'default' };
  ed.meta = {
    pinned: Boolean(note && note.pinned),
    favorite: Boolean(note && note.favorite),
  };
  ed.rev = 0;
  ed.dirty = false;
  ed.contentDirty = false;
  ed.saving = false;
  ed.currentSave = null;
  ed.saveTimer = null;
  ed.closing = false;
  ed.discard = false;
  ed.lastSavedAt = note ? note.updatedAt : 0;

  const titleInput = $('#noteTitleInput');
  const contentInput = $('#noteContentInput');
  const tagInput = $('#tagInput');
  if (titleInput) titleInput.value = ed.draft.title;
  if (contentInput) contentInput.value = ed.draft.content;
  if (tagInput) tagInput.value = '';
  renderEditorTags();
  updateEditorColorPicker();
  updateEditorChrome();
  setEditorStatus('saved', note ? 'محفوظ' : 'جاهز');

  const panel = $('#editorPanel');
  if (panel) panel.tabIndex = -1;
  const overlay = $('#editorOverlay');
  if (!overlay) return;

  openOverlay(overlay, {
    beforeClose: beforeEditorClose,
    onClose: resetEditorState,
    initialFocus: titleInput || panel,
  });
}

function resetEditorState() {
  const ed = state.editor;
  clearTimeout(ed.saveTimer);
  ed.openToken += 1;
  ed.open = false;
  ed.isNew = true;
  ed.noteId = null;
  ed.draft = { title: '', content: '', tags: [], color: 'default' };
  ed.meta = { pinned: false, favorite: false };
  ed.rev = 0;
  ed.dirty = false;
  ed.contentDirty = false;
  ed.saving = false;
  ed.currentSave = null;
  ed.saveTimer = null;
  ed.closing = false;
  ed.discard = false;

  const titleInput = $('#noteTitleInput');
  const contentInput = $('#noteContentInput');
  const tagInput = $('#tagInput');
  if (titleInput) titleInput.value = '';
  if (contentInput) contentInput.value = '';
  if (tagInput) tagInput.value = '';
  renderEditorTags();
  updateEditorColorPicker();
  updateEditorWordCount();
}

function markEditorDirty(kind) {
  const ed = state.editor;
  if (!ed.open) return;
  ed.rev += 1;
  ed.dirty = true;
  if (kind === 'content') ed.contentDirty = true;
  setEditorStatus('dirty', 'تعديلات غير محفوظة');
  if (kind === 'content') updateEditorWordCount();
  scheduleEditorSave();
}

function scheduleEditorSave(delay = 900) {
  const ed = state.editor;
  if (!ed.open || ed.closing) return;
  clearTimeout(ed.saveTimer);
  ed.saveTimer = window.setTimeout(() => {
    ed.saveTimer = null;
    saveEditor({ silent: true });
  }, delay);
}

function saveEditor(options = {}) {
  const { silent = false } = options;
  const ed = state.editor;
  if (!state.user || !ed.open) return Promise.resolve(true);
  if (ed.saving && ed.currentSave) return ed.currentSave;

  clearTimeout(ed.saveTimer);
  ed.saveTimer = null;

  if (ed.isNew && !hasDraftContent()) {
    setEditorStatus('saved', 'جاهز');
    return Promise.resolve(true);
  }
  if (!ed.dirty) return Promise.resolve(true);

  const snapshot = {
    title: ed.draft.title.trim(),
    content: ed.draft.content,
    tags: ed.draft.tags.slice(),
    color: ed.draft.color,
    pinned: ed.meta.pinned,
    favorite: ed.meta.favorite,
    contentChanged: ed.contentDirty || ed.isNew,
  };
  const rev = ed.rev;
  const ownerId = state.user.id;
  const sessionGeneration = state.sessionGeneration;
  const editorToken = ed.openToken;

  ed.saving = true;
  setEditorStatus('saving', 'جارٍ الحفظ…');

  const task = (async () => {
    let note = ed.noteId ? state.notes.find((item) => item.id === ed.noteId) : null;
    let created = false;

    if (!note) {
      note = {
        id: randomId(),
        color: snapshot.color,
        pinned: snapshot.pinned,
        favorite: snapshot.favorite,
        archived: false,
        trashed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        trashedAt: null,
        data: { title: '', content: '', tags: [] },
        corrupted: false,
      };
      created = true;
    }

    note.color = snapshot.color;
    note.pinned = snapshot.pinned;
    note.favorite = snapshot.favorite;

    if (snapshot.contentChanged || created) {
      note.data = {
        title: snapshot.title,
        content: snapshot.content,
        tags: snapshot.tags,
      };
      note.updatedAt = Date.now();
    }

    if (
      state.sessionGeneration !== sessionGeneration ||
      !state.user ||
      state.user.id !== ownerId ||
      !ed.open ||
      ed.openToken !== editorToken
    ) {
      return { canceled: true };
    }

    const saved = created ? await insertNoteCloud(note) : await updateNoteCloud(note);

    if (
      state.sessionGeneration !== sessionGeneration ||
      !state.user ||
      state.user.id !== ownerId ||
      !ed.open ||
      ed.openToken !== editorToken
    ) {
      return { canceled: true };
    }

    const existingIndex = state.notes.findIndex((item) => item.id === saved.id);
    if (existingIndex >= 0) {
      Object.assign(state.notes[existingIndex], saved);
    } else {
      state.notes.push(saved);
    }

    if (created) {
      ed.noteId = saved.id;
      ed.isNew = false;
    }

    ed.lastSavedAt = Date.now();

    if (ed.rev === rev) {
      ed.dirty = false;
      ed.contentDirty = false;
    }

    return { note: saved, rev };
  })();

  ed.currentSave = task;

  return task
    .then((result) => {
      if (result && result.canceled) return false;
      if (
        state.sessionGeneration !== sessionGeneration ||
        !state.user ||
        state.user.id !== ownerId ||
        !ed.open ||
        ed.openToken !== editorToken
      ) {
        return false;
      }
      ed.saving = false;
      ed.currentSave = null;
      if (ed.dirty) {
        setEditorStatus('dirty', 'تعديلات جديدة غير محفوظة');
      } else {
        setEditorStatus('saved', 'تم الحفظ');
      }
      updateEditorChrome();
      renderAll();
      if (ed.dirty && !ed.closing) scheduleEditorSave();
      return true;
    })
    .catch((error) => {
      if (
        state.sessionGeneration !== sessionGeneration ||
        !state.user ||
        state.user.id !== ownerId ||
        !ed.open ||
        ed.openToken !== editorToken
      ) {
        return false;
      }
      console.warn('Editor save failed:', error);
      ed.saving = false;
      ed.currentSave = null;
      setEditorStatus('error', 'تعذّر الحفظ');
      if (!silent) {
        showToast(dataErrorMessage(error, 'تعذّر حفظ الملاحظة. حاول مجددًا.'), { type: 'error' });
      }
      return false;
    });
}

async function flushEditorChanges() {
  const ed = state.editor;
  clearTimeout(ed.saveTimer);
  ed.saveTimer = null;

  const tagInput = $('#tagInput');
  if (tagInput && tagInput.value.trim()) commitTagInput();
  clearTimeout(ed.saveTimer);
  ed.saveTimer = null;

  if (ed.isNew && !hasDraftContent() && !ed.dirty) return true;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (ed.saving && ed.currentSave) {
      const ok = await ed.currentSave;
      if (!ok) return false;
    } else if (ed.dirty) {
      const ok = await saveEditor({ silent: false });
      if (!ok) return false;
    }

    if (tagInput && tagInput.value.trim()) {
      commitTagInput();
      clearTimeout(ed.saveTimer);
      ed.saveTimer = null;
    }

    if (!ed.dirty && !ed.saving) return true;
  }

  return !ed.dirty && !ed.saving;
}

async function beforeEditorClose() {
  const ed = state.editor;
  if (!ed.open) return true;
  if (ed.discard) {
    clearTimeout(ed.saveTimer);
    ed.saveTimer = null;
    ed.dirty = false;
    return true;
  }
  ed.closing = true;
  const ok = await flushEditorChanges();
  if (!ok) {
    ed.closing = false;
    return false;
  }
  ed.closing = false;
  return true;
}

async function archiveFromEditor() {
  const ed = state.editor;
  if (!ed.open) return;
  ed.closing = true;
  const ok = await flushEditorChanges();
  if (!ok) {
    ed.closing = false;
    return;
  }

  const note = ed.noteId ? state.notes.find((item) => item.id === ed.noteId) : null;
  if (!note) {
    ed.closing = false;
    await closeOverlay($('#editorOverlay'));
    return;
  }

  const wasArchived = Boolean(note.archived);
  note.archived = !wasArchived;
  try {
    await persistExistingNote(note, ['archived']);
  } catch (error) {
    note.archived = wasArchived;
    ed.closing = false;
    showToast(dataErrorMessage(error, 'تعذّر حفظ التغيير. حاول مجددًا.'), { type: 'error' });
    return;
  }

  ed.closing = false;
  ed.discard = true;
  renderAll();
  await closeOverlay($('#editorOverlay'));

  showToast(wasArchived ? 'تمت استعادة الملاحظة من الأرشيف.' : 'تمت أرشفة الملاحظة.', {
    type: wasArchived ? 'success' : 'default',
    actionLabel: 'تراجع',
    onAction: async () => {
      note.archived = wasArchived;
      try {
        await persistExistingNote(note, ['archived']);
        renderAll();
      } catch (error) {
        note.archived = !wasArchived;
        showToast(dataErrorMessage(error, 'تعذّر التراجع. حاول مجددًا.'), { type: 'error' });
      }
    },
  });
}

async function deleteFromEditor() {
  const ed = state.editor;
  if (!ed.open) return;

  if (ed.isNew) {
    if (hasDraftContent()) {
      const confirmed = await confirmDialog({
        title: 'إلغاء المسودة؟',
        message: 'لم تُحفظ هذه الملاحظة بعد. سيتم إلغاء كل ما كتبته فيها.',
        confirmLabel: 'إلغاء المسودة',
        cancelLabel: 'متابعة الكتابة',
      });
      if (!confirmed) return;
    }
    ed.discard = true;
    await closeOverlay($('#editorOverlay'));
    showToast('تم إلغاء المسودة.');
    return;
  }

  ed.closing = true;
  const ok = await flushEditorChanges();
  if (!ok) {
    ed.closing = false;
    return;
  }

  const note = state.notes.find((item) => item.id === ed.noteId);
  if (!note) {
    ed.closing = false;
    await closeOverlay($('#editorOverlay'));
    return;
  }

  const previousTrashedAt = note.trashedAt;
  note.trashed = true;
  note.trashedAt = Date.now();
  try {
    await persistExistingNote(note, ['trashed', 'trashed_at']);
  } catch (error) {
    note.trashed = false;
    note.trashedAt = previousTrashedAt;
    ed.closing = false;
    showToast(dataErrorMessage(error, 'تعذّر حفظ التغيير. حاول مجددًا.'), { type: 'error' });
    return;
  }

  ed.closing = false;
  ed.discard = true;
  renderAll();
  await closeOverlay($('#editorOverlay'));

  showToast('تم نقل الملاحظة إلى سلة المهملات.', {
    actionLabel: 'تراجع',
    onAction: async () => {
      note.trashed = false;
      note.trashedAt = previousTrashedAt || null;
      try {
        await persistExistingNote(note, ['trashed', 'trashed_at']);
        renderAll();
      } catch (error) {
        note.trashed = true;
        note.trashedAt = Date.now();
        showToast(dataErrorMessage(error, 'تعذّر التراجع. حاول مجددًا.'), { type: 'error' });
      }
    },
  });
}

// == SETTINGS & ACTIONS ==

function updateSettingsSummary() {
  if (!state.user) return;
  const notesCount = state.notes.length;
  const tagSet = new Set();
  state.notes.forEach((note) => {
    if (!note.corrupted) note.data.tags.forEach((tag) => tagSet.add(tag));
  });

  let bytes = 0;
  try {
    const raw = JSON.stringify(
      state.notes.map((note) => ({
        title: note.data.title,
        content: note.data.content,
        tags: note.data.tags,
      }))
    );
    bytes = new TextEncoder().encode(raw).length;
  } catch {
    bytes = 0;
  }

  const notesNode = $('#dataNotesCount');
  const tagsNode = $('#dataTagsCount');
  const sizeNode = $('#dataStorageSize');
  if (notesNode) notesNode.textContent = formatNum(notesCount);
  if (tagsNode) tagsNode.textContent = formatNum(tagSet.size);
  if (sizeNode) sizeNode.textContent = formatBytes(bytes);
}

function setSettingsTab(tab) {
  const allowed = ['profile', 'security', 'data'];
  const selected = allowed.includes(tab) ? tab : 'profile';

  $$('.settings-tab').forEach((button) => {
    const active = button.dataset.settingsTab === selected;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
  });

  $$('[data-settings-pane]').forEach((pane) => {
    pane.hidden = pane.dataset.settingsPane !== selected;
  });

  const scroll = $('.settings-scroll');
  if (scroll) scroll.scrollTop = 0;

  if (selected === 'data') updateSettingsSummary();
}

function resetPasswordForm() {
  const form = $('#passwordForm');
  if (!form) return;
  form.reset();
  clearFormErrors(form);
  $$('[data-reveal]', form).forEach((button) => {
    const input = document.getElementById(button.dataset.reveal);
    if (input) input.type = 'password';
    setIcon(button, 'eye');
    button.setAttribute('aria-label', 'إظهار كلمة المرور');
  });
}

function openSettings(tab = 'profile') {
  if (!state.user) return;
  const overlay = $('#settingsOverlay');
  if (!overlay) return;

  closeSidebar();
  renderUser();
  setSettingsTab(tab);
  resetPasswordForm();
  updateSettingsSummary();

  if (!overlay.hidden) return;
  openOverlay(overlay, {
    initialFocus: $('#settingsCloseBtn'),
  });
}

async function handleProfileSave(event) {
  event.preventDefault();
  if (!state.user) return;
  const input = $('#settingsNameInput');
  const button = $('#profileSaveBtn');
  if (!input) return;

  const name = input.value.trim().replace(/\s+/g, ' ');
  if (name.length < 2) {
    setFieldError(input, 'أدخل اسمًا مكوّنًا من حرفين على الأقل.');
    input.focus();
    return;
  }

  clearFieldError(input);
  setActionButtonLoading(button, true, 'جارٍ الحفظ…');

  try {
    const { data, error } = await supabaseClient
      .from(PROFILES_TABLE)
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', state.user.id)
      .select()
      .single();
    if (error) throw error;

    state.user = {
      ...state.user,
      name,
      profile: { ...state.user.profile, ...data },
    };
    renderUser();
    showToast('تم تحديث معلوماتك الشخصية.', { type: 'success' });
  } catch (error) {
    console.warn('Profile update failed:', error);
    showToast(dataErrorMessage(error, 'تعذّر حفظ الاسم. حاول مجددًا.'), { type: 'error' });
  } finally {
    setActionButtonLoading(button, false);
  }
}

function setActionButtonLoading(button, loading, loadingLabel) {
  if (!button) return;
  if (loading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = loadingLabel;
  } else {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
  }
}

async function handlePasswordChange(event) {
  event.preventDefault();
  if (!state.user) return;

  const form = $('#passwordForm');
  const currentInput = $('#currentPassword');
  const newInput = $('#newPassword');
  const confirmInput = $('#confirmPassword');
  const submit = $('#passwordSaveBtn');
  if (!form || !currentInput || !newInput || !confirmInput) return;

  clearFormErrors(form);
  const currentPassword = currentInput.value;
  const newPassword = newInput.value;
  const confirmation = confirmInput.value;
  let hasError = false;

  if (!currentPassword) {
    setFieldError(currentInput, 'أدخل كلمة المرور الحالية.');
    hasError = true;
  }
  const passwordError = validateNewPassword(newPassword);
  if (passwordError) {
    setFieldError(newInput, passwordError);
    hasError = true;
  } else if (newPassword === currentPassword) {
    setFieldError(newInput, 'اختر كلمة مرور مختلفة عن كلمة المرور الحالية.');
    hasError = true;
  }
  if (!confirmation) {
    setFieldError(confirmInput, 'أعد كتابة كلمة المرور الجديدة.');
    hasError = true;
  } else if (newPassword !== confirmation) {
    setFieldError(confirmInput, 'كلمتا المرور غير متطابقتين.');
    hasError = true;
  }

  if (hasError) {
    form.classList.add('shake');
    window.setTimeout(() => form.classList.remove('shake'), 400);
    return;
  }

  setActionButtonLoading(submit, true, 'جارٍ تحديث كلمة المرور…');

  try {
    const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
      email: state.user.email,
      password: currentPassword,
    });

    if (verifyError) {
      setFieldError(currentInput, 'كلمة المرور الحالية غير صحيحة.');
      currentInput.select();
      form.classList.add('shake');
      window.setTimeout(() => form.classList.remove('shake'), 400);
      return;
    }

    const { error: updateError } = await supabaseClient.auth.updateUser({ password: newPassword });
    if (updateError) throw updateError;

    resetPasswordForm();
    showToast('تم تحديث كلمة المرور بنجاح. استخدم الكلمة الجديدة في المرة القادمة.', {
      type: 'success',
      duration: 5200,
    });
  } catch (error) {
    console.warn('Password update failed:', error);
    showToast(authErrorMessage(error), { type: 'error' });
  } finally {
    setActionButtonLoading(submit, false);
  }
}

function exportNotes() {
  if (!state.user) return;

  const payload = {
    app: 'ملاحظاتي',
    version: 1,
    encrypted: false,
    exportedAt: new Date().toISOString(),
    account: {
      name: state.user.name,
      email: state.user.email,
      createdAt: new Date(state.user.createdAt).toISOString(),
    },
    notes: state.notes.map((note) => ({
      id: note.id,
      title: note.data.title,
      content: note.data.content,
      tags: note.data.tags,
      color: note.color,
      pinned: note.pinned,
      favorite: note.favorite,
      archived: note.archived,
      trashed: note.trashed,
      corrupted: Boolean(note.corrupted),
      createdAt: new Date(note.createdAt).toISOString(),
      updatedAt: new Date(note.updatedAt).toISOString(),
    })),
  };

  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `molahzati-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    showToast('تم تنزيل النسخة الاحتياطية. احفظها في مكان آمن.', { type: 'success' });
  } catch (error) {
    console.error(error);
    showToast('تعذّر إنشاء النسخة الاحتياطية.', { type: 'error' });
  }
}

async function deleteAccountFlow() {
  if (!state.user) return;
  const password = await confirmDialog({
    title: 'حذف الحساب نهائيًا؟',
    message:
      'سيتم حذف حسابك وجميع ملاحظاتك نهائيًا من قاعدة البيانات السحابية. لا يمكن التراجع عن هذه الخطوة، ولا يمكن استعادة البيانات المحذوفة.',
    confirmLabel: 'حذف الحساب',
    cancelLabel: 'الاحتفاظ بحسابي',
    requirePassword: true,
    passwordLabel: 'أكّد كلمة المرور للمتابعة',
  });

  if (!password) return;

  const button = $('#deleteAccountBtn');
  setActionButtonLoading(button, true, 'جارٍ حذف الحساب…');

  try {
    const user = state.user;
    const { error: verifyError } = await supabaseClient.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (verifyError) {
      showToast('كلمة المرور غير صحيحة. لم يتم حذف الحساب.', { type: 'error' });
      return;
    }

    const { error } = await supabaseClient.rpc('delete_own_account');
    if (error) throw error;

    try {
      localStorage.removeItem(`${VIEW_KEY_PREFIX}${user.id}`);
      localStorage.removeItem(`${SORT_KEY_PREFIX}${user.id}`);
      if (normalizeEmail(getRememberedEmail()) === normalizeEmail(user.email)) {
        localStorage.removeItem(LAST_EMAIL_KEY);
      }
    } catch {
      /* ignore local preference cleanup errors */
    }

    try {
      await supabaseClient.auth.signOut({ scope: 'local' });
    } catch {
      /* the auth user is already deleted */
    }

    state.sessionGeneration += 1;
    await forceCloseAllOverlays();
    clearToasts();
    state.user = null;
    state.notes = [];
    state.filter = 'all';
    state.tagFilter = null;
    state.query = '';
    state.renderedOnce = false;
    resetEditorState();
    document.title = 'ملاحظاتي — مساحة آمنة لأفكارك';
    showAuthView({ tab: 'login', resetForms: true });
    showToast('تم حذف حسابك وجميع بياناتك نهائيًا.', { type: 'success' });
  } catch (error) {
    console.warn('Account deletion failed:', error);
    showToast(
      dataErrorMessage(error, 'تعذّر حذف الحساب. تأكد من تنفيذ ملف إعداد قاعدة البيانات.'),
      { type: 'error' }
    );
  } finally {
    setActionButtonLoading(button, false);
    if (state.user) updateSettingsSummary();
  }
}

function confirmDialog(options = {}) {
  const {
    title = 'هل أنت متأكد؟',
    message = '',
    confirmLabel = 'تأكيد',
    cancelLabel = 'إلغاء',
    requirePassword = false,
    passwordLabel = 'أدخل كلمة المرور للتأكيد',
  } = options;

  const overlay = $('#confirmOverlay');
  const titleNode = $('#confirmTitle');
  const textNode = $('#confirmText');
  const extra = $('#confirmExtra');
  const okButton = $('#confirmOk');
  const cancelButton = $('#confirmCancel');
  if (!overlay || !okButton || !cancelButton || !extra) return Promise.resolve(null);
  if (!overlay.hidden) return Promise.resolve(null);

  if (titleNode) titleNode.textContent = title;
  if (textNode) textNode.textContent = message;
  okButton.textContent = confirmLabel;
  cancelButton.textContent = cancelLabel;
  extra.replaceChildren();
  extra.hidden = !requirePassword;

  let input = null;
  if (requirePassword) {
    const field = el('label', 'field');
    const label = el('span', 'field-label', passwordLabel);
    const control = el('span', 'field-control');
    const icon = svgIcon('lock', 'field-icon icon');
    input = el('input');
    input.type = 'password';
    input.autocomplete = 'current-password';
    input.placeholder = '••••••••';
    input.required = true;
    input.id = 'confirmPasswordInput';
    const error = el('span', 'field-error');
    control.append(icon, input);
    field.append(label, control, error);
    extra.append(field);
  }

  return new Promise((resolve) => {
    let outcome = null;

    const finish = () => {
      closeOverlay(overlay);
    };

    const submit = () => {
      if (requirePassword) {
        if (!input || !input.value) {
          if (input) setFieldError(input, 'أدخل كلمة المرور للمتابعة.');
          input && input.focus();
          return;
        }
        outcome = input.value;
      } else {
        outcome = true;
      }
      finish();
    };

    okButton.onclick = submit;
    cancelButton.onclick = () => {
      outcome = null;
      finish();
    };

    if (input) {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          submit();
        }
      });
      input.addEventListener('input', () => clearFieldError(input));
    }

    openOverlay(overlay, {
      initialFocus: input || okButton,
      onClose: () => resolve(outcome),
    });
  });
}

// == BOOTSTRAP ==

let eventsBound = false;

function focusSearch() {
  if (!state.user) return;
  closeSidebar();
  const input = $('#searchInput');
  if (!input) return;
  input.focus();
  input.select();
}

function isTypingTarget(target) {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function handleGlobalKeydown(event) {
  if (event.key === 'Tab' && overlayStack.length) {
    const overlay = overlayStack[overlayStack.length - 1].overlay;
    const focusables = getFocusable(overlay);
    if (!focusables.length) {
      event.preventDefault();
      if (typeof overlay.focus === 'function') overlay.focus();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || !overlay.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !overlay.contains(active)) {
      event.preventDefault();
      first.focus();
    }
    return;
  }

  if (event.key === 'Tab' && !overlayStack.length && document.body.classList.contains('sidebar-open')) {
    const sidebar = $('#sidebar');
    if (sidebar) {
      const focusables = getFocusable(sidebar);
      if (!focusables.length) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        if (active === first || !sidebar.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !sidebar.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    }
    return;
  }

  if (event.key === 'Escape') {
    if (overlayStack.length) {
      event.preventDefault();
      closeTopOverlay();
      return;
    }
    if (document.body.classList.contains('sidebar-open')) {
      closeSidebar();
      return;
    }
    const search = $('#searchInput');
    if (document.activeElement === search && search.value) {
      event.preventDefault();
      clearSearch();
      return;
    }
    closeSidebar();
    return;
  }

  const meta = event.ctrlKey || event.metaKey;
  if (meta && event.key.toLowerCase() === 'k') {
    if (!state.user) return;
    event.preventDefault();
    if (overlayStack.length) return;
    focusSearch();
    return;
  }

  if (!state.user || overlayStack.length) return;
  if (isTypingTarget(event.target) || event.altKey || meta) return;

  if (event.key.toLowerCase() === 'n') {
    event.preventDefault();
    closeSidebar();
    openEditor(null);
  } else if (event.key === '/') {
    event.preventDefault();
    focusSearch();
  }
}

function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;

  /* Auth */
  $$('[data-auth-tab]').forEach((button) => {
    button.addEventListener('click', () => setAuthTab(button.dataset.authTab));
  });
  $('#loginForm')?.addEventListener('submit', handleLoginSubmit);
  $('#registerForm')?.addEventListener('submit', handleRegisterSubmit);
  $('#registerPassword')?.addEventListener('input', updatePasswordStrength);

  document.addEventListener('click', (event) => {
    const reveal = event.target.closest('[data-reveal]');
    if (reveal) togglePasswordVisibility(reveal);
  });

  document.addEventListener('input', (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.closest('.field-control')) {
      clearFieldError(input);
    }
  });

  /* Theme */
  $('#authThemeBtn')?.addEventListener('click', toggleTheme);
  $('#themeBtn')?.addEventListener('click', toggleTheme);
  $$('.theme-option').forEach((button) => {
    button.addEventListener('click', () => applyTheme(button.dataset.themeChoice));
  });

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemTheme = () => {
    if (state.themeMode === 'system') applyTheme('system', { persist: false });
  };
  if (typeof media.addEventListener === 'function') media.addEventListener('change', handleSystemTheme);
  else if (typeof media.addListener === 'function') media.addListener(handleSystemTheme);

  /* Sidebar & navigation */
  $('#menuBtn')?.addEventListener('click', toggleSidebar);
  $('#sidebarBackdrop')?.addEventListener('click', closeSidebar);
  $('#menuBtn')?.setAttribute('aria-expanded', 'false');

  $$('.nav-item[data-filter]').forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });

  $('#tagList')?.addEventListener('click', (event) => {
    const button = event.target.closest('.tag-item');
    if (!button) return;
    const tag = button.dataset.tag;
    if (state.tagFilter === tag) {
      state.tagFilter = null;
    } else {
      state.tagFilter = tag;
      state.filter = 'all';
    }
    state.query = '';
    const search = $('#searchInput');
    if (search) search.value = '';
    updateSearchClear();
    renderAll();
    closeSidebar();
  });

  $('#clearTagFilter')?.addEventListener('click', clearTagFilter);
  $('#newNoteBtn')?.addEventListener('click', () => {
    closeSidebar();
    openEditor(null);
  });
  $('#newNoteBtn2')?.addEventListener('click', () => {
    closeSidebar();
    openEditor(null);
  });
  $('#fabNewNote')?.addEventListener('click', () => {
    closeSidebar();
    openEditor(null);
  });
  $('#emptyActionBtn')?.addEventListener('click', handleEmptyAction);

  /* Search, sort, view */
  const searchInput = $('#searchInput');
  searchInput?.addEventListener('input', (event) => {
    state.query = event.target.value;
    updateSearchClear();
    renderAll();
  });
  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      if (event.target.value) clearSearch();
      else event.target.blur();
    }
  });
  $('#searchClear')?.addEventListener('click', () => clearSearch());

  $('#sortSelect')?.addEventListener('change', (event) => {
    applySort(event.target.value);
    renderAll();
  });

  $$('.view-btn').forEach((button) => {
    button.addEventListener('click', () => applyView(button.dataset.view));
  });

  /* Notes grid */
  const grid = $('#notesGrid');
  grid?.addEventListener('click', (event) => {
    const card = event.target.closest('.note');
    if (!card) return;
    const actionButton = event.target.closest('.note-action');
    if (actionButton) {
      event.stopPropagation();
      handleNoteAction(actionButton.dataset.action, card.dataset.id, actionButton);
      return;
    }
    if (card.dataset.corrupted === 'true') {
      showToast('هذه الملاحظة تالفة ولا يمكن فتحها. يمكنك حذفها من القائمة.', { type: 'error' });
      return;
    }
    if (card.classList.contains('is-trashed')) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) return;
    const note = state.notes.find((item) => item.id === card.dataset.id);
    if (note) openEditor(note);
  });

  grid?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.note');
    if (!card || event.target.closest('button')) return;
    event.preventDefault();
    if (card.dataset.corrupted === 'true' || card.classList.contains('is-trashed')) return;
    const note = state.notes.find((item) => item.id === card.dataset.id);
    if (note) openEditor(note);
  });

  /* User menu & settings */
  ['#settingsBtn', '#userMenuBtn', '#topbarAvatar'].forEach((selector) => {
    $(selector)?.addEventListener('click', () => openSettings('profile'));
  });
  $('#logoutBtn')?.addEventListener('click', () => logout());
  $('#settingsLogoutBtn')?.addEventListener('click', () => logout());
  $('#settingsCloseBtn')?.addEventListener('click', () => closeOverlay($('#settingsOverlay')));
  $('#settingsOverlay')?.addEventListener('click', (event) => {
    if (event.target === $('#settingsOverlay')) closeOverlay($('#settingsOverlay'));
  });
  $$('.settings-tab').forEach((button) => {
    button.addEventListener('click', () => setSettingsTab(button.dataset.settingsTab));
  });
  $('#profileForm')?.addEventListener('submit', handleProfileSave);
  $('#passwordForm')?.addEventListener('submit', handlePasswordChange);
  $('#exportBtn')?.addEventListener('click', exportNotes);
  $('#deleteAccountBtn')?.addEventListener('click', deleteAccountFlow);

  /* Editor */
  const editorOverlay = $('#editorOverlay');
  $('#editorCloseBtn')?.addEventListener('click', () => closeOverlay(editorOverlay));
  $('#editorDoneBtn')?.addEventListener('click', () => closeOverlay(editorOverlay));
  editorOverlay?.addEventListener('click', (event) => {
    if (event.target === editorOverlay) closeOverlay(editorOverlay);
  });

  const titleInput = $('#noteTitleInput');
  const contentInput = $('#noteContentInput');
  const tagInput = $('#tagInput');

  titleInput?.addEventListener('input', (event) => {
    if (!state.editor.open) return;
    state.editor.draft.title = event.target.value;
    markEditorDirty('content');
  });
  titleInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      contentInput?.focus();
    }
  });

  contentInput?.addEventListener('input', (event) => {
    if (!state.editor.open) return;
    state.editor.draft.content = event.target.value;
    markEditorDirty('content');
  });

  tagInput?.addEventListener('keydown', (event) => {
    if (!state.editor.open) return;
    if (event.key === 'Enter' || event.key === ',' || event.key === '،') {
      event.preventDefault();
      commitTagInput();
    } else if (event.key === 'Backspace' && !tagInput.value) {
      const tags = state.editor.draft.tags;
      if (tags.length) {
        event.preventDefault();
        removeEditorTag(tags[tags.length - 1]);
      }
    } else if (event.key === 'Escape' && tagInput.value) {
      event.preventDefault();
      event.stopPropagation();
      tagInput.value = '';
    }
  });
  tagInput?.addEventListener('input', () => {
    if (tagInput.value.includes(',') || tagInput.value.includes('،')) {
      commitTagInput();
    }
  });
  tagInput?.addEventListener('blur', () => {
    if (state.editor.open && tagInput.value.trim()) commitTagInput();
  });
  $('#tagEditor')?.addEventListener('click', (event) => {
    if (event.target.closest('.editor-tag-remove')) return;
    tagInput?.focus();
  });

  $('#colorPicker')?.addEventListener('click', (event) => {
    const button = event.target.closest('.color-dot');
    if (!button || !state.editor.open) return;
    if (state.editor.draft.color === button.dataset.color) return;
    state.editor.draft.color = button.dataset.color;
    updateEditorColorPicker();
    markEditorDirty('meta');
  });

  $('#editorPinBtn')?.addEventListener('click', () => {
    if (!state.editor.open) return;
    state.editor.meta.pinned = !state.editor.meta.pinned;
    updateEditorChrome();
    markEditorDirty('meta');
  });
  $('#editorFavBtn')?.addEventListener('click', () => {
    if (!state.editor.open) return;
    state.editor.meta.favorite = !state.editor.meta.favorite;
    updateEditorChrome();
    markEditorDirty('meta');
  });
  $('#editorArchiveBtn')?.addEventListener('click', archiveFromEditor);
  $('#editorDeleteBtn')?.addEventListener('click', deleteFromEditor);

  $('#editorPanel')?.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      if (!state.editor.open) return;
      commitTagInput();
      saveEditor();
    }
  });

  /* Global keyboard */
  document.addEventListener('keydown', handleGlobalKeydown);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeSidebar();
  });

  window.addEventListener('beforeunload', (event) => {
    const pendingTag = $('#tagInput')?.value.trim();
    if (state.editor.open && (state.editor.dirty || state.editor.saving || pendingTag)) {
      event.preventDefault();
      event.returnValue = '';
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && state.editor.open) {
      const pending = $('#tagInput');
      if (pending && pending.value.trim()) commitTagInput();
      if (state.editor.dirty) saveEditor({ silent: true });
    }
  });
}

async function init() {
  hydrateIcons();
  buildColorPicker();
  applyTheme(getPreferredThemeMode(), { persist: false });
  bindEvents();

  const panel = $('#editorPanel');
  if (panel) panel.tabIndex = -1;

  const loginEmail = $('#loginEmail');
  if (loginEmail) loginEmail.value = getRememberedEmail();
  setAuthTab('login', { focus: false });

  let restored = false;
  if (cloudReady()) {
    try {
      restored = await restoreSession();
    } catch (error) {
      console.warn('Initial session check failed.', error);
    }
  }

  if (!restored) {
    showAuthView({ tab: 'login' });
  }

  hideBootScreen();

  window.setTimeout(() => {
    if (!cloudReady()) {
      showToast(
        'تعذّر تهيئة الاتصال بـ Supabase. تحقق من تحميل مكتبة Supabase وإعدادات المشروع.',
        { type: 'error', duration: 8000 }
      );
    }
  }, 700);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}





