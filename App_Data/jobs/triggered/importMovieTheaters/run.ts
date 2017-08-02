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

    const placeAdapter = sskts.adapter.place(sskts.mongoose.connection);
    const organizationAdapter = sskts.adapter.organization(sskts.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await sskts.service.organization.searchMovieTheaters({})(organizationAdapter);

    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            debug('importing movieTheater...');
            await sskts.service.place.importMovieTheater(movieTheater.location.branchCode)(placeAdapter);
            debug('movieTheater imported');
        } catch (error) {
            console.error(error);
        }
    }));

    sskts.mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
