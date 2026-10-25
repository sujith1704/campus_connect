const admin = require('firebase-admin');
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue: AdminFieldValue, Timestamp: AdminTimestamp } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Auto-load environment variables from all possible locations
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '..', '.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'backend', '.env'),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

let db = null;
let FieldValue = AdminFieldValue;
let Timestamp = AdminTimestamp;

/**
 * In-Memory Development / Offline Firestore Adapter
 * Used when no Cloud credentials or emulator are configured so local development and testing never crash.
 */
class MemoryDocRef {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id;
  }

  async get() {
    const data = this.collection.store.get(this.id);
    return {
      id: this.id,
      exists: data !== undefined,
      data: () => (data ? JSON.parse(JSON.stringify(data)) : undefined),
    };
  }

  async set(data, options = {}) {
    const existing = this.collection.store.get(this.id) || {};
    const merged = options.merge ? { ...existing } : {};

    for (const [key, val] of Object.entries(data)) {
      if (val && val.__type === 'increment') {
        merged[key] = (typeof merged[key] === 'number' ? merged[key] : 0) + val.value;
      } else if (val && val.__type === 'serverTimestamp') {
        merged[key] = new Date();
      } else {
        merged[key] = val;
      }
    }
    this.collection.store.set(this.id, merged);
    if (this.collection.db && typeof this.collection.db.save === 'function') {
      this.collection.db.save();
    }
    return { writeTime: new Date() };
  }

  async update(data) {
    return this.set(data, { merge: true });
  }

  async delete() {
    this.collection.store.delete(this.id);
    if (this.collection.db && typeof this.collection.db.save === 'function') {
      this.collection.db.save();
    }
    return { writeTime: new Date() };
  }
}

class MemoryQuery {
  constructor(collection, filters = [], sorts = [], maxLimit = null) {
    this.collection = collection;
    this.filters = filters;
    this.sorts = sorts;
    this.maxLimit = maxLimit;
  }

  where(field, op, val) {
    return new MemoryQuery(this.collection, [...this.filters, { field, op, val }], this.sorts, this.maxLimit);
  }

  orderBy(field, dir = 'asc') {
    return new MemoryQuery(this.collection, this.filters, [...this.sorts, { field, dir: dir.toLowerCase() }], this.maxLimit);
  }

  limit(n) {
    return new MemoryQuery(this.collection, this.filters, this.sorts, n);
  }

  async get() {
    let docs = [];
    for (const [id, data] of this.collection.store.entries()) {
      let matches = true;
      for (const filter of this.filters) {
        // Resolve nested fields like 'organizer._id'
        const parts = filter.field.split('.');
        let current = data;
        for (const part of parts) {
          current = current ? current[part] : undefined;
        }

        if (filter.op === '==') {
          if (current !== filter.val) matches = false;
        } else if (filter.op === '!=') {
          if (current === filter.val) matches = false;
        } else if (filter.op === 'in') {
          if (!Array.isArray(filter.val) || !filter.val.includes(current)) matches = false;
        } else if (filter.op === 'array-contains') {
          if (!Array.isArray(current) || !current.includes(filter.val)) matches = false;
        } else if (filter.op === '>=') {
          if (!(current >= filter.val)) matches = false;
        } else if (filter.op === '<=') {
          if (!(current <= filter.val)) matches = false;
        }
        if (!matches) break;
      }

      if (matches) {
        docs.push({
          id,
          exists: true,
          data: () => JSON.parse(JSON.stringify(data)),
        });
      }
    }

    // Apply sorting
    for (const sort of this.sorts) {
      docs.sort((a, b) => {
        const valA = a.data()[sort.field];
        const valB = b.data()[sort.field];
        if (valA === valB) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        const comp = valA > valB ? 1 : -1;
        return sort.dir === 'desc' ? -comp : comp;
      });
    }

    if (typeof this.maxLimit === 'number') {
      docs = docs.slice(0, this.maxLimit);
    }

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length,
    };
  }
}

class MemoryCollection {
  constructor(name, db) {
    this.name = name;
    this.db = db;
    this.store = new Map();
  }

  doc(id) {
    const docId = id || 'doc_' + Math.random().toString(36).substring(2, 12);
    return new MemoryDocRef(this, docId);
  }

  async add(data) {
    const id = 'doc_' + Math.random().toString(36).substring(2, 12);
    const docRef = this.doc(id);
    await docRef.set(data);
    return docRef;
  }

  where(field, op, val) {
    return new MemoryQuery(this).where(field, op, val);
  }

  orderBy(field, dir) {
    return new MemoryQuery(this).orderBy(field, dir);
  }

  limit(n) {
    return new MemoryQuery(this).limit(n);
  }

  async get() {
    return new MemoryQuery(this).get();
  }
}

