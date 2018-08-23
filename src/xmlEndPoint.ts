/**
 * XMLスケジュールエンドポイントの設定
 */
// tslint:disable:no-http-string

export enum branchCode {
    ikebukuro = '001',
    airaTest = '118',
    aira = '018',
    kitajima = '012',
    yukarigaoka = '019',
    yukarigaokaTest = '119',
    ikebukuroTest = '101',
    kitajimaTest = '112'
}

export type XMLEndPoint = { [index in branchCode]: { baseUrl: string; theaterCodeName: string } };

/*
 * スケジュール取得をXMLと同期のため、このXMLのエンドポイント一覧が必要
 * 劇場のbranchCodeで区切る
 */
export const movieTheaterXMLEndPoint: XMLEndPoint = {
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
