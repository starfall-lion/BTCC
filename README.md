
以下三个文件，因为版本问题，需要将方法createJSModules前面一行的@Override注释掉

```
/node_modules/@remobile/react-native-file-transfer/android/src/main/java/com/remobile/filetransfer/RCTFileTransferPackage.java
/node_modules/@remobile/react-native-toast/android/src/main/java/com/remobile/toast/RCTToastPackage.java
/node_modules/@remobile/react-native-zip/android/src/main/java/com/remobile/zip/RCTZipPackage.java
```


热更新需要修改/node_modules/react-native/Libraries/Image/resolveAssetSource.js
```
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule resolveAssetSource
 * @flow
 *
 * Resolves an asset into a `source` for `Image`.
 */
'use strict';

const AssetRegistry = require('AssetRegistry');
const AssetSourceResolver = require('AssetSourceResolver');
const NativeModules = require('NativeModules');

import type { ResolvedAssetSource } from 'AssetSourceResolver';

let _customSourceTransformer, _serverURL, _bundleSourcePath;

function getDevServerURL(): ?string {
  if (_serverURL === undefined) {
    var scriptURL = NativeModules.SourceCode.scriptURL;
    var match = scriptURL && scriptURL.match(/^https?:\/\/.*?\//);
    if (match) {
      // Bundle was loaded from network
      _serverURL = match[0];
    } else {
      // Bundle was loaded from file
      _serverURL = null;
    }
  }
  return _serverURL;
}

function getBundleSourcePath(asset): ?string {
  // 热更新修改  开始
  let scriptURL = NativeModules.SourceCode.scriptURL;
  if (global.patchList) {
    let picName = `${asset.name}.${asset.type}`;
    for (let i = 0; i < global.patchList.length; i++) {
      if (global.patchList[i] === picName) {
        if (scriptURL.startsWith('assets://')) {
          // running from within assets, no offline path to use
          return null;
        }
        if (scriptURL.startsWith('file://')) {
          // cut off the protocol
          return scriptURL.substring(7, scriptURL.lastIndexOf('/') + 1);
        } else {
          return scriptURL.substring(0, scriptURL.lastIndexOf('/') + 1);
        }
      }
    }
  }
  if (scriptURL && !scriptURL.startsWith('http://')) {
    scriptURL = null;
  }
  // 热更新修改  结束
  if (_bundleSourcePath === undefined) {
    // const scriptURL = NativeModules.SourceCode.scriptURL;
    if (!scriptURL) {
      // scriptURL is falsy, we have nothing to go on here
      _bundleSourcePath = null;
      return _bundleSourcePath;
    }
    if (scriptURL.startsWith('assets://')) {
      // running from within assets, no offline path to use
      _bundleSourcePath = null;
      return _bundleSourcePath;
    }
    if (scriptURL.startsWith('file://')) {
      // cut off the protocol
      _bundleSourcePath = scriptURL.substring(7, scriptURL.lastIndexOf('/') + 1);
    } else {
      _bundleSourcePath = scriptURL.substring(0, scriptURL.lastIndexOf('/') + 1);
    }
  }

  return _bundleSourcePath;
}

function setCustomSourceTransformer(
  transformer: (resolver: AssetSourceResolver) => ResolvedAssetSource,
): void {
  _customSourceTransformer = transformer;
}

/**
 * `source` is either a number (opaque type returned by require('./foo.png'))
 * or an `ImageSource` like { uri: '<http location || file path>' }
 */
function resolveAssetSource(source: any): ?ResolvedAssetSource {
  if (typeof source === 'object') {
    return source;
  }

  var asset = AssetRegistry.getAssetByID(source);
  if (!asset) {
    return null;
  }

  const resolver = new AssetSourceResolver(getDevServerURL(), getBundleSourcePath(asset), asset);
  if (_customSourceTransformer) {
    return _customSourceTransformer(resolver);
  }
  return resolver.defaultAsset();
}

module.exports = resolveAssetSource;
module.exports.pickScale = AssetSourceResolver.pickScale;
module.exports.setCustomSourceTransformer = setCustomSourceTransformer;

```