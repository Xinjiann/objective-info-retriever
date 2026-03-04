import { RetrievedInfo, Source } from '../types';

/**
 * 信息检索器基类
 */
export abstract class BaseRetriever {
  protected name: string;
  protected reliability: number;

  constructor(name: string, reliability: number) {
    this.name = name;
    this.reliability = reliability;
  }

  abstract retrieve(query: string): Promise<RetrievedInfo>;

  protected createSource(url: string): Source {
    return {
      name: this.name,
      url,
      reliability: this.reliability
    };
  }
}
