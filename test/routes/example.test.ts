import { build } from '../helper';
import * as assert from 'node:assert';
import { test } from 'node:test';

test('example is loaded', async (t) => {
  const app = await build(t);

  const res = await app.inject({
    url: '/example',
  });

  assert.equal(res.payload, 'this is an example');
});
