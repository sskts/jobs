"use strict";
/**
 * XMLスケジュールエンドポイントの設定
 */
// tslint:disable:no-http-string
Object.defineProperty(exports, "__esModule", { value: true });
var branchCode;
(function (branchCode) {
    branchCode["ikebukuro"] = "001";
    branchCode["airaTest"] = "118";
    branchCode["aira"] = "018";
    branchCode["kitajima"] = "012";
    branchCode["yukarigaoka"] = "019";
    branchCode["yukarigaokaTest"] = "119";
    branchCode["ikebukuroTest"] = "101";
    branchCode["kitajimaTest"] = "112";
})(branchCode = exports.branchCode || (exports.branchCode = {}));
/*
 * スケジュール取得をXMLと同期のため、このXMLのエンドポイント一覧が必要
 * 劇場のbranchCodeで区切る
 */
exports.movieTheaterXMLEndPoint = {
    '001': {
        baseUrl: 'http://www2.cinemasunshine.jp',
        theaterCodeName: 'ikebukuro'
    },
    '012': {
        baseUrl: 'http://www1.cinemasunshine.jp',
        theaterCodeName: 'kitajima'
    },
    '018': {
        baseUrl: 'http://www1.cinemasunshine.jp',
        theaterCodeName: 'aira'
    },
    '019': {
        baseUrl: 'http://www1.cinemasunshine.jp',
        theaterCodeName: 'yukarigaoka'
    },
    // branchCode > 100 => テスト環境
    101: {
        baseUrl: 'http://cinema.coasystems.net',
        theaterCodeName: 'ikebukuro'
    },
    112: {
        baseUrl: 'http://cinema.coasystems.net',
        theaterCodeName: 'kitajima'
    },
    118: {
        baseUrl: 'http://cinema.coasystems.net',
        theaterCodeName: 'aira'
    },
    119: {
        baseUrl: 'http://cinema.coasystems.net',
        theaterCodeName: 'yukarigaoka'
    }
};
