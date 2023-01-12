import { createEvent } from '..';

describe('Create an event', () => {
  test('A no args param has been emitted', () =>
    expect(
      createEvent(
        "Im an event built for test and I don't take arguments 😘",
        [],
      ),
    ).toBe("Im an event built for test and I don't take arguments 😘:"));

  test('A 1 arg param has been emitted', () =>
    expect(
      createEvent('Im an event built for test and I only take one arguments', [
        'arg1',
      ]),
    ).toBe('Im an event built for test and I only take one arguments:arg1'));

  test('A several arg param has been emitted', () =>
    expect(
      createEvent('Im an event built for test and I take several arguments', [
        'arg1',
        'arg2',
        'arg3',
        'arg4',
      ]),
    ).toBe(
      'Im an event built for test and I take several arguments:arg1,arg2,arg3,arg4',
    ));
});
