import {PersistentMap} from '../persistentMap';

describe('Persistent Map tests', () => {
  it('empty map', () => {
    const map = new PersistentMap<string, string>('pre');
    map.set('foo', 'var');
    assert(map.get('foo') === 'var', 'wrong value');
  });
});
