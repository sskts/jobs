/**
 * 上映イベントインポートタスク作成
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:*');

/**
 * 上映イベントを何週間後までインポートするか
 * @const {number}
 */
const LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS = (process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS !== undefined)
    // tslint:disable-next-line:no-magic-numbers
    ? parseInt(process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 10)
    : 1;

async function main() {
    debug('connecting mongodb...');
    await sskts.mongoose.connect(<string>process.env.MONGOLAB_URI, mongooseConnectionOptions);

    const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaters = await organizationRepo.searchMovieTheaters({});
    const importFrom = moment().toDate();
    const importThrough = moment(importFrom).add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks').toDate();
    const runsAt = new Date();
    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            const taskAttributes: sskts.factory.task.IAttributes<sskts.factory.taskName.ImportScreeningEvents> = {
                name: sskts.factory.taskName.ImportScreeningEvents,
                status: sskts.factory.taskStatus.Ready,
                runsAt: runsAt,
                remainingNumberOfTries: 1,
                lastTriedAt: null,
                numberOfTried: 0,
                executionResults: [],
                data: {
                    locationBranchCode: movieTheater.location.branchCode,
                    importFrom: importFrom,
                    importThrough: importThrough,
                    xmlEndPoint: movieTheater.xmlEndPoint
                }
            };
            await taskRepo.save(taskAttributes);
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
