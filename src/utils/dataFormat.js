import moment from 'moment';

export const sizeOfByte = (str, charset) => {
  let total = 0;
  let charCode = '';
  const charSet = charset ? charset.toLowerCase() : '';
  if (charSet === 'utf-16' || charSet === 'utf16') {
    const len = str.length;
    for (let i = 0; i < len; i += 1) {
      charCode = str.charCodeAt(i);
      if (charCode <= 0xffff) {
        total += 2;
      } else {
        total += 4;
      }
    }
  } else {
    const len = str.length;
    for (let i = 0; i < len; i += 1) {
      charCode = str.charCodeAt(i);
      if (charCode <= 0x007f) {
        total += 1;
      } else if (charCode <= 0x07ff) {
        total += 2;
      } else if (charCode <= 0xffff) {
        total += 3;
      } else {
        total += 4;
      }
    }
  }
  return total;
};

export const formatLongString = (str, byteSizeLimit) => {
  if (sizeOfByte(str) > byteSizeLimit) {
    return `${str.substr(0, byteSizeLimit - 3)}...`;
  }
  return str;
};

export const moneyFormat = (num) => {
  if (num < 1000) return num;
  const parsedArr = num.toString().split('.');
  const integer = parsedArr[0];
  const fraction = parsedArr[1];
  const numArr = integer.split('');
  const length = numArr.length;
  const postInt = numArr.map((digit, index) => ((length - index) % 3 === 0 && index !== 0 ? `,${digit}` : digit)).join('');
  return fraction ? `${postInt}.${fraction}` : postInt;
};

export const predictDiffculty = (blocks, blockchain) => {
  let blocksPerDay = 144;
  if (blockchain === 'litecoin') {
    blocksPerDay = 576;
  }
  const duration = moment.duration((blocks / blocksPerDay) * 24, 'hours');
  return `${duration.days()}天${duration.hours()}小时内`;
};

export const hashrateFormat = (hashrate) => {
  let magnitude = 1;
  let unit = '';
  if (hashrate >= 1e3 && hashrate < 1e6) {
    magnitude = 1e3;
    unit = 'K';
  } if (hashrate >= 1e6 && hashrate < 1e9) {
    magnitude = 1e6;
    unit = 'M';
  } else if (hashrate >= 1e9 && hashrate < 1e12) {
    magnitude = 1e9;
    unit = 'G';
  } else if (hashrate >= 1e12 && hashrate < 1e15) {
    magnitude = 1e12;
    unit = 'T';
  } else if (hashrate >= 1e15) {
    magnitude = 1e15;
    unit = 'P';
  }
  return {
    number: parseFloat((hashrate / magnitude).toFixed(3)),
    unit,
    magnitude,
  };
  // return `${parseFloat((hashrate / magnitude).toFixed(3))} ${unit}/s`;
};
