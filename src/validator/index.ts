import { ValidationResult, Source } from '../types';

/**
 * 信息验证器 - 用于交叉验证多个来源的信息
 */
export class InfoValidator {
  /**
   * 验证信息的可信度
   * @param contents 来自不同来源的内容
   * @param sources 来源信息
   */
  validate(contents: string[], sources: Source[]): ValidationResult {
    const normalizedContents = contents.map(c => this.normalize(c));
    const agreement = this.calculateAgreement(normalizedContents);
    
    const supportingSources: Source[] = [];
    const conflictingSources: Source[] = [];

    // 根据内容一致性分类来源
    const consensusContent = this.findConsensus(normalizedContents);
    
    normalizedContents.forEach((content, index) => {
      if (this.isSimilar(content, consensusContent)) {
        supportingSources.push(sources[index]);
      } else {
        conflictingSources.push(sources[index]);
      }
    });

    const avgReliability = sources.reduce((sum, s) => sum + s.reliability, 0) / sources.length;
    const confidence = agreement * avgReliability;

    return {
      isValid: confidence > 0.7,
      confidence,
      conflictingSources,
      supportingSources
    };
  }

  private normalize(content: string): string {
    return content.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private calculateAgreement(contents: string[]): number {
    if (contents.length < 2) return 1;
    
    let matches = 0;
    let total = 0;
    
    for (let i = 0; i < contents.length; i++) {
      for (let j = i + 1; j < contents.length; j++) {
        total++;
        if (this.isSimilar(contents[i], contents[j])) {
          matches++;
        }
      }
    }
    
    return total > 0 ? matches / total : 0;
  }

  private isSimilar(a: string, b: string): boolean {
    // 简单的相似度检查，可以使用更复杂的算法
    return a.includes(b) || b.includes(a) || this.levenshteinDistance(a, b) < Math.max(a.length, b.length) * 0.3;
  }

  private findConsensus(contents: string[]): string {
    // 返回出现频率最高的内容
    const frequency: Record<string, number> = {};
    contents.forEach(c => {
      frequency[c] = (frequency[c] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || contents[0];
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }
}
