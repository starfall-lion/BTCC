import { NetInfo } from 'react-native';

// import * as utils from './utils';

const TIME_OUT = 12000;

let isConnected = true;

function handleConnectivityChange(_isConnected) {
  isConnected = _isConnected;
}

NetInfo.isConnected.addEventListener('change', handleConnectivityChange);
NetInfo.isConnected.fetch().done((_isConnected) => { isConnected = _isConnected; });

function timeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject('网络似乎不通畅，请稍后再试'), ms);
    promise
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(reject);
  });
}

/**
 * 发送post请求
 * @param  {[string]}   url             api
 * @param  {[json]}     data            数据
 * @param  {[function]} successCallback 成功的回调
 * @param  {[function]} errorCallback   失败的回调
 */
export function post(url, data, successCallback, errorCallback = null) {
  if (!isConnected) {
    // utils.toast('网络链接已断开');
    if (errorCallback) {
      errorCallback('net is not Connected');
    }
    return;
  }
  timeout(fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // 'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
    body: JSON.stringify(data),
  }), TIME_OUT)
    .then(response => response.text())
    .then((responseText) => {
      successCallback(JSON.parse(responseText));
    })
    .catch(e => errorCallback && errorCallback(e));
}

/**
 * 发送get请求
 * @param  {[string]}   url             api
 * @param  {[function]} successCallback 成功时的回调
 * @param  {[function]} errorCallback   错误时的回调
 */
export function get(url, successCallback, errorCallback = null) {
  if (!isConnected) {
    // utils.toast('网络链接已断开');
    if (errorCallback) {
      errorCallback('net is not Connected');
    }
    return;
  }
  timeout(fetch(url), TIME_OUT)
    .then(response => response.text())
    .then((responseText) => {
      // successCallback(JSON.parse(responseText));
      // on success
      successCallback(JSON.parse(responseText));
    })
    .catch(e => errorCallback && errorCallback(e));
}
