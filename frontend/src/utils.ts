/**
 * 盖可朋友圈 - AI图片生成
 * 性能优化工具
 */

export class ImageOptimizer {
  /**
   * 压缩图片
   */
  static async compress(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 计算新尺寸
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制并压缩
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 生成缩略图
   */
  static async generateThumbnail(
    file: File,
    size: number = 200
  ): Promise<string> {
    const blob = await this.compress(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'webp'
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read blob'));
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 获取图片尺寸
   */
  static async getImageDimensions(
    file: File
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 格式转换
   */
  static async convertFormat(
    file: File,
    targetFormat: 'jpeg' | 'png' | 'webp'
  ): Promise<Blob> {
    return this.compress(file, {
      quality: targetFormat === 'png' ? 1 : 0.85,
      format: targetFormat
    });
  }
}

export class LazyLoader {
  private observer: IntersectionObserver;
  private loadedImages = new Set<string>();

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;

            if (src && !this.loadedImages.has(src)) {
              img.src = src;
              this.loadedImages.add(src);
              this.observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }

  observe(element: Element): void {
    this.observer.observe(element);
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}

export class CacheManager {
  private memoryCache = new Map<string, { value: any; expiry: number }>();
  private maxSize = 50;
  private cleanupInterval: number;

  constructor() {
    // 每分钟清理过期缓存
    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  set(key: string, value: any, ttl: number = 3600000): void {
    // 清理旧缓存
    if (this.memoryCache.size >= this.maxSize) {
      const oldest = this.memoryCache.keys().next().value as string | undefined;
      if (oldest) this.memoryCache.delete(oldest);
    }

    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttl
    });
  }

  get(key: string): any | null {
    const entry = this.memoryCache.get(key);

    if (!entry) {
      // 尝试从 localStorage 获取
      return this.getFromLocalStorage(key);
    }

    if (Date.now() > entry.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value;
  }

  private getFromLocalStorage(key: string): any | null {
    try {
      const str = localStorage.getItem(`cache_${key}`);
      if (!str) return null;

      const item = JSON.parse(str);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.value;
    } catch {
      return null;
    }
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiry) {
        this.memoryCache.delete(key);
      }
    }

    // 清理 localStorage 中的过期缓存
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const str = localStorage.getItem(key);
          if (str) {
            const item = JSON.parse(str);
            if (Date.now() > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  clear(): void {
    this.memoryCache.clear();

    // 清理所有缓存
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

export class RequestQueue {
  private queue: Array<{
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private processing = false;
  private concurrentLimit: number;
  private currentCount = 0;

  constructor(concurrentLimit: number = 3) {
    this.concurrentLimit = concurrentLimit;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve: resolve as any,
        reject
      });

      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0 && this.currentCount < this.concurrentLimit) {
      const item = this.queue.shift();
      if (!item) continue;

      this.currentCount++;

      try {
        const result = await item.request();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      } finally {
        this.currentCount--;
        this.process();
      }
    }

    this.processing = false;
  }

  clear(): void {
    this.queue.forEach((item) => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | undefined;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.map((src) => preloadImage(src)));
};

export class PerformanceMonitor {
  private marks = new Map<string, number>();

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Mark "${startMark}" not found`);
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.set(`${name}_${Date.now()}`, performance.now());

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

    return duration;
  }

  getNavigationTiming(): PerformanceNavigationTiming {
    return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  }

  getResourceTiming(): PerformanceResourceTiming[] {
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};
