export const DB_NAME = "rota-db";
export const DB_VERSION = 3;

export const STORE_NAMES = {
  userProfile: "userProfile",
  subjects: "subjects",
  topics: "topics",
  studyTasks: "studyTasks",
  studySessions: "studySessions",
  examResults: "examResults",
  mistakeRecords: "mistakeRecords",
  reviewItems: "reviewItems",
} as const;

export type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];

let dbPromise: Promise<IDBDatabase> | null = null;

function createStores(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains(STORE_NAMES.userProfile)) {
    db.createObjectStore(STORE_NAMES.userProfile, { keyPath: "id" });
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.subjects)) {
    const store = db.createObjectStore(STORE_NAMES.subjects, { keyPath: "id" });
    store.createIndex("examType", "examType");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.topics)) {
    const store = db.createObjectStore(STORE_NAMES.topics, { keyPath: "id" });
    store.createIndex("subjectId", "subjectId");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.studyTasks)) {
    const store = db.createObjectStore(STORE_NAMES.studyTasks, { keyPath: "id" });
    store.createIndex("date", "date");
    store.createIndex("subjectId", "subjectId");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.studySessions)) {
    const store = db.createObjectStore(STORE_NAMES.studySessions, { keyPath: "id" });
    store.createIndex("date", "date");
    store.createIndex("taskId", "taskId");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.examResults)) {
    const store = db.createObjectStore(STORE_NAMES.examResults, { keyPath: "id" });
    store.createIndex("date", "date");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.mistakeRecords)) {
    const store = db.createObjectStore(STORE_NAMES.mistakeRecords, { keyPath: "id" });
    store.createIndex("examId", "examId");
    store.createIndex("status", "status");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.reviewItems)) {
    const store = db.createObjectStore(STORE_NAMES.reviewItems, { keyPath: "id" });
    store.createIndex("mistakeId", "mistakeId");
    store.createIndex("scheduledDate", "scheduledDate");
    store.createIndex("status", "status");
  }
}

export function getDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => createStores(request.result);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB açılamadı."));
    });
  }

  return dbPromise;
}

export async function runTransaction<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  executor: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await getDb();

  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = executor(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB işlemi başarısız oldu."));
  });
}
