/**
 * 劇場インポート
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:jobs');

async function main() {
    debug('connecting mongodb...');
    await sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
    const placeRepo = new sskts.repository.Place(sskts.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepo.searchMovieTheaters({});

    for (const movieTheater of movieTheaters) {
        const branchCode = movieTheater.location.branchCode;

        try {
            debug('importing movieTheater...', branchCode);
            await sskts.service.masterSync.importMovieTheater(branchCode)({
                organization: organizationRepo,
                place: placeRepo
            });
            debug('movieTheater imported', branchCode);
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
    }

    await sskts.mongoose.disconnect();
}

main()
    .then(() => {
        debug('success!');
    })
    .catch((err) => {
        // tslint:disable-next-line:no-console
        console.error(err);
        process.exit(1);
    });
