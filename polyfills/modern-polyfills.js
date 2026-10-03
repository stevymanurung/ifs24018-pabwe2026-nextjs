/**
 * Pengganti polyfill bawaan Next.js (polyfill-module).
 *
 * Bawaan Next menambahkan polyfill untuk trimStart, flat/flatMap, Object.fromEntries,
 * Array.prototype.at, Object.hasOwn, dst. Seluruhnya sudah tersedia secara native
 * pada browser modern yang ditarget (Chrome/Edge 111+, Firefox 111+, Safari 16.4+),
 * sehingga Lighthouse menandainya sebagai "Legacy JavaScript".
 * Hanya URL.canParse yang masih belum ada di sebagian browser tersebut, jadi
 * hanya itu yang dipertahankan.
 */
if (typeof URL !== 'undefined' && typeof URL.canParse !== 'function') {
  URL.canParse = function canParse(url, base) {
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  };
}
