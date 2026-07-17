import { describe, test, expect } from 'vitest';
import { levels } from './levels';

describe('GHA-Quest Levels Configuration', () => {
  test('should have exactly 5 challenge levels', () => {
    expect(levels.length).toBe(5);
  });

  test('levels should be ordered by ID sequentially', () => {
    levels.forEach((level, index) => {
      expect(level.id).toBe(index + 1);
    });
  });

  test('each level should contain a validation function', () => {
    levels.forEach(level => {
      expect(typeof level.validate).toBe('function');
    });
  });

  test('Level 1 should validate correct hello-job configuration', () => {
    const level1 = levels[0];
    const validCode = `
name: First workflow
on: workflow_dispatch
jobs:
  hello-job:
    runs-on: ubuntu-latest
    steps:
      - name: Greet User
        run: echo "Hello World"
    `;
    const result = level1.validate(validCode);
    expect(result.success).toBe(true);
  });

  test('Level 1 should fail invalid name configuration', () => {
    const level1 = levels[0];
    const invalidCode = `
name: Wrong Name
on: workflow_dispatch
jobs:
  hello-job:
    runs-on: ubuntu-latest
    `;
    const result = level1.validate(invalidCode);
    expect(result.success).toBe(false);
    expect(result.error).toContain('First workflow');
  });
});
