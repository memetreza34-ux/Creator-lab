import assert from 'node:assert/strict';
import test from 'node:test';
import type { Experiment } from '../types';
import { selectPreferredVariant } from './experimentIntegrity';

const experiment: Experiment = {
  id: 'manual-comparison',
  workspaceId: 'workspace-a',
  name: 'Hook comparison',
  type: 'hook',
  status: 'running',
  hypothesis: 'The shorter hook might be clearer',
  primaryMetric: 'Click-Through Rate (CTR)',
  variantA: { label: 'Short', metric: 0 },
  variantB: { label: 'Long', metric: 0 },
  aiInterpretation: 'Variant A won based on higher CTR',
};

test('manual preference cannot leave a fabricated evidence claim', () => {
  const selected = selectPreferredVariant(experiment, 'B');

  assert.equal(selected.winner, 'B');
  assert.equal(selected.status, 'concluded');
  assert.equal(selected.aiInterpretation, undefined);
  assert.equal(selected.variantA.metric, 0);
  assert.equal(selected.variantB.metric, 0);
  assert.equal(selected.primaryMetric, 'Click-Through Rate (CTR)');
  assert.equal(experiment.aiInterpretation, 'Variant A won based on higher CTR');
  assert.equal(experiment.status, 'running');
});

test('selection is explicit even when both variants have no metrics', () => {
  const selected = selectPreferredVariant(experiment, 'A');
  assert.equal(selected.winner, 'A');
  assert.equal(selected.variantA.metric, 0);
  assert.equal(selected.variantB.metric, 0);
});
