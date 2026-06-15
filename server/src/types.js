/**
 * JSDoc types for mock data shape (no TS on server by design — minimal).
 * @typedef {{ id: string; name: string; matterId: string; clientRef?: string; openedAt: string; explorerDefaultFolderId?: string }} Matter
 * @typedef {{ id: string; name: string; matterId: string; parentId: string | null; children?: FolderNode[] }} FolderNode
 * @typedef {{ id: string; matterId: string; folderId: string; fileName: string; uploadedAt: string; categoryLabel: string; status: 'pending' | 'reviewed' | 'flagged'; mimeType: string; sizeBytes: number; storagePath?: string; previewText?: string }} DocumentRecord
 * @typedef {{ id: string; matterId: string; kind: 'upload' | 'review' | 'flag' | 'folder' | 'comment'; message: string; occurredAt: string; actorLabel?: string }} ActivityItem
 * @typedef {'green'|'amber'|'red'} DiligenceFlag
 * @typedef {{ documentId: string; matterId: string; diligenceFlag: DiligenceFlag|null; summary: string; pertinentNotes: string; updatedAt: string }} DocumentReview
 */

export {};
