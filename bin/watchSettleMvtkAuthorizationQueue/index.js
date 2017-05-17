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
 * ムビチケ資産移動
 * 実際は何もしない
 *
 * @ignore
 */
const sskts = require("@motionpicture/sskts-domain");
const createDebug = require("debug");
const mongoose = require("mongoose");
const mongooseConnectionOptions_1 = require("../../mongooseConnectionOptions");
const debug = createDebug('sskts-jobs:bin:watchSettleMvtkAuthorizationQueue');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI, mongooseConnectionOptions_1.default);
let count = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 10;
const INTERVAL_MILLISECONDS = 1000;
const queueAdapter = sskts.adapter.queue(mongoose.connection);
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
        return;
    }
    count += 1;
    try {
        debug('count:', count);
        yield sskts.service.queue.executeSettleMvtkAuthorization()(queueAdapter);
    }
    catch (error) {
        console.error(error.message);
    }
    count -= 1;
}), INTERVAL_MILLISECONDS);