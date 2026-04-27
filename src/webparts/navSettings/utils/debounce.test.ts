import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not call the function before the delay elapses', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    jest.advanceTimersByTime(299);

    expect(fn).not.toHaveBeenCalled();
  });

  it('calls the function exactly once after the delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('only executes once for rapid calls during the delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced();
    debounced();
    debounced();
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments through to the wrapped function', () => {
    const fn = jest.fn();
    const debounced = debounce((name: string, count: number) => fn(name, count), 300);

    debounced('nav', 24);
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledWith('nav', 24);
  });
});
