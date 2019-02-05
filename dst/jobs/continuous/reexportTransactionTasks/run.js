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
 * 取引キューエクスポートが実行中のままになっている取引を監視する
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:*');
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default)
    .then(debug)
    // tslint:disable-next-line:no-console
    .catch(console.error);
let countRetry = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 500;
const transactionRepository = new sskts.repository.Transaction(mongoose.connection);
const RETRY_INTERVAL_MINUTES = 10;
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (countRetry > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    countRetry += 1;
    try {
        debug('reexporting tasks...');
        yield transactionRepository.reexportTasks({ intervalInMinutes: RETRY_INTERVAL_MINUTES });
    }
    catch (error) {
        // tslint:disable-next-line:no-console
        console.error(error);
    }
    countRetry -= 1;
}), INTERVAL_MILLISECONDS);
