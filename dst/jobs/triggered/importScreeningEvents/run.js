"use strict";
/**
 * 上映イベントインポート
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        const eventRepository = new sskts.repository.Event(sskts.mongoose.connection);
        const placeRepository = new sskts.repository.Place(sskts.mongoose.connection);
        const organizationRepository = new sskts.repository.Organization(sskts.mongoose.connection);
        // 全劇場組織を取得
        const movieTheaters = yield organizationRepository.searchMovieTheaters({});
        const importFrom = moment().toDate();
        const importThrough = moment().add(LENGTH_IMPORT_SCREENING_EVENTS_IN_WEEKS, 'weeks').toDate();
        // 全劇場のインポート処理を並列実行させるとデバッグがしづらいので、直列実行にしてみる(並列よりも時間はかかるがひとまず問題なし)
        for (const movieTheater of movieTheaters) {
            const branchCode = movieTheater.location.branchCode;
            try {
                yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    // インポート処理で予期せぬ状態になっても、最悪{TIMEOUT}で強制終了するように
                    const TIMEOUT = 120000;
                    const timoutTimer = setInterval(() => {
                        reject(new Error(`Abort importing forcibly...${branchCode} after ${TIMEOUT} milliseconds`));
                    }, TIMEOUT);
                    debug('importing screening events...', branchCode);
                    yield sskts.service.masterSync.importScreeningEvents(branchCode, importFrom, importThrough, movieTheater.xmlEndPoint // 急遽変更を強いられたので型のアップデートが間に合わずanyで逃げる
                    )({
                        event: eventRepository,
                        place: placeRepository
                    }).then(() => {
                        debug('screening events imported.', branchCode);
                        clearInterval(timoutTimer);
                        resolve();
                    }).catch((err) => {
                        clearInterval(timoutTimer);
                        reject(err);
                    });
                }));
            }
            catch (error) {
                console.error(error, branchCode);
            }
        }
        // 並列実行する場合はこちら
        // await Promise.all(movieTheaters.map(async (movieTheater) => {
        //     try {
        //         debug('importing screening events...');
        //         await sskts.service.masterSync.importScreeningEvents(
        //             movieTheater.location.branchCode,
        //             importFrom,
        //             importThrough,
        //             (<any>movieTheater).xmlEndPoint // 急遽変更を強いられたので型のアップデートが間に合わずanyで逃げる
        //         )({
        //             event: eventRepository,
        //             place: placeRepository
        //         });
        //         debug('screening events imported.');
        //     } catch (error) {
        //         console.error(error);
        //     }
        // }));
        yield sskts.mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
