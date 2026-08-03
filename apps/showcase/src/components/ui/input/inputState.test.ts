import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_INPUT_SIZE,
  hasInputContent,
  resolveInputExternalLabelOffset,
  resolveInputHorizontalInsets,
  resolveInputFocusColors,
  resolveInputMessageTone,
  resolveInputSize,
  resolveInputStatus,
} from './inputState.ts';

test('clear action is available only when the input contains text', () => {
  assert.equal(hasInputContent(undefined), false);
  assert.equal(hasInputContent(''), false);
  assert.equal(hasInputContent(' '), true);
  assert.equal(hasInputContent('Showcase'), true);
});

test('leading and trailing adornments reserve their respective control insets', () => {
  assert.deepEqual(
    resolveInputHorizontalInsets({
      basePadding: 14,
      hasLeading: true,
      hasTrailing: true,
      leadingPadding: 42,
      trailingPadding: 52,
    }),
    { paddingLeft: 42, paddingRight: 52 },
  );
  assert.deepEqual(
    resolveInputHorizontalInsets({
      basePadding: 14,
      hasLeading: false,
      hasTrailing: false,
      leadingPadding: 42,
      trailingPadding: 52,
    }),
    { paddingLeft: 14, paddingRight: 14 },
  );
});

test('external labels reserve space above the field instead of cutting into its border', () => {
  assert.equal(resolveInputExternalLabelOffset(16), 22);
  assert.equal(resolveInputExternalLabelOffset(18), 24);
});

test('a custom focus color keeps the border and active adornments in sync', () => {
  assert.deepEqual(
    resolveInputFocusColors({
      appearance: 'filled',
      defaultColor: '#6558D9',
      defaultBorderColor: '#6558D9',
      filledDefaultBorderColor: '#8B82E3',
      focusColor: '#147D73',
    }),
    { borderColor: '#147D73', contentColor: '#147D73' },
  );

  assert.deepEqual(
    resolveInputFocusColors({
      appearance: 'filled',
      defaultColor: '#6558D9',
      defaultBorderColor: '#6558D9',
      filledDefaultBorderColor: '#8B82E3',
    }),
    { borderColor: '#8B82E3', contentColor: '#6558D9' },
  );

  assert.deepEqual(
    resolveInputFocusColors({
      appearance: 'external',
      defaultColor: '#6558D9',
      defaultBorderColor: '#A855F7',
      filledDefaultBorderColor: '#8B82E3',
    }),
    { borderColor: '#A855F7', contentColor: '#6558D9' },
  );
});

test('error text promotes an input to the error state', () => {
  assert.equal(
    resolveInputStatus({
      errorText: 'Required',
      status: 'success',
    }),
    'error',
  );
});

test('invalid promotes an input to the error state without a message', () => {
  assert.equal(resolveInputStatus({ invalid: true }), 'error');
});

test('success remains available when no error is present', () => {
  assert.equal(resolveInputStatus({ status: 'success' }), 'success');
});

test('message tone follows status unless explicitly provided', () => {
  assert.equal(resolveInputMessageTone('error'), 'error');
  assert.equal(resolveInputMessageTone('success'), 'success');
  assert.equal(resolveInputMessageTone('default'), 'info');
  assert.equal(resolveInputMessageTone('error', 'info'), 'info');
});

test('medium is the default input size', () => {
  assert.equal(resolveInputSize(), DEFAULT_INPUT_SIZE);
  assert.equal(DEFAULT_INPUT_SIZE, 'md');
  assert.equal(resolveInputSize('lg'), 'lg');
});

test('small and medium input sizes are preserved', () => {
  assert.equal(resolveInputSize('sm'), 'sm');
  assert.equal(resolveInputSize('md'), 'md');
});
