/**
 * 盖可朋友圈 - AI图片生成
 * 历史记录管理
 */

export interface HistoryItem {
  id: string;
  version: number;
  timestamp: number;
  type: 'generate' | 'edit' | 'workflow';
  prompt: string;
  model: string;
  mode: 'text' | 'edit';
  size: string;
  quality: string;
  images: string[];
  thumbnail?: string;
  parameters: Record<string, any>;
  description: string;
}

const STORAGE_KEY = 'gaike_history';
const MAX_ITEMS = 100;

class HistoryManager {
  private history: HistoryItem[] = [];
  private listeners: Array<(history: HistoryItem[]) => void> = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      this.history = [];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.history]));
  }

  add(item: Omit<HistoryItem, 'id' | 'version' | 'timestamp'>): HistoryItem {
    const newItem: HistoryItem = {
      ...item,
      id: this.generateId(),
      version: 1,
      timestamp: Date.now(),
    };

    this.history.unshift(newItem);

    // 限制最大数量
    if (this.history.length > MAX_ITEMS) {
      this.history = this.history.slice(0, MAX_ITEMS);
    }

    this.save();
    return newItem;
  }

  update(id: string, updates: Partial<HistoryItem>): void {
    const index = this.history.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.history[index] = {
        ...this.history[index],
        ...updates,
        version: this.history[index].version + 1,
      };
      this.save();
    }
  }

  delete(id: string): void {
    this.history = this.history.filter((item) => item.id !== id);
    this.save();
  }

  get(id: string): HistoryItem | undefined {
    return this.history.find((item) => item.id === id);
  }

  getAll(): HistoryItem[] {
    return [...this.history];
  }

  getByType(type: HistoryItem['type']): HistoryItem[] {
    return this.history.filter((item) => item.type === type);
  }

  getByDateRange(startDate: number, endDate: number): HistoryItem[] {
    return this.history.filter(
      (item) => item.timestamp >= startDate && item.timestamp <= endDate
    );
  }

  clear(): void {
    this.history = [];
    this.save();
  }

  search(query: string): HistoryItem[] {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(
      (item) =>
        item.prompt.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.model.toLowerCase().includes(lowerQuery)
    );
  }

  getStatistics(): {
    totalItems: number;
    totalImages: number;
    byModel: Record<string, number>;
    byType: Record<string, number>;
    byDate: Record<string, number>;
  } {
    const stats = {
      totalItems: this.history.length,
      totalImages: this.history.reduce((sum, item) => sum + item.images.length, 0),
      byModel: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byDate: {} as Record<string, number>,
    };

    this.history.forEach((item) => {
      // byModel
      stats.byModel[item.model] = (stats.byModel[item.model] || 0) + 1;

      // byType
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

      // byDate
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    return stats;
  }

  export(): string {
    return JSON.stringify(this.history, null, 2);
  }

  import(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (Array.isArray(imported)) {
        this.history = imported.slice(0, MAX_ITEMS);
        this.save();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  subscribe(listener: (history: HistoryItem[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private generateId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const historyManager = new HistoryManager();

export class VersionCompare {
  static compare(
    item1: HistoryItem,
    item2: HistoryItem
  ): {
    promptDiff: string[];
    parameterDiff: Record<string, { old: any; new: any }>;
    imageDiff: { added: number; removed: number };
  } {
    // 提示词差异
    const promptDiff: string[] = [];
    if (item1.prompt !== item2.prompt) {
      promptDiff.push(`Prompt: "${item1.prompt}" → "${item2.prompt}"`);
    }

    // 参数差异
    const parameterDiff: Record<string, { old: any; new: any }> = {};
    const allKeys = new Set([
      ...Object.keys(item1.parameters),
      ...Object.keys(item2.parameters),
    ]);

    allKeys.forEach((key) => {
      if (item1.parameters[key] !== item2.parameters[key]) {
        parameterDiff[key] = {
          old: item1.parameters[key],
          new: item2.parameters[key],
        };
      }
    });

    // 图片差异
    const images1 = new Set(item1.images);
    const images2 = new Set(item2.images);

    const added = item2.images.filter((img) => !images1.has(img)).length;
    const removed = item1.images.filter((img) => !images2.has(img)).length;

    return {
      promptDiff,
      parameterDiff,
      imageDiff: { added, removed },
    };
  }

  static formatComparison(
    comparison: ReturnType<typeof VersionCompare.compare>
  ): string {
    const lines: string[] = [];

    if (comparison.promptDiff.length > 0) {
      lines.push('Prompt Changes:');
      comparison.promptDiff.forEach((diff) => lines.push(`  • ${diff}`));
    }

    if (Object.keys(comparison.parameterDiff).length > 0) {
      lines.push('Parameter Changes:');
      Object.entries(comparison.parameterDiff).forEach(([key, { old, new: newVal }]) => {
        lines.push(`  • ${key}: ${old} → ${newVal}`);
      });
    }

    lines.push('Image Changes:');
    lines.push(`  • Added: ${comparison.imageDiff.added}`);
    lines.push(`  • Removed: ${comparison.imageDiff.removed}`);

    return lines.join('\n');
  }
}

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes} 分钟前`;
  } else if (hours < 24) {
    return `${hours} 小时前`;
  } else if (days < 7) {
    return `${days} 天前`;
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

export const groupHistoryByDate = (
  history: HistoryItem[]
): Record<string, HistoryItem[]> => {
  const grouped: Record<string, HistoryItem[]> = {};

  history.forEach((item) => {
    const date = new Date(item.timestamp);
    const key = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return grouped;
};