class MemoryFirestore {
  constructor(projectId) {
    this.projectId = projectId;
    this.collections = new Map();
    this.dbFile = path.join(__dirname, '..', '.dev_db.json');
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dbFile)) {
        const raw = JSON.parse(fs.readFileSync(this.dbFile, 'utf8'));
        for (const [colName, colData] of Object.entries(raw)) {
          const col = this.collection(colName);
          for (const [docId, docVal] of Object.entries(colData)) {
            col.store.set(docId, docVal);
          }
        }
      }
    } catch (e) {
      // Ignore initial load error
    }
  }

  save() {
    try {
      const serialized = {};
      for (const [colName, col] of this.collections.entries()) {
        serialized[colName] = {};
        for (const [docId, docVal] of col.store.entries()) {
          serialized[colName][docId] = docVal;
        }
      }
      fs.writeFileSync(this.dbFile, JSON.stringify(serialized, null, 2), 'utf8');
    } catch (e) {
      // Ignore write errors in development
    }
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new MemoryCollection(name, this));
    }
    return this.collections.get(name);
  }
}

const initFirebase = () => {
  if (getApps().length > 0) {
    return getFirestore();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'campus-connect-d357c';

  const candidateServiceAccountPaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    path.join(__dirname, '..', 'serviceAccountKey.json'),
    path.join(__dirname, '..', '..', 'serviceAccountKey.json'),
    path.join(process.cwd(), 'serviceAccountKey.json'),
    path.join(process.cwd(), 'backend', 'serviceAccountKey.json'),
  ].filter(Boolean);

  let hasExplicitCredentials = false;

  try {
    // Option 1: Explicit environment variables
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      let privateKey = String(process.env.FIREBASE_PRIVATE_KEY).trim();
      if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
        privateKey = privateKey.slice(1, -1);
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      initializeApp({
        credential: cert({
          projectId: projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim(),
          privateKey: privateKey,
        }),
      });
      hasExplicitCredentials = true;
      console.log('✅ Firebase Admin initialized with environment credentials for project:', projectId);
    }
    // Option 2: JSON string or base64 JSON in environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let rawJson = String(process.env.FIREBASE_SERVICE_ACCOUNT_KEY).trim();
      if (!rawJson.startsWith('{')) {
        try {
          rawJson = Buffer.from(rawJson, 'base64').toString('utf8');
        } catch (e) {
          // not base64
        }
      }
      const serviceAccount = JSON.parse(rawJson);
      initializeApp({
        credential: cert(serviceAccount),
      });
      hasExplicitCredentials = true;
      console.log('✅ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT_KEY for project:', serviceAccount.project_id || projectId);
    }
    // Option 3: Local or bundled service account file
    else {
      const foundPath = candidateServiceAccountPaths.find((p) => fs.existsSync(p));
      if (foundPath) {
        const serviceAccount = require(foundPath);
        initializeApp({
          credential: cert(serviceAccount),
        });
        hasExplicitCredentials = true;
        console.log('✅ Firebase Admin initialized with serviceAccountKey.json file at:', foundPath);
      }
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
  }

  // If cloud credentials were authenticated, use Google Cloud Firestore
  if (hasExplicitCredentials) {
    const firestore = getFirestore();
    try {
      firestore.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      // Ignore if already set
    }
    return firestore;
  }

  // In production or deployed environments, never fall back to an in-memory mock that drops events!
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error(`[Firebase Production Error] Live Cloud Firestore credentials for project ${projectId} are missing or invalid.`);
  }

  // Otherwise, fallback to local development in-memory Firestore engine for offline testing
  console.log(`ℹ️  Running with local development Firestore engine (Project: ${projectId})`);
  console.log('💡 To link live Cloud Firestore, supply FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY in backend/.env or serviceAccountKey.json');

  // Provide custom FieldValue & Timestamp handlers compatible with memory store
  FieldValue = {
    serverTimestamp: () => ({ __type: 'serverTimestamp' }),
    increment: (n) => ({ __type: 'increment', value: n }),
  };

  Timestamp = {
    now: () => ({ toDate: () => new Date(), toMillis: () => Date.now() }),
    fromDate: (d) => ({ toDate: () => d, toMillis: () => d.getTime() }),
  };

  return new MemoryFirestore(projectId);
};

db = initFirebase();

// Helpers for consistent frontend ID handling (_id and id)
const formatDoc = (doc) => {
  if (!doc || !doc.exists) return null;
  const data = typeof doc.data === 'function' ? doc.data() : doc;
  // Convert Firestore Timestamps to ISO strings or JS Dates for JSON compatibility
  const formatted = { ...data };
  for (const key of Object.keys(formatted)) {
    if (formatted[key] && typeof formatted[key].toDate === 'function') {
      formatted[key] = formatted[key].toDate();
    }
  }
  return {
    id: doc.id,
    _id: doc.id,
    ...formatted,
  };
};

const formatDocs = (querySnapshot) => {
  if (!querySnapshot || !Array.isArray(querySnapshot.docs)) return [];
  return querySnapshot.docs.map(formatDoc);
};

module.exports = {
  admin,
  db,
  FieldValue,
  Timestamp,
  formatDoc,
  formatDocs,
};
