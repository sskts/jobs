"use strict";
/**
 * 上映イベントインポート
 *
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
const mongooseConnectionOptions_1 = require("../../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:*');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const eventAdapter = sskts.adapter.event(sskts.mongoose.connection);
        const placeAdapter = sskts.adapter.place(sskts.mongoose.connection);
        const organizationAdapter = sskts.adapter.organization(sskts.mongoose.connection);
        // 全劇場組織を取得
        const movieTheaters = yield sskts.service.organization.searchMovieTheaters({})(organizationAdapter);
        yield Promise.all(movieTheaters.map((movieTheater) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug('importing films...');
                yield sskts.service.event.importScreeningEvents(movieTheater.location.branchCode, moment().toDate(), moment().add(1, 'week').toDate())(eventAdapter, placeAdapter);
                debug('films imported.');
            }
            catch (error) {
                console.error(error);
            }
        })));
        sskts.mongoose.disconnect();
    });
}
main().then(() => {
    debug('success!');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
