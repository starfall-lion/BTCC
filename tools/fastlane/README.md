## 使用fastlane自动打包、上传
1. [安装fastlane](https://docs.fastlane.tools/getting-started/ios/setup/)
2. [fastlane文档](https://docs.fastlane.tools)
3. 参数 -V versionName -v versionCode

打包ipa命令

```
python fastlane.py build ios -V 2.1 -v 1
```

打包apk命令

```
python fastlane.py build android -V 2.1 -v 1
```