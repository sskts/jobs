/**
 * 映画作品インポート
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:jobs');

export async function main() {
    debug('connecting mongodb...');
    await sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const creativeWorkRepository = new sskts.repository.CreativeWork(sskts.mongoose.connection);
    const organizationRepository = new sskts.repository.Organization(sskts.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepository.searchMovieTheaters({});

    // 劇場ごとに映画作品をインポート
    for (const movieTheater of movieTheaters) {
        const branchCode = movieTheater.location.branchCode;

        try {
            debug('importing movies...', branchCode);
            await sskts.service.masterSync.importMovies(branchCode)({ creativeWork: creativeWorkRepository });
            debug('movies imported', branchCode);
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
