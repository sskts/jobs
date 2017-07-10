/**
 * 劇場インポート
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

async function main() {
    debug('connecting mongodb...');
    sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const theaterAdapter = sskts.adapter.theater(sskts.mongoose.connection);

    const theaterIds = <string[]>await theaterAdapter.model.distinct('_id').exec();
    const promises = theaterIds.map(async (theaterId) => {
        try {
            debug('importing theater...');
            await sskts.service.master.importTheater(theaterId)(theaterAdapter);
            debug('theater imported.');
        } catch (error) {
            console.error(error);
        }
    });

    await Promise.all(promises);

    sskts.mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
