'use strict'

const COUNT = Number(process.argv[2] || 3);  // SIM契約数
const VOICE_COUNT = Number(process.argv[3] || 2);  // 音声SIM契約数
const MIN_USAGE = Number(process.argv[4] || 0); // データ容量最小 [GB]
const MAX_USAGE = Number(process.argv[5] || 20); // データ容量最大 [GB]

// IIJmio SIM 料金プラン（データ SIM は割高なので除く。2023-11-01 現在）
const PRICES = [
  { type: 'voice', usage: 2, price: 850 },    // 音声 eSIM or SIM
  { type: 'voice', usage: 5, price: 990 },    // 音声 eSIM or SIM
  { type: 'voice', usage: 10, price: 1500 },  // 音声 eSIM or SIM
  { type: 'voice', usage: 15, price: 1800 },  // 音声 eSIM or SIM
  { type: 'voice', usage: 20, price: 2000 },  // 音声 eSIM or SIM
  { type: 'data', usage: 2, price: 440 },     // データ eSIM
  { type: 'data', usage: 5, price: 660 },     // データ eSIM
  { type: 'data', usage: 10, price: 1100 },   // データ eSIM
  { type: 'data', usage: 15, price: 1430 },   // データ eSIM
  { type: 'data', usage: 20, price: 1650 },   // データ eSIM
]

// 正数をn進数にしたときの各桁を配列にして返す。
// number: 正数
// base: 基数
const toDigits = (number, base) => {
  const digits = [];

  while (0 < number) {
    digits.unshift(number % base);
    number = Math.floor(number / base);
  }

  return 0 < digits.length ? digits : [0];
}

// 二つの配列を比較して要素が同じなら true を返す。
// a: 配列
// b: 配列
function equal(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

// 料金プラン数をn進数、契約数を桁数に見立てて組み合わせを集計する。
const uniqueDigits = [];
for (let i = 0; i < Math.pow(PRICES.length, COUNT); i++) {
  const digits = toDigits(i, PRICES.length);

  if (digits.length < COUNT) {
    const padding = Array(COUNT - digits.length).fill(0);
    digits.unshift(...padding);
  }

  // 愚直に重複を除く
  let isUnique = true;
  const sortedDigits = [...digits].sort();
  for (let j = 0; j < uniqueDigits.length; j++) {
    if (equal(sortedDigits, uniqueDigits[j])) {
      isUnique = false;
      break;
    }
  }
  if (isUnique) {
    uniqueDigits.push(digits);
    //   console.log(i, digits);
    // } else {
    //   console.log(i, digits, '×');
  }
}

// 音声SIM契約数とデータ容量の条件にあう料金プランの組み合わせを集計する。
const planCombinations = [];
uniqueDigits.forEach(digits => {
  const plans = digits.map(x => PRICES[x]);

  if (plans.filter(x => (x.type === 'voice')).length !== VOICE_COUNT) {
    return;
  }

  const sum = {
    price: plans.map(x => x.price).reduce((accumulator, current) => accumulator + current, 0),
    usage: plans.map(x => x.usage).reduce((accumulator, current) => accumulator + current, 0),
  };

  if ((MIN_USAGE <= sum.usage) && (sum.usage <= MAX_USAGE)) {
    const combination = { plans, sum, unit: sum.price / sum.usage };
    planCombinations.push(combination);
  }
})

// 単価でソートする
planCombinations.sort((a, b) => a.unit - b.unit);

console.log(`単価の安い組み合わせランキング`);
console.log(`条件: 契約SIM数=${COUNT}（うち音声SIM=${VOICE_COUNT}）&& データ容量=${MIN_USAGE}〜${MAX_USAGE}[GB] \n`);

for (let i = 0; i < planCombinations.length; i++) {
  const combination = planCombinations[i];
  console.log(`No.${i + 1}, データ容量:${combination.sum.usage} [GB], 料金:￥${combination.sum.price}, 単価:￥${Math.floor(combination.unit)} [/GB]`);

  console.log('\tプラン内訳');
  combination.plans.forEach(plan => {
    const type = (() => {
      switch (plan.type) {
        case 'voice': return '音声eSIM'
        case 'data': return 'データeSIM'
      }
      return 'unknown'
    })();

    console.log(`\t・${type}, データ容量:${plan.usage} [GB], 料金:￥${plan.price}`);
  })

  console.log();
}












// 2進数 x 2桁, 2^2
// 00
// 01
// 10
// 11

// 2進数 x 3桁, 2^3
// 000
// 001
// 010
// 011
// 100
// 101
// 110
// 111

// 3進数 x 2桁, 3^2
// 00
// 01
// 02
// 10
// 11
// 12
// 20
// 21
// 22

// 3進数 x 3桁, 3^3
// 000
// 001
// 002
// 010
// 011
// 012
// 020
// 021
// 022
// 100
// 101
// 102
// 110
// 111
// 112
// 120
// 121
// 122
// 200
// 201
// 202
// 210
// 211
// 212
// 220
// 221
// 222

// n進数のl桁

// 2進数の3桁
// 0b111=2*2*2-1

// 3進数の2桁
// 0k22=3*3-1

// 3進数の3桁
// 0k222=3*3*3-1




// 000
// 001
// 002
// 010 ×
// 011
// 012
// 020 ×
// 021 ×
// 022 
// 100 ×
// 101 ×
// 102 ×
// 110 ×
// 111
// 112
// 120 ×
// 121 ×
// 122
// 200 ×
// 201 ×
// 202 ×
// 210 ×
// 211 ×
// 212 ×
// 220 ×
// 221 ×
// 222
