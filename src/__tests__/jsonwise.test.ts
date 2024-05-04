import fs from 'fs';
import jsonwise from '../jsonwise';

describe('jsonwise', () => {
  const filePath = 'test.json';

  beforeEach(() => {
    fs.writeFileSync(filePath, '{}');
  });

  afterEach(() => {
    fs.unlinkSync(filePath);
  });

  it('constructor and initialization', () => {
    new jsonwise(filePath);
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('set and get', () => {
    const json = new jsonwise(filePath);
    json.set('foo', 'bar');
    expect(json.get('foo')).toBe('bar');
  });

  it('has and delete', () => {
    const json = new jsonwise(filePath);
    json.set('foo', 'bar');
    expect(json.has('foo')).toBe(true);
    json.delete('foo');
    expect(json.has('foo')).toBe(false);
  });

  it('sync and async write', async () => {
    const json = new jsonwise(filePath);
    json.set('foo', 'bar');
    await json.sync();
    const fileContent = fs.readFileSync(filePath, 'utf8');
    expect(JSON.parse(fileContent)).toEqual({ foo: 'bar' });
  });

  it('JSON parsing and stringification', () => {
    const json = new jsonwise(filePath);
    json.set('foo', 'bar');
    const jsonString = json.JSON();
    expect(jsonString).toEqual({ foo: 'bar' });
    json.JSON({ foo: 'bar' });
  });
});
