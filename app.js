'use strict';
//node.js のモジュール呼び出し
const fs = require('fs');
const readline = require('readline');
//popu-pref.csv ファイルから読み込み Stream を生成
const rs = fs.createReadStream('./popu-pref.csv');
//rsを readline オブジェクトの input として設定し、rl オブジェクトを生成
const rl = readline.createInterface({ input: rs });
const prefectureDataMap = new Map(); //key: 都道府県 value: 集計データのオブジェクト
//rl オブジェクトで line イベントが発生したら、読み込んだ行の内容を引数にして無名関数を呼び出す
//line イベントは、１行ごとに呼び出される
rl.on('line', (lineString) => {
    const columns = lineString.split(',');
    const year = parseInt(columns[0]); //文字列を整数値に変換
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        let value = null;
        //連想配列 prefectureDataMap に既に都道府県の集計データオブジェクトが存在する場合、それを取得する（存在しなければ初期値を代入して値を生成する）
        if (prefectureDataMap.has(prefecture)) {
            value = prefectureDataMap.get(prefecture);
        } else {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
//close イベントは、全ての行を読み込み終わった際に呼び出される。
rl.on('close', () => {
    //for-of構文は Map や Array の中身を of の前で与えられた変数に代入する
    for (const [key, value] of prefectureDataMap) {
        // 変化率 ＝ 2015年の人口 ÷ 2010年の人口
        value.change = value.popu15 / value.popu10;
    }
    //Array.from(Map)で連想配列を普通の配列に変換
    //sort関数で{}内のルールにもとづいて並び替え
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return `${key}: ${value.popu10}=>${value.popu15} 変化率: ${value.change}`;
    });
    console.log(rankingStrings);
});