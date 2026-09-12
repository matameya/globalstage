import { sampleContent, getContentById } from '@/data/sampleContent';
import type { ContentItem, PlayerCategory, PlayerPosition } from '@/types';

export interface ContentFilters {
  topic?: string;
  ageCategory?: PlayerCategory;
  position?: PlayerPosition;
  type?: ContentItem['type'];
}

export async function listContent(filters?: ContentFilters): Promise<ContentItem[]> {
  let results = [...sampleContent];

  if (filters?.topic) {
    results = results.filter((c) => c.topic === filters.topic);
  }
  if (filters?.ageCategory) {
    results = results.filter((c) => c.ageCategory.includes(filters.ageCategory!));
  }
  if (filters?.position) {
    results = results.filter((c) => c.position.includes(filters.position!) || c.position.includes('flexible'));
  }
  if (filters?.type) {
    results = results.filter((c) => c.type === filters.type);
  }

  return results.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getContent(id: string): Promise<ContentItem | undefined> {
  return getContentById(id);
}

export function listTopics(): string[] {
  return Array.from(new Set(sampleContent.map((c) => c.topic))).sort();
}
