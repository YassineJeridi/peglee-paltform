import axiosInstance from './axiosInstance';

export async function importContentFile(file, { dryRun }) {
  const form = new FormData();
  form.append('file', file);
  // validateStatus : un 422 porte le rapport d'erreurs, on veut le lire plutôt que lever.
  const { data } = await axiosInstance.post(`/admin/import?dryRun=${dryRun}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    validateStatus: (s) => s === 200 || s === 422,
  });
  return data; // { ok, message, errors: [{path,message}], summary: [{module,subModule,actions[]}] }
}

export async function downloadImportTemplate() {
  const { data } = await axiosInstance.get('/admin/import/template', { responseType: 'blob' });
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modele-import-contenu.json';
  a.click();
  URL.revokeObjectURL(url);
}
