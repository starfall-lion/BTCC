/**
 * 热更新
 */

import { NativeModules, Platform } from 'react-native';
import FileTransfer from '@remobile/react-native-file-transfer';
import Zip from '@remobile/react-native-zip';
import fs from 'react-native-fs';
import * as net from './net';
import { hexMd5 } from './md5';

// 是否开启热更新
const ENABLED = false;
// const UPDATE_HOST = "https://static.btcchinacdn.com/plus/app";
const UPDATE_HOST = 'http://10.0.23.100';

const { UpdateModule } = NativeModules;
const { documentPath, jsBundleFile } = UpdateModule;
let serverVersion = null;
let localVersion = null;
/**
 * 本地热更新配置文件路径
 */
const localVersionPath = `${documentPath}/version.json`;
let ZIP_MD5 = '';

export const ERROR = {
  // appv小于线上配置中的appv，说明安装包要重新安装了
  NEED_RESETUP: 'needResetup',
  // 版本号一致，不需要热更新
  DONOT_NEED_UPDATE: 'doNotNeedUpdate',
  // 下载zip出错了
  DOWNLOAD_ZIP: 'downloadZip',
  // 读取zip出错
  READ_ZIP: 'readZip',
  // 验证zip的md5码出错了
  ZIP_MD5: 'zipMD5',
  // 解压zip出错
  UNZIP: 'unzip',
  // 整合补丁出错
  PATCH_APPLY: 'patchApply',
  // 保存热更新配置文件出错了
  SAVE_CONFIG: 'saveConfig',
};

/**
 * 获取线上的配置文件
 */
function getUpdateConfigFromServer() {
  return new Promise((resolve) => {
    net.get(`${UPDATE_HOST}/update.${Platform.OS}.json`, (result) => {
      resolve(result);
    }, () => {
      resolve(null);
    });
  });
}

/**
 * 获取本地的配置文件
 */
function getUpdateConfigFromLocal(updateConfigFromServer) {
  // 将服务器上的配置文件记录下来
  serverVersion = updateConfigFromServer;
  return new Promise((resolve) => {
    fs.readFile(localVersionPath, 'utf8').then((text) => {
      resolve(JSON.parse(text));
    }).catch(() => {
      // 如果本地没有热更新配置文件，就返回一个默认的空配置
      resolve({ jsV: 1, versionList: {}, appV: 1 });
    });
  });
}

/**
 * 将本地的配置文件和线上的配置文件进行对比
 */
function checkVersion(updateConfigFromLocal) {
  global.jsV = updateConfigFromLocal.jsV;
  // 如果之前没有获取到线上的服务器配置，那就用本地的配置充当服务器的配置，也就意味着不需要热更新
  if (serverVersion === null) {
    serverVersion = updateConfigFromLocal;
  }
  return new Promise((resolve, reject) => {
    if (typeof updateConfigFromLocal.appV === 'number') {
      // 将本地的配置文件记录下来
      localVersion = updateConfigFromLocal;
      // 如果appV小了，说明要重新安装了
      if (localVersion.appV < serverVersion.appV) {
        reject(ERROR.NEED_RESETUP);
      } else {
        // 本地版本号小于服务器版本号，就更新
        let localJSVersion = localVersion.jsV;
        if (!localJSVersion) localJSVersion = 0;
        global.jsV = localJSVersion;
        const serverJSVersion = serverVersion.jsV;
        if (localJSVersion < serverJSVersion) {
          // 开始下载
          if (localJSVersion === 0) {
            // 如果本地配置中版本号为0，就取线上配置中versionList的第一个
            // 因为“第一个”就是最初的版本到目前版本的补丁
            let k = null;
            for (k in serverVersion.versionList) {
              resolve(serverVersion.versionList[k]);
              break;
            }
          } else {
            resolve(serverVersion.versionList[`${localJSVersion}-${serverJSVersion}`]);
          }
        } else {
          reject(ERROR.DONOT_NEED_UPDATE);
        }
      }
    } else {
      reject('appv is NAN');
    }
  });
}

/**
 * 开始下载zip
 * @param  {string} url zip包url
 */
