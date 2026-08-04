/**
 * Açık form panelleri/onay pencereleri Android donanım geri tuşunu önce kendileri
 * yakalayıp kapanabilsin diye kayıt olur. En son açılan en üstte olacak şekilde
 * basit bir yığın tutulur; sayfa geçmişi veya global state ile karışmaz.
 */
const stack: Array<() => void> = [];

export function pushBackHandler(onBack: () => void): () => void {
  stack.push(onBack);
  return () => {
    const index = stack.lastIndexOf(onBack);
    if (index !== -1) {
      stack.splice(index, 1);
    }
  };
}

/** En üstteki paneli kapatır. Bir panel kapatıldıysa true döner. */
export function consumeNativeBack(): boolean {
  const handler = stack[stack.length - 1];
  if (!handler) return false;
  handler();
  return true;
}
