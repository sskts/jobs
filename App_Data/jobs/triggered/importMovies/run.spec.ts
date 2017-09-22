/**
 * importMovies run test
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
// import * as assert from 'power-assert';
import * as sinon from 'sinon';

let sandbox: sinon.SinonSandbox;

describe('main()', () => {
    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('DBが正常であれば実行できるはず', async () => {
        const organizations = [{
            location: {
                branchCode: 'branchCode'
            }
        }];

        sandbox.mock(sskts.mongoose).expects('connect').once().returns(Promise.resolve());
        sandbox.mock(sskts.repository.Organization.prototype).expects('searchMovieTheaters').once()
            .returns(Promise.resolve(organizations));
        sandbox.mock(sskts.service.masterSync).expects('importMovies').once()
            .withExactArgs(organizations[0].location.branchCode).returns(async () => Promise.resolve());
        sandbox.mock(sskts.mongoose).expects('disconnect').once().returns(Promise.resolve());

        // tslint:disable-next-line:no-require-imports
        require('./run');

        setTimeout(
            () => {
                // assert.equal(typeof result, 'object');
                sandbox.verify();
            },
            // tslint:disable-next-line:no-magic-numbers
            1000
        );
    });
});
