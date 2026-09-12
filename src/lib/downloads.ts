import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';

let downloadsDir: Directory | null = null;

function getDownloadsDir(): Directory {
  if (!downloadsDir) {
    downloadsDir = new Directory(Paths.document, 'globalstage-downloads');
  }
  if (!downloadsDir.exists) {
    downloadsDir.create({ intermediates: true, idempotent: true });
  }
  return downloadsDir;
}

function localFileFor(contentId: string, mediaUrl: string): File {
  const extension = mediaUrl.split('.').pop() || 'pdf';
  return new File(getDownloadsDir(), `${contentId}.${extension}`);
}

/**
 * expo-file-system's File/Directory API targets native storage — on web there
 * is no equivalent sandboxed filesystem, so "offline download" is a no-op
 * there and PDFs open via the browser's own download handling instead.
 */
export function isDownloaded(contentId: string, mediaUrl: string): boolean {
  if (Platform.OS === 'web') return false;
  try {
    return localFileFor(contentId, mediaUrl).exists;
  } catch {
    return false;
  }
}

export async function downloadForOffline(contentId: string, mediaUrl: string): Promise<string> {
  if (Platform.OS === 'web') return mediaUrl;
  const destination = localFileFor(contentId, mediaUrl);
  if (destination.exists) return destination.uri;
  const downloaded = await File.downloadFileAsync(mediaUrl, destination, { idempotent: true });
  return downloaded.uri;
}
