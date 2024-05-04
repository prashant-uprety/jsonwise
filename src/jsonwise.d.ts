declare module 'jsonwise' {
  interface Options {
    asyncWrite: boolean;
    syncOnWrite: boolean;
    jsonSpaces: number;
    stringify: (
      value: any,
      replacer?: (key: string, value: any) => any,
      space?: string | number
    ) => string;
    parse: (text: string, reviver?: (key: any, value: any) => any) => any;
  }

  class jsonwise {
    constructor(filePath: string, options?: Partial<Options>);
    set(key: string, value: any): void;
    get(key: string): any;
    has(key: string): boolean;
    delete(key: string): boolean | undefined;
    deleteAll(): jsonwise;
    sync(): void;
    JSON(storage?: Record<string, any>): Record<string, any>;
  }

  export default jsonwise;
}
