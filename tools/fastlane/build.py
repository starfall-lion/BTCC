#!/usr/bin/env python
# -*- coding: utf-8 -*-

import config
import os
import re
import shutil
import time
import subprocess
import helper
import bugly

def exportIPA(version, bundleVersion, isTest):
	logfileName = './logs/exportIPA-%s' % helper.now()
	if os.path.exists(logfileName):
		helper.writeFile('', logfileName)
	if not os.path.exists(config.IPA_EXPORT_DIR):
		os.makedirs(config.IPA_EXPORT_DIR)

	# 修改版本号
	infoPlistFilePath = '%s/ios/%s/Info.plist' % (config.PROJECT_PATH, config.PROJECT_NAME)
	patternArr = [
		re.compile(r'<key>CFBundleShortVersionString</key>\s+<string>.*'),
		re.compile(r'<key>CFBundleVersion</key>\s+<string>.*')
	]
	replaceStrArr = [
		u'<key>CFBundleShortVersionString</key>\n\t<string>%s</string>' % version,
		u'<key>CFBundleVersion</key>\n\t<string>%d</string>' % bundleVersion
	]
	helper.modifyFile(infoPlistFilePath, patternArr, replaceStrArr)
		
	# development ad-hoc app-store
	projectPath = os.path.join(config.PROJECT_PATH, 'ios', '%s.%s' % (config.PROJECT_NAME, 'xcworkspace' if config.IS_WORKSPACE else 'xcodeproj'))
	helper.runCmd('fastlane gym --export_method %s -s %s %s %s -n %s.ipa --derived_data_path %s -o %s/bin' % (isTest and 'ad-hoc' or 'app-store', config.SCHEME, '-w' if config.IS_WORKSPACE else '-p', projectPath, config.PROJECT_NAME, config.IPA_EXPORT_DIR, config.IPA_EXPORT_DIR), logfileName)
	log = helper.readFile(logfileName)
	if 'Successfully exported and compressed dSYM file' in log and 'Successfully exported and signed the ipa file' in log:
		print('Successfully exported and signed the ipa file')
	else:
		print('build failed')
	return '%s/bin/%s.ipa' % (config.IPA_EXPORT_DIR, config.PROJECT_NAME)

def exportAPK(version, bundleVersion):
	# 修改版本号
	infoPlistFilePath = '%s/android/app/build.gradle' % config.PROJECT_PATH
	patternArr = [
		re.compile(r'versionName ".*"'),
		re.compile(r'versionCode \d+')
	]
	replaceStrArr = [
		u'versionName "%s"' % version,
		u'versionCode %d' % bundleVersion
	]
	helper.modifyFile(infoPlistFilePath, patternArr, replaceStrArr)

	ps = subprocess.Popen('cd %s/android && ./gradlew assembleRelease' % config.PROJECT_PATH, shell = True)
	ps.wait()
	return '%s/android/app/build/outputs/apk/app-release.apk' % config.PROJECT_PATH

def upload(ipaPath):
	logfileName = './logs/upload-%s' % helper.now()
	if os.path.exists(logfileName):
		helper.writeFile('', logfileName)
	# --skip_binary_upload
	# --submit_for_review
	# --skip_metadata
	# --skip_screenshots
	cmd = 'DELIVER_ITMSTRANSPORTER_ADDITIONAL_UPLOAD_PARAMETERS="-t DAV" fastlane deliver --force --verbose --ipa %s --username %s' % (ipaPath, config.APP_STORE_ACCOUNT)
	# 跳过上传宣传图
	cmd += ' --skip_screenshots'
	# 跳过上传元数据
	cmd += ' --skip_metadata'
	helper.runCmd(cmd, logfileName)

def doAction(platform, version, bundleVersion, isTest):
	if platform == 'ios':
		ipaPath = exportIPA(version, bundleVersion, isTest)
		# 上传
		if isTest:
			# ad-hoc版本可以上传到bugly分发平台以供测试
			# url = bugly.doAction('miningPool', 'com.btcchina.pool', ipaPath)
			pass
		else:
			# 暂不上传苹果后台
			# upload(ipaPath)
			pass
		print('export IPA success %s' % ipaPath)
		return ipaPath
	elif platform == 'android':
		apkPath = exportAPK(version, bundleVersion)
		print('export APK success %s' % apkPath)
		return apkPath