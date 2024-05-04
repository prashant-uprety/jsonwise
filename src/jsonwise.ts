import fs from 'fs';

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

const defaultOptions: Options = {
  asyncWrite: false,
  syncOnWrite: true,
  jsonSpaces: 4,
  stringify: JSON.stringify,
  parse: JSON.parse,
};

type Storage = Record<string, any>;

class jsonwise {
  private filePath: string;
  private options: Options;
  private storage: Storage;

  constructor(filePath: string, options?: Partial<Options>) {
    if (!filePath || !filePath.length) {
      throw new Error('Missing file path argument.');
    }

    this.filePath = filePath;
    this.options = { ...defaultOptions, ...options };
    this.storage = {};

    this.initStorage();
  }

  private initStorage(): void {
    try {
      fs.accessSync(this.filePath, fs.constants.F_OK);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        fs.writeFileSync(this.filePath, '{}');
      } else {
        throw new Error(`Error while accessing file "${this.filePath}": ${err.message}`);
      }
    }

    try {
      const data = fs.readFileSync(this.filePath).toString();
      this.storage = this.options.parse(data);
    } catch (err: any) {
      throw new Error(`Error while reading file "${this.filePath}": ${err.message}`);
    }
  }

  set(key: string, value: any): void {
    this.storage[key] = value;
    if (this.options && this.options.syncOnWrite) this.sync();
  }

  get(key: string): any {
    return key in this.storage ? this.storage[key] : undefined;
  }

  has(key: string): boolean {
    return key in this.storage;
  }

  delete(key: string): boolean | undefined {
    const retVal = key in this.storage ? delete this.storage[key] : undefined;
    if (this.options && this.options.syncOnWrite) this.sync();
    return retVal;
  }

  deleteAll(): jsonwise {
    for (const key in this.storage) {
      if (Object.prototype.hasOwnProperty.call(this.storage, key)) {
        this.delete(key);
      }
    }
    return this;
  }

  sync(): void {
    if (this.options && this.options.asyncWrite) {
      fs.writeFile(
        this.filePath,
        this.options.stringify(this.storage, undefined, this.options.jsonSpaces),
        (err) => {
          if (err) throw err;
        }
      );
    } else {
      try {
        fs.writeFileSync(
          this.filePath,
          this.options.stringify(this.storage, undefined, this.options.jsonSpaces)
        );
      } catch (err: any) {
        if (err.code === 'EACCES') {
          throw new Error(`Cannot access path "${this.filePath}".`);
        } else {
          throw new Error(`Error while writing to path "${this.filePath}": ${err}`);
        }
      }
    }
  }

  JSON(storage?: Record<string, any>): Record<string, any> {
    if (storage) {
      try {
        JSON.parse(this.options.stringify(storage));
        this.storage = storage;
      } catch (err) {
        throw new Error('Given parameter is not a valid JSON object.');
      }
    }
    return JSON.parse(this.options.stringify(this.storage));
  }
}

export default jsonwise;
