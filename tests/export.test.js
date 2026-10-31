import test from 'node:test';
import assert from 'node:assert/strict';
import { exportWorkspace } from '../shared/export.js';
test('exports exclude superseded decisions and rejected tasks', () => {
  const data = { decisions: [{ decision: 'Old', status: 'superseded' }, { decision: 'Current', status: 'active' }], tasks: [{ task: 'Discarded', reviewStatus: 'rejected' }, { task: 'Build | docs\nnow', reviewStatus: 'approved' }] };
  const json = JSON.parse(exportWorkspace('json', data));
  assert.equal(json.decisions.length, 1); assert.equal(json.tasks.length, 1);
  const table = exportWorkspace('linear', data); assert.ok(table.includes('Build \\| docs now')); assert.ok(!table.includes('Discarded'));
});
