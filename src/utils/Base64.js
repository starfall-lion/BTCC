export default class Base64 {
  // private property
  static _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  // public method for encoding
  static encode = (input) => {
    let output = '';
    let chr1;
    let chr2;
    let chr3;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let i = 0;

    const inputBase64 = Base64._utf8_encode(input);

    while (i < inputBase64.length) {
      chr1 = inputBase64.charCodeAt(i++);
      chr2 = inputBase64.charCodeAt(i++);
      chr3 = inputBase64.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = 64;
        enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
      Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
      Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
    }

    return output;
  }

  // public method for decoding
  static decode = (input) => {
    let output = '';
    let chr1;
    let chr2;
    let chr3;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let i = 0;

    const inputPost = input.replace(/[^A-Za-z0-9+/=]/g, '');

    while (i < inputPost.length) {
      enc1 = Base64._keyStr.indexOf(inputPost.charAt(i++));
      enc2 = Base64._keyStr.indexOf(inputPost.charAt(i++));
      enc3 = Base64._keyStr.indexOf(inputPost.charAt(i++));
      enc4 = Base64._keyStr.indexOf(inputPost.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output += String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output += String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output += String.fromCharCode(chr3);
      }
    }

    output = Base64._utf8_decode(output);

    return output;
  }

  // private method for UTF-8 encoding
  static _utf8_encode = (string) => {
    const stringPost = string.replace(/\r\n/g, '\n');
    let utftext = '';

    for (let n = 0; n < stringPost.length; n += 1) {
      const c = stringPost.charCodeAt(n);

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

  // private method for UTF-8 decoding
  static _utf8_decode = (utftext) => {
    let string = '';
    let i = 0;
    let c = 0;
    let c2 = 0;
    let c3 = 0;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }

    return string;
  }
}
