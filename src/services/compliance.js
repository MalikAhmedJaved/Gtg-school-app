// Compliance service — employee credentialing document management.
//
// This module is the single point the UI talks to for compliance data.
// Today it returns mock data with a simulated network delay. When the
// PPEC backend is ready, swap the bodies of these functions for axios
// calls against the real API. The public function signatures must stay
// the same so no screen code needs to change.
//
// Planned backend endpoints (for reference when wiring real API):
//   GET    /api/compliance/my-documents
//   GET    /api/compliance/documents/:id
//   GET    /api/compliance/documents/:id/history
//   POST   /api/compliance/documents/:id/upload   (multipart or presigned-URL flow)
//   POST   /api/compliance/documents              (create new doc for a type)

import {
  COMPLIANCE_DOCUMENT_TYPES,
  COMPLIANCE_CATEGORIES,
  MOCK_EMPLOYEE_DOCUMENTS,
  MOCK_DOCUMENT_HISTORY,
  getComplianceDocumentType,
} from '../utils/mockData';

// In-memory copies so upload calls mutate and subsequent reads see the change.
let documents = [...MOCK_EMPLOYEE_DOCUMENTS];
let history = JSON.parse(JSON.stringify(MOCK_DOCUMENT_HISTORY));

const FAKE_LATENCY_MS = 450;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DAYS_MS = 1000 * 60 * 60 * 24;
const EXPIRING_SOON_DAYS = 30;

// Compute the visible status of a document from its approval + expiration.
// Returns one of: 'missing' | 'pending' | 'rejected' | 'expired' |
//                 'expiring_soon' | 'valid' | 'no_expiry'
export function computeStatus(doc, docType) {
  if (!doc) return 'missing';
  if (doc.approvalStatus === 'pending') return 'pending';
  if (doc.approvalStatus === 'rejected') return 'rejected';
  // approved from here on
  if (!doc.expiresAt || docType?.renewalMonths === null) return 'no_expiry';
  const daysLeft = Math.floor((new Date(doc.expiresAt) - new Date()) / DAYS_MS);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= EXPIRING_SOON_DAYS) return 'expiring_soon';
  return 'valid';
}

// Human-readable status metadata for the UI.
export const STATUS_META = {
  missing: { label: 'Missing', color: '#B7791F', bg: '#FEFCBF' },
  pending: { label: 'Pending Approval', color: '#2980B9', bg: '#EBF5FB' },
  rejected: { label: 'Rejected', color: '#7B341E', bg: '#FED7D7' },
  expired: { label: 'Expired', color: '#C53030', bg: '#FED7D7' },
  expiring_soon: { label: 'Expiring Soon', color: '#B7791F', bg: '#FEFCBF' },
  valid: { label: 'Valid', color: '#276749', bg: '#C6F6D5' },
  no_expiry: { label: 'On File', color: '#276749', bg: '#C6F6D5' },
};

// ─── PUBLIC API ────────────────────────────────────────────────

// Build the full compliance picture for the current user. Every document
// *type* the employee is required to have shows up in the list — even
// the ones that don't have an upload yet (those come back as 'missing').
export async function getMyDocuments() {
  await sleep(FAKE_LATENCY_MS);

  return COMPLIANCE_DOCUMENT_TYPES.map((type) => {
    const doc = documents.find((d) => d.typeId === type.id) || null;
    const status = computeStatus(doc, type);
    return {
      type,
      category: COMPLIANCE_CATEGORIES[type.category],
      document: doc,
      status,
    };
  });
}

export async function getDocumentById(id) {
  await sleep(FAKE_LATENCY_MS);
  const doc = documents.find((d) => d.id === id);
  if (!doc) return null;
  const type = getComplianceDocumentType(doc.typeId);
  return {
    type,
    category: COMPLIANCE_CATEGORIES[type.category],
    document: doc,
    status: computeStatus(doc, type),
  };
}

export async function getDocumentByTypeId(typeId) {
  await sleep(FAKE_LATENCY_MS);
  const type = getComplianceDocumentType(typeId);
  if (!type) return null;
  const doc = documents.find((d) => d.typeId === typeId) || null;
  return {
    type,
    category: COMPLIANCE_CATEGORIES[type.category],
    document: doc,
    status: computeStatus(doc, type),
  };
}

export async function getDocumentHistory(docId) {
  await sleep(FAKE_LATENCY_MS / 2);
  return history[docId] || [];
}

// Simulate an upload. Real implementation will:
//   1. Ask backend for a presigned S3 PUT URL
//   2. PUT the file bytes to S3
//   3. POST a completion event to /api/compliance/documents with the S3 key
// The UI doesn't need to know any of that — just call uploadDocument().
export async function uploadDocument(typeId, fileInfo) {
  await sleep(FAKE_LATENCY_MS * 2);

  const type = getComplianceDocumentType(typeId);
  if (!type) throw new Error('Unknown document type');

  const now = new Date();
  const expiresAt =
    type.renewalMonths === null
      ? null
      : new Date(now.getFullYear(), now.getMonth() + type.renewalMonths, now.getDate()).toISOString();

  const existingIdx = documents.findIndex((d) => d.typeId === typeId);
  const docId = existingIdx >= 0 ? documents[existingIdx].id : `doc-${Date.now()}`;

  const newDoc = {
    id: docId,
    typeId,
    fileName: fileInfo?.fileName || 'uploaded_document.pdf',
    uploadedAt: now.toISOString(),
    expiresAt,
    approvalStatus: 'pending',
    approvedBy: null,
    approvedAt: null,
    notes: null,
  };

  if (existingIdx >= 0) {
    documents[existingIdx] = newDoc;
  } else {
    documents.push(newDoc);
  }

  const newHistory = history[docId] ? [...history[docId]] : [];
  newHistory.unshift({
    id: `h-${Date.now()}`,
    event: 'uploaded',
    actor: 'You',
    timestamp: now.toISOString(),
    notes: null,
  });
  history[docId] = newHistory;

  return {
    type,
    category: COMPLIANCE_CATEGORIES[type.category],
    document: newDoc,
    status: computeStatus(newDoc, type),
  };
}

// Summary stats for the list header.
export async function getComplianceSummary() {
  const all = await getMyDocuments();
  const counts = {
    total: all.length,
    valid: 0,
    expiring_soon: 0,
    expired: 0,
    pending: 0,
    rejected: 0,
    missing: 0,
    no_expiry: 0,
  };
  for (const item of all) counts[item.status] = (counts[item.status] || 0) + 1;
  counts.needsAttention =
    counts.expired + counts.expiring_soon + counts.rejected + counts.missing;
  return counts;
}

// Reset helper for tests / demos (not exported to UI).
export function __resetMockState() {
  documents = [...MOCK_EMPLOYEE_DOCUMENTS];
  history = JSON.parse(JSON.stringify(MOCK_DOCUMENT_HISTORY));
}
