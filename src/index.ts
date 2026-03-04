import { InfoValidator } from './validator';
import { RetrievedInfo, ValidationResult } from './types';

/**
 * 客观信息检索器主类
 */
export class ObjectiveInfoRetriever {
  private validator: InfoValidator;
  private retrievers: any[] = []; // 这里可以添加具体的检索器实例

  constructor() {
    this.validator = new InfoValidator();
  }

  /**
   * 添加信息检索器
   */
  addRetriever(retriever: any): void {
    this.retrievers.push(retriever);
  }

  /**
   * 检索并验证信息
   */
  async retrieveAndValidate(query: string): Promise<{
    info: RetrievedInfo[];
    validation: ValidationResult;
  }> {
    // 从所有检索器获取信息
    const results = await Promise.all(
      this.retrievers.map(r => r.retrieve(query))
    );

    // 验证信息
    const contents = results.map(r => r.content);
    const sources = results.flatMap(r => r.sources);
    const validation = this.validator.validate(contents, sources);

    return {
      info: results,
      validation
    };
  }
}

// 导出所有模块
export * from './types';
export * from './validator';
export * from './retriever/base';
