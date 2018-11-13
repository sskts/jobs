/**
 * 劇場インポート
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

async function main() {
    debug('connecting mongodb...');
    await sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
    const placeRepo = new sskts.repository.Place(sskts.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepo.searchMovieTheaters({});

    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            debug('importing movieTheater...');
            await sskts.service.masterSync.importMovieTheater(movieTheater.location.branchCode)({
                organization: organizationRepo,
                place: placeRepo
            });
            debug('movieTheater imported');
        } catch (error) {
            console.error(error);
        }
    }));

    await sskts.mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
