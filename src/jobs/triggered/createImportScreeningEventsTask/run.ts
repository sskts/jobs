/**
 * 上映イベントインポートタスク作成
 */
import * as sskts from '@motionpicture/sskts-domain';
import * as createDebug from 'debug';
import * as moment from 'moment';

import mongooseConnectionOptions from '../../../mongooseConnectionOptions';

const debug = createDebug('sskts-jobs:jobs');

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

    const placeRepo = new sskts.repository.Place(sskts.mongoose.connection);
    const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
    const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);

    // 全劇場組織を取得
    const movieTheaterOrganizations = await organizationRepo.searchMovieTheaters({});
    const movieTheaters = await placeRepo.searchMovieTheaters({});
    const importFrom = moment()
        .toDate();
    const importThrough = moment(importFrom)
        .add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks')
        .toDate();
    const runsAt = new Date();

    await Promise.all(movieTheaters.map(async (movieTheater) => {
        try {
            const movieTheaterOrganization = movieTheaterOrganizations.find((m) => m.location.branchCode === movieTheater.branchCode);
            if (movieTheaterOrganization !== undefined) {
                const taskAttributes: sskts.factory.task.IAttributes<sskts.factory.taskName.ImportScreeningEvents> = {
                    name: sskts.factory.taskName.ImportScreeningEvents,
                    status: sskts.factory.taskStatus.Ready,
                    runsAt: runsAt,
                    remainingNumberOfTries: 1,
                    // tslint:disable-next-line:no-null-keyword
                    lastTriedAt: null,
                    numberOfTried: 0,
                    executionResults: [],
                    data: {
                        locationBranchCode: movieTheaterOrganization.location.branchCode,
                        importFrom: importFrom,
                        importThrough: importThrough,
                        xmlEndPoint: movieTheaterOrganization.xmlEndPoint
                    }
                };
                await taskRepo.save(taskAttributes);
                debug('task saved', movieTheater.branchCode);
            }
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
    }));

    await new Promise((resolve) => {
        setTimeout(
            async () => {
                await sskts.mongoose.disconnect();
                resolve();
            },
            // tslint:disable-next-line:no-magic-numbers
            10000
        );
    });
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
