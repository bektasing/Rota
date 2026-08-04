import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

/**
 * Native Android'de tarayıcının Blob indirme yöntemi güvenilir çalışmadığından
 * yedek dosyası uygulamanın önbellek alanına yazılır, ardından Android paylaşım
 * ekranı açılır; kullanıcı Dosyalar, Drive, WhatsApp vb. bir hedefe kaydedebilir.
 */
export async function saveOrShareBackupNative(filename: string, data: unknown): Promise<void> {
  const json = JSON.stringify(data, null, 2);

  const written = await Filesystem.writeFile({
    path: filename,
    data: json,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });

  await Share.share({
    title: "Rota yedeği",
    text: filename,
    url: written.uri,
  });
}
