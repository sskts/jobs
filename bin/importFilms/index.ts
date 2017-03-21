/**
 * 作品インポート
 *
 * @ignore
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as mongoose from 'mongoose';

import mongooseConnectionOptions from '../../mongooseConnectionOptions';

const debug = createDebug('sskts-api:*');

async function main() {
    debug('connecting mongodb...');
    mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const theaterAdapter = sskts.adapter.theater(mongoose.connection);
    const filmAdapter = sskts.adapter.film(mongoose.connection);

    const theaterIds = <string[]>await theaterAdapter.model.distinct('_id').exec();
    const promises = theaterIds.map(async (theaterId) => {
        try {
            debug('importing films...');
            await sskts.service.master.importFilms(theaterId)(theaterAdapter, filmAdapter);
            debug('films imported.');
        } catch (error) {
            console.error(error);
        }
    });

    await Promise.all(promises);

    mongoose.disconnect();
}

main().then(() => { // tslint:disable-line:no-floating-promises
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
