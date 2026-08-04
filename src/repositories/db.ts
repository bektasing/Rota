export const DB_NAME = "rota-db";
export const DB_VERSION = 4;

export const STORE_NAMES = {
  userProfile: "userProfile",
  subjects: "subjects",
  topics: "topics",
  studyTasks: "studyTasks",
  studySessions: "studySessions",
  examResults: "examResults",
  mistakeRecords: "mistakeRecords",
  reviewItems: "reviewItems",
  goals: "goals",
  studyResources: "studyResources",
  studyNotes: "studyNotes",
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

  if (!db.objectStoreNames.contains(STORE_NAMES.goals)) {
    const store = db.createObjectStore(STORE_NAMES.goals, { keyPath: "id" });
    store.createIndex("status", "status");
    store.createIndex("endDate", "endDate");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.studyResources)) {
    const store = db.createObjectStore(STORE_NAMES.studyResources, { keyPath: "id" });
    store.createIndex("status", "status");
    store.createIndex("subjectId", "subjectId");
  }

  if (!db.objectStoreNames.contains(STORE_NAMES.studyNotes)) {
    const store = db.createObjectStore(STORE_NAMES.studyNotes, { keyPath: "id" });
    store.createIndex("subjectId", "subjectId");
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

/**
 * Birden fazla store üzerinde tek bir yazma transaction'ı çalıştırır.
 * Yedek geri yükleme gibi "ya hep ya hiç" işlemlerinde kullanılır: herhangi bir
 * adım hata verirse transaction geri alınır ve yarım yazılmış veri kalmaz.
 */
export async function runWriteTransaction(
  storeNames: StoreName[],
  executor: (getStore: (name: StoreName) => IDBObjectStore) => void,
): Promise<void> {
  const db = await getDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeNames, "readwrite");

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB işlemi başarısız oldu."));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB işlemi geri alındı."));

    try {
      executor((name) => tx.objectStore(name));
    } catch (error) {
      tx.abort();
      reject(error);
    }
  });
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
    let result!: T;

    request.onsuccess = () => {
      result = request.result;
    };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB işlemi başarısız oldu."));

    // Yazma işlemi ancak transaction commit olduğunda kalıcıdır; isteğin başarılı
    // olması yetmez (transaction sonradan abort olursa yazma geri alınır).
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB işlemi başarısız oldu."));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB işlemi geri alındı."));
  });
}
