const chrsz = 8;
const hexcase = 0;

function str2binl(str) {
  const bin = [];
  const mask = (1 << chrsz) - 1;
  for (let i = 0; i < str.length * chrsz; i += chrsz) {
    bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
  }
  return bin;
}

function bitRol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

function safeAdd(x, y) {
  const lsw = (x & 0xFFFF) + (y & 0xFFFF);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

function md5Cmn(q, a, b, x, s, t) {
  return safeAdd(bitRol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
}

function md5FF(a, b, c, d, x, s, t) {
  return md5Cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function md5GG(a, b, c, d, x, s, t) {
  return md5Cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function md5HH(a, b, c, d, x, s, t) {
  return md5Cmn(b ^ c ^ d, a, b, x, s, t);
}

function md5II(a, b, c, d, x, s, t) {
  return md5Cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function coreMD5(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = md5FF(a, b, c, d, x[i + 0], 7, -680876936);
    d = md5FF(d, a, b, c, x[i + 1], 12, -389564586);
    c = md5FF(c, d, a, b, x[i + 2], 17, 606105819);
    b = md5FF(b, c, d, a, x[i + 3], 22, -1044525330);
    a = md5FF(a, b, c, d, x[i + 4], 7, -176418897);
    d = md5FF(d, a, b, c, x[i + 5], 12, 1200080426);
    c = md5FF(c, d, a, b, x[i + 6], 17, -1473231341);
    b = md5FF(b, c, d, a, x[i + 7], 22, -45705983);
    a = md5FF(a, b, c, d, x[i + 8], 7, 1770035416);
    d = md5FF(d, a, b, c, x[i + 9], 12, -1958414417);
    c = md5FF(c, d, a, b, x[i + 10], 17, -42063);
    b = md5FF(b, c, d, a, x[i + 11], 22, -1990404162);
    a = md5FF(a, b, c, d, x[i + 12], 7, 1804603682);
    d = md5FF(d, a, b, c, x[i + 13], 12, -40341101);
    c = md5FF(c, d, a, b, x[i + 14], 17, -1502002290);
    b = md5FF(b, c, d, a, x[i + 15], 22, 1236535329);

    a = md5GG(a, b, c, d, x[i + 1], 5, -165796510);
    d = md5GG(d, a, b, c, x[i + 6], 9, -1069501632);
    c = md5GG(c, d, a, b, x[i + 11], 14, 643717713);
    b = md5GG(b, c, d, a, x[i + 0], 20, -373897302);
    a = md5GG(a, b, c, d, x[i + 5], 5, -701558691);
    d = md5GG(d, a, b, c, x[i + 10], 9, 38016083);
    c = md5GG(c, d, a, b, x[i + 15], 14, -660478335);
    b = md5GG(b, c, d, a, x[i + 4], 20, -405537848);
    a = md5GG(a, b, c, d, x[i + 9], 5, 568446438);
    d = md5GG(d, a, b, c, x[i + 14], 9, -1019803690);
    c = md5GG(c, d, a, b, x[i + 3], 14, -187363961);
    b = md5GG(b, c, d, a, x[i + 8], 20, 1163531501);
    a = md5GG(a, b, c, d, x[i + 13], 5, -1444681467);
    d = md5GG(d, a, b, c, x[i + 2], 9, -51403784);
    c = md5GG(c, d, a, b, x[i + 7], 14, 1735328473);
    b = md5GG(b, c, d, a, x[i + 12], 20, -1926607734);

    a = md5HH(a, b, c, d, x[i + 5], 4, -378558);
    d = md5HH(d, a, b, c, x[i + 8], 11, -2022574463);
    c = md5HH(c, d, a, b, x[i + 11], 16, 1839030562);
    b = md5HH(b, c, d, a, x[i + 14], 23, -35309556);
    a = md5HH(a, b, c, d, x[i + 1], 4, -1530992060);
    d = md5HH(d, a, b, c, x[i + 4], 11, 1272893353);
    c = md5HH(c, d, a, b, x[i + 7], 16, -155497632);
    b = md5HH(b, c, d, a, x[i + 10], 23, -1094730640);
    a = md5HH(a, b, c, d, x[i + 13], 4, 681279174);
    d = md5HH(d, a, b, c, x[i + 0], 11, -358537222);
    c = md5HH(c, d, a, b, x[i + 3], 16, -722521979);
    b = md5HH(b, c, d, a, x[i + 6], 23, 76029189);
    a = md5HH(a, b, c, d, x[i + 9], 4, -640364487);
    d = md5HH(d, a, b, c, x[i + 12], 11, -421815835);
    c = md5HH(c, d, a, b, x[i + 15], 16, 530742520);
    b = md5HH(b, c, d, a, x[i + 2], 23, -995338651);

    a = md5II(a, b, c, d, x[i + 0], 6, -198630844);
    d = md5II(d, a, b, c, x[i + 7], 10, 1126891415);
    c = md5II(c, d, a, b, x[i + 14], 15, -1416354905);
    b = md5II(b, c, d, a, x[i + 5], 21, -57434055);
    a = md5II(a, b, c, d, x[i + 12], 6, 1700485571);
    d = md5II(d, a, b, c, x[i + 3], 10, -1894986606);
    c = md5II(c, d, a, b, x[i + 10], 15, -1051523);
    b = md5II(b, c, d, a, x[i + 1], 21, -2054922799);
    a = md5II(a, b, c, d, x[i + 8], 6, 1873313359);
    d = md5II(d, a, b, c, x[i + 15], 10, -30611744);
    c = md5II(c, d, a, b, x[i + 6], 15, -1560198380);
    b = md5II(b, c, d, a, x[i + 13], 21, 1309151649);
    a = md5II(a, b, c, d, x[i + 4], 6, -145523070);
    d = md5II(d, a, b, c, x[i + 11], 10, -1120210379);
    c = md5II(c, d, a, b, x[i + 2], 15, 718787259);
    b = md5II(b, c, d, a, x[i + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }
  return [a, b, c, d];
}

function binl2hex(binarray) {
  const hexTab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
  let str = '';
  for (let i = 0; i < binarray.length * 4; i += 1) {
    str += hexTab.charAt((binarray[i >> 2] >> (((i % 4) * 8) + 4)) & 0xF) +
      hexTab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
  }
  return str;
}

export function hexMd5(s) {
  return binl2hex(coreMD5(str2binl(s), s.length * chrsz));
}

export function md5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    const lX4 = (lX & 0x40000000);
    const lY4 = (lY & 0x40000000);
    const lX8 = (lX & 0x80000000);
    const lY8 = (lY & 0x80000000);
    const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      }
      return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    }
    return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(str) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWordsTemp1 = lMessageLength + 8;
    const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
    const lWordArray = []; // Array(lNumberOfWords-1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount += 1;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    let WordToHexValue = '';
    let WordToHexValueTemp = '';
    let lByte;
    let lCount;
    for (lCount = 0; lCount <= 3; lCount += 1) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValueTemp = `0${lByte.toString(16)}`;
      WordToHexValue = `${WordToHexValue}${WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2)}`;
    }
    return WordToHexValue;
  }
  function Utf8Encode(str) {
    const newStr = str.replace(/\r\n/g, '\n');
    let utftext = '';
    for (let n = 0; n < newStr.length; n += 1) {
      const c = newStr.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  let x = [];
  let k;
  let AA;
  let BB;
  let CC;
  let DD;
  let a;
  let b;
  let c;
  let d;
  const S11 = 7;
  const S12 = 12;
  const S13 = 17;
  const S14 = 22;
  const S21 = 5;
  const S22 = 9;
  const S23 = 14;
  const S24 = 20;
  const S31 = 4;
  const S32 = 11;
  const S33 = 16;
  const S34 = 23;
  const S41 = 6;
  const S42 = 10;
  const S43 = 15;
  const S44 = 21;
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }
  const temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}
