"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 上映イベントインポートタスク作成
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const moment = require("moment");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:*');
/**
 * 上映イベントを何週間後までインポートするか
 * @const {number}
 */
const LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS = (process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS !== undefined)
    // tslint:disable-next-line:no-magic-numbers
    ? parseInt(process.env.LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 10)
    : 1;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        yield sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const taskRepo = new sskts.repository.Task(sskts.mongoose.connection);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        // 全劇場組織を取得
        const movieTheaters = yield organizationRepo.searchMovieTheaters({});
        const importFrom = moment().toDate();
        const importThrough = moment(importFrom).add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks').toDate();
        const runsAt = new Date();
        yield Promise.all(movieTheaters.map((movieTheater) => __awaiter(this, void 0, void 0, function* () {
            try {
                const taskAttributes = {
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
                yield taskRepo.save(taskAttributes);
            }
            catch (error) {
                console.error(error);
            }
        })));
        yield sskts.mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
