// Armazenamento local (IndexedDB): motos + fotos (blobs). Tudo fica no aparelho.
const DB_NAME = 'garagem';
const DB_VERSION = 1;
let dbPromise;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('motos')) db.createObjectStore('motos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('fotos')) db.createObjectStore('fotos', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let result;
    Promise.resolve(fn(s)).then((r) => { result = r; });
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const db = {
  async listMotos() {
    const all = await tx('motos', 'readonly', (s) => reqP(s.getAll()));
    return all.sort((a, b) => (b.dataEntrada || '').localeCompare(a.dataEntrada || '') || b.criadoEm - a.criadoEm);
  },
  getMoto: (id) => tx('motos', 'readonly', (s) => reqP(s.get(id))),
  async saveMoto(m) {
    m.atualizadoEm = Date.now();
    if (!m.criadoEm) m.criadoEm = m.atualizadoEm;
    await tx('motos', 'readwrite', (s) => { s.put(m); });
    return m;
  },
  async deleteMoto(id) {
    const m = await this.getMoto(id);
    if (!m) return;
    const fotoIds = [...(m.fotos || []), m.fichaFoto].filter(Boolean);
    await tx('fotos', 'readwrite', (s) => fotoIds.forEach((f) => s.delete(f)));
    await tx('motos', 'readwrite', (s) => { s.delete(id); });
  },
  async putFoto(blob) {
    const id = uid();
    await tx('fotos', 'readwrite', (s) => { s.put({ id, blob }); });
    return id;
  },
  async getFoto(id) {
    const r = await tx('fotos', 'readonly', (s) => reqP(s.get(id)));
    return r ? r.blob : null;
  },
  deleteFoto: (id) => tx('fotos', 'readwrite', (s) => { s.delete(id); }),
  async exportAll() {
    const motos = await tx('motos', 'readonly', (s) => reqP(s.getAll()));
    const fotos = await tx('fotos', 'readonly', (s) => reqP(s.getAll()));
    const fotosB64 = await Promise.all(fotos.map(async (f) => ({ id: f.id, data: await blobToDataURL(f.blob) })));
    return { app: 'garagem', versao: 1, exportadoEm: new Date().toISOString(), motos, fotos: fotosB64 };
  },
  async importAll(data) {
    if (!data || data.app !== 'garagem') throw new Error('Arquivo de backup inválido');
    const fotos = await Promise.all(data.fotos.map(async (f) => ({ id: f.id, blob: await (await fetch(f.data)).blob() })));
    await tx('fotos', 'readwrite', (s) => fotos.forEach((f) => s.put(f)));
    await tx('motos', 'readwrite', (s) => data.motos.forEach((m) => s.put(m)));
  },
  async clearAll() {
    await tx('fotos', 'readwrite', (s) => { s.clear(); });
    await tx('motos', 'readwrite', (s) => { s.clear(); });
  },
};

export function blobToDataURL(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}

// Reduz a foto (câmera do celular gera 4–12 MB) para no máx. `max` px, JPEG.
export async function compressImage(file, max = 1600, quality = 0.82) {
  const bmp = await createImageBitmap(file).catch(() => null);
  let w, h, src;
  if (bmp) { w = bmp.width; h = bmp.height; src = bmp; }
  else {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();
    w = img.naturalWidth; h = img.naturalHeight; src = img;
  }
  const scale = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
}
