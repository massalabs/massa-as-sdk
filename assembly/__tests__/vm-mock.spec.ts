import {
  Address,
  Storage,
  generateEvent,
  Args,
  toBytes,
  Context,
  fromBytes,
} from "../std";

const testAddress = new Address(
  "A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"
);

const keyTestArgs = new Args().add("test");
const valueTestArgs = new Args().add("value");

const keyTest = toBytes("test");
const valueTest = toBytes("value");

describe("Testing mocked Storage and CallStack", () => {
  test("Testing the callstack", () => {
    // By convention addressStack returns always the two addresses.
    const callStack = Context.addressStack();
    expect(callStack[0].toByteString()).toBe(
      "A12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiKq"
    );
    expect(callStack[1].toByteString()).toBe(
      "A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT"
    );
  });

  test("Testing the Storage setOf", () => {
    Storage.setOf(testAddress, keyTest, valueTest);
    expect(
      fromBytes(
        Storage.getOf(
          new Address("A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"),
          toBytes("test")
        )
      )
    ).toBe("value");
  });

  test("Testing the Storage setOf with Args", () => {
    Storage.setOf(testAddress, keyTestArgs, valueTestArgs);
    expect(
      Storage.getOf(
        new Address("A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"),
        new Args().add("test")
      )
        .nextString()
        .unwrap()
    ).toBe("value");
  });

  test("Testing the Storage set", () => {
    Storage.set(keyTest, valueTest);
    expect(fromBytes(Storage.get(toBytes("test")))).toBe("value");
  });

  test("Testing the Storage set", () => {
    Storage.set(keyTest, valueTest);
    expect(Storage.has(toBytes("test"))).toBeTruthy();
  });

  test("Testing the Storage set", () => {
    Storage.set(keyTest, valueTest);
    expect(
      Storage.hasOf(
        new Address("A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"),
        toBytes("test")
      )
    ).toBeTruthy();
  });

  test("Testing event", () => {
    generateEvent("I'm an event ");
  });
});

describe("Test Table tests", () => {
  // prettier-ignore
  checksForEachLineThatThe('sum of two integers', 'arg0 + arg1', is, 'arg3', [
    1, 2, 3,
    3, 4, 7,
    4, 5, 9,
  ]);

  // prettier-ignore
  checksForEachLineThatThe('`greater than` of two integers', 'arg0 > arg1', isFalse, [
    0, 1,
    2, 3,
  ]);
});
