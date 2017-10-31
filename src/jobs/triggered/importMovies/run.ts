/**
 * 映画作品インポート
 *
 * @ignore
 */

import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

export async function main() {
    debug('connecting mongodb...');
    sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const creativeWorkRepository = new sskts.repository.CreativeWork(sskts.mongoose.connection);
    const organizationRepository = new sskts.repository.Organization(sskts.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepository.searchMovieTheaters({});

    // 劇場ごとに映画作品をインポート
    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            debug('importing movies...', movieTheater);
            await sskts.service.masterSync.importMovies(movieTheater.location.branchCode)(creativeWorkRepository);
            debug('movies imported');
        } catch (error) {
            console.error(error);
        }
    }));

    sskts.mongoose.disconnect();
}

main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
