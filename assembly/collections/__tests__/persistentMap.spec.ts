import { PersistentMap } from "../persistentMap";

describe("Persistent Map tests", () => {
  it("empty map", () => {
    const map = new PersistentMap<string, string>("my_map");
    assert<bool>(map.size() === 0, "empty map must have 0 size");
    assert<bool>(!map.contains("some_key"), "empty map contains no keys");
    assert<bool>(!map.get("some_key"), "empty map contains no keys");
  });

  it("basic map operations", () => {
    const map = new PersistentMap<string, string>("my_map");

    // test key-value pair
    const key: string = "some_key";
    const value: string = "some_value";

    // set a value
    map.set(key, value);

    // check map size
    assert<bool>(map.size() === 1, "size must be 1");

    // check for value
    assert<bool>(map.contains(key), "must contain key");

    // get value
    assert<string>(map.get(key) as string, value);

    // replace value
    const updatedValue: string = value.toUpperCase();
    map.set(key, updatedValue);

    // check for value
    assert<string>(map.get(key) as string, updatedValue);

    // check for value
    assert<bool>(map.contains(key), "must contain key");

    // check map size
    assert<bool>(map.size() === 1, "size must be 1");

    // add another key now
    const key2 = "some_other_key";
    map.set(key2, updatedValue);

    // check map size again
    assert<bool>(map.size() === 2, "size must be 2");

    // delete value
    map.delete(key);

    // check map size again
    assert<bool>(map.size() === 1, "size must be 1");

    // key should not be there anymore
    assert<bool>(!map.get(key), `key must have been deleted`);
  });
});
