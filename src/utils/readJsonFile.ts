export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error("Dosya geçerli bir JSON formatında değil."));
      }
    };

    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsText(file);
  });
}
