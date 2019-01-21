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
 * 劇場インポート
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:jobs');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        debug('connecting mongodb...');
        yield sskts.mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
        const organizationRepo = new sskts.repository.Organization(sskts.mongoose.connection);
        const placeRepo = new sskts.repository.Place(sskts.mongoose.connection);
        // 全劇場組織を取得
        const movieTheaters = yield organizationRepo.searchMovieTheaters({});
        for (const movieTheater of movieTheaters) {
            const branchCode = movieTheater.location.branchCode;
            try {
                debug('importing movieTheater...', branchCode);
                yield sskts.service.masterSync.importMovieTheater(branchCode)({
                    organization: organizationRepo,
                    place: placeRepo
                });
                debug('movieTheater imported', branchCode);
            }
            catch (error) {
                // tslint:disable-next-line:no-console
                console.error(error);
            }
        }
        yield sskts.mongoose.disconnect();
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
