/**
 * mongoose接続オプションテスト
 */
import * as assert from 'power-assert';

import mongooseConnectionOptions from './mongooseConnectionOptions';

describe('mongooseConnectionOptions', () => {
    it('接続オプションはオブジェクトなはず', () => {
        assert.equal(typeof mongooseConnectionOptions, 'object');
    });
});
