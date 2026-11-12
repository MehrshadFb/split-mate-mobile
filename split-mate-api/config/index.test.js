describe('GEMINI_THINKING_LEVEL', () => {
  const original = process.env.GEMINI_THINKING_LEVEL;
  afterEach(() => {
    if (original === undefined) delete process.env.GEMINI_THINKING_LEVEL;
    else process.env.GEMINI_THINKING_LEVEL = original;
    jest.restoreAllMocks();
  });

  const loadLevel = (value) => {
    if (value === undefined) delete process.env.GEMINI_THINKING_LEVEL;
    else process.env.GEMINI_THINKING_LEVEL = value;
    let level;
    jest.isolateModules(() => {
      level = require('./index').gemini.thinkingLevel;
    });
    return level;
  };

  test('defaults to low', () => {
    expect(loadLevel(undefined)).toBe('low');
  });

  test('accepts supported levels in any case', () => {
    expect(loadLevel('medium')).toBe('medium');
    expect(loadLevel(' HIGH ')).toBe('high');
  });

  test('falls back to low with a warning for unsupported levels', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadLevel('minimal')).toBe('low');
    expect(loadLevel('lwo')).toBe('low');
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('minimal');
  });
});
