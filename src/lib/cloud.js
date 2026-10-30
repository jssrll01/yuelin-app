// Same unsigned-upload pattern as XMARKET. The preset restricts formats and folder.
const CLOUD = 'bvw3okdf';
export const RECEIPT_PRESET = 'yuelin_vip';
export const RECEIPT_MAX_MB = 5;
const OK = ['image/jpeg', 'image/png', 'image/webp'];

export function checkReceipt(file) {
  if (!file) return 'Choose a receipt image.';
  if (!OK.includes(file.type)) return 'Use a JPG, PNG or WebP image.';
  if (file.size > RECEIPT_MAX_MB * 1024 * 1024) return 'The image must be under ' + RECEIPT_MAX_MB + ' MB.';
  return '';
}

export function uploadReceipt(file, onProgress) {
  return new Promise((resolve, reject) => {
    const bad = checkReceipt(file);
    if (bad) { reject(new Error(bad)); return; }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', RECEIPT_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/' + CLOUD + '/image/upload');
    xhr.timeout = 60000;
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100))); };
    xhr.onload = () => {
      let d = {};
      try { d = JSON.parse(xhr.responseText); } catch (e) { /* non-JSON reply */ }
      if (xhr.status >= 200 && xhr.status < 300 && d.secure_url && d.public_id) resolve({ url: d.secure_url, publicId: d.public_id });
      else reject(new Error((d.error && d.error.message) || 'Upload failed (' + xhr.status + ').'));
    };
    xhr.onerror = () => reject(new Error('Network error. Check your connection and retry.'));
    xhr.ontimeout = () => reject(new Error('The upload timed out. Please retry.'));
    xhr.send(fd);
  });
}