function download(versionConfig) {
  return new Promise((resolve, reject) => {
    const url = `${UPDATE_HOST}/patches/${Platform.OS}/${versionConfig.url}`;
    ZIP_MD5 = versionConfig.md5;
    const fileTransfer = new FileTransfer();
    // fileTransfer.onprogress = (progress) => {
    //   console.log(parseInt(progress.loaded * 100 / progress.total))
    // };
    fileTransfer.download(url, `${documentPath}/${jsBundleFile}.zip`, resolve, () => {
      reject(ERROR.DOWNLOAD_ZIP);
    }, true);
  });
}

/**
 * 解压zip
 */
function unzipJSZipFile() {
  return new Promise((resolve, reject) => {
    const zipPath = `${documentPath}/${jsBundleFile}.zip`;
    // 验证md5
    fs.readFile(zipPath, 'ascii').then((buf) => {
      if (hexMd5(buf) === ZIP_MD5) {
         // 验证md5通过，开始解压
        Zip.unzip(zipPath, documentPath, (err) => {
          if (err) {
            // 解压失败
            fs.unlink(zipPath).then(() => {
              reject(ERROR.UNZIP);
            });
          } else {
            // 解压成功，将zip删除后将最新的更新配置保存在本地，然后继续
            fs.unlink(zipPath).then(() => {
              resolve();
            });
          }
        });
      } else {
        // 验证md5失败
        fs.unlink(zipPath).then(() => {
          reject(ERROR.ZIP_MD5);
        }).catch(() => {
          reject(ERROR.ZIP_MD5);
        });
      }
    }).catch(() => {
      reject(ERROR.READ_ZIP);
    });
  });
}

/**
 * 根据补丁生成新的jsBundle
 */
function patchApply() {
  return new Promise((resolve, reject) => {
    if (__DEV__) {
      resolve(JSON.stringify(serverVersion));
    } else {
      UpdateModule.patchApply(Math.max(1, localVersion.jsV), serverVersion.jsV, () => {
        resolve(JSON.stringify(serverVersion));
      }, () => {
        // 失败了
        reject(ERROR.PATCH_APPLY);
      });
    }
  });
}

function initPatchList() {
  global.jsV = localVersion.jsV;
  // 补丁列表
  global.patchList = [];
  let k = null;
  for (k in localVersion.versionList) {
    global.patchList = global.patchList.concat(localVersion.versionList[k].patchList);
  }
  // 去重
  global.patchList = Array.from(new Set(global.patchList));
  for (let i = 0; i < global.patchList.length; i += 1) {
    // 图片都在src/assets/images/下面，所以这里就把src_assets_images_去掉，只保留图片的名字
    global.patchList[i] = global.patchList[i].replace('src_assets_images_', '');
  }
  // console.log('hot update, patchList => ', global.patchList);
}

function saveVersion(content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(localVersionPath, content, 'utf8').then(() => {
      resolve();
    }).catch(() => {
      reject(ERROR.SAVE_CONFIG);
    });
  });
}

function removePatch() {
  return new Promise((resolve) => {
    const patchPath = `${documentPath}/${Math.max(1, localVersion.jsV)}-${serverVersion.jsV}.jsPatches`;
    fs.unlink(patchPath).then(() => {
      resolve();
    }).catch(() => {
      resolve();
    });
  });
}

export function start(doneCallback) {
  // 图片补丁的列表
  global.jsV = 1;
  global.patchList = [];
  if (__DEV__ || !ENABLED) {
    if (doneCallback) {
      doneCallback();
    }
  } else {
    // 先获取线上配置文件
    // 再读取本地配置文件（若没有就返回一个默认的）
    // 对比配置文件
    // 根据对比结果去下载对应的热更新包
    // 解压缩下载好的包得到补丁和图片
    // 应用补丁
    // 将最新的配置文件写入本地
    // 删除下载下来的补丁文件
    // 将补丁中的图片数据存起来，以方便图片可以得到热更新
    getUpdateConfigFromServer()
    .then(getUpdateConfigFromLocal)
    .then(checkVersion)
    .then(download)
    .then(unzipJSZipFile)
    .then(patchApply)
    .then(saveVersion)
    .then(removePatch)
    .then(initPatchList)
    .then(() => {
      // 重启
      UpdateModule.restartApp((info) => {
        if (doneCallback) {
          doneCallback(info);
        }
      });
    })
    .catch((err) => {
      initPatchList();
      if (doneCallback) {
        doneCallback(err);
      }
    });
  }
}
