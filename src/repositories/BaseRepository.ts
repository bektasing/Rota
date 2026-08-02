import { runTransaction, type StoreName } from "@/repositories/db";

export interface Identifiable {
  id: string;
}

export class BaseRepository<T extends Identifiable> {
  constructor(protected readonly storeName: StoreName) {}

  getAll(): Promise<T[]> {
    return runTransaction<T[]>(this.storeName, "readonly", (store) => store.getAll() as IDBRequest<T[]>);
  }

  getById(id: string): Promise<T | undefined> {
    return runTransaction<T | undefined>(this.storeName, "readonly", (store) =>
      store.get(id) as IDBRequest<T | undefined>,
    );
  }

  async add(item: T): Promise<T> {
    await runTransaction<IDBValidKey>(this.storeName, "readwrite", (store) => store.add(item));
    return item;
  }

  async put(item: T): Promise<T> {
    await runTransaction<IDBValidKey>(this.storeName, "readwrite", (store) => store.put(item));
    return item;
  }

  remove(id: string): Promise<void> {
    return runTransaction<void>(this.storeName, "readwrite", (store) => store.delete(id) as IDBRequest<void>);
  }

  clear(): Promise<void> {
    return runTransaction<void>(this.storeName, "readwrite", (store) => store.clear() as IDBRequest<void>);
  }
}
