interface JsonData {
  [key: string]: any;
}

declare class Jsonwise<T> {
  /**
   * File path of the JSON file
   */
  private filePath: string;

  /**
   * JSON data stored in memory
   */
  private data: JsonData;

  /**
   * Constructor
   *
   * @param filePath The file path of the JSON file
   */
  constructor(filePath: string);

  /**
   * Load data from the JSON file
   *
   * @returns The loaded data
   */
  private loadData(): T[];

  /**
   * Save data to the JSON file
   */
  private saveData(): void;

  /**
   * Find Nested
   */
  private findNested(item: any, key: string, value: any): boolean;

  /**
   * Create a new entry in the JSON file
   *
   * @param obj The object to create
   * @returns The created object
   */
  create(obj: Omit<T, '__id'> & JsonData): T;

  /**
   * Find an entry from the JSON file
   *
   * @param where The conditions to find the entry
   * @returns The found entry or null if not found
   */
  find(where: { [key: string]: any }): T | null;

  /**
   * Update an entry in the JSON file
   *
   * @param id The ID of the entry to update
   * @param obj The updated object
   * @returns The updated object or null if not found
   */
  update(__id: number, obj: T): T | null;

  /**
   * Destroy an entry from the JSON file
   *
   * @param id The ID of the entry to delete
   * @returns True if deleted, false if not found
   */
  destroy(__id: number): boolean;

  /**
   * Find all entries in the JSON file
   *
   * @returns An array of all entries
   */
  findAll(): T[];

  /**
   * Count the number of entries in the JSON file
   *
   * @returns The count of entries
   */
  count(): number;
}

export default Jsonwise;
