#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
热更新工具
'''

__author__ = "eddie.zhou@bttc.com"

import argparse
import os
from paramiko import SSHClient
from scp import SCPClient
import sys
import json
import hashlib
import io
import shutil
import zipfile
import utils
import platform as sysPlatform
from bundleFiles import BundleFiles

# 项目所在路径
PROJECT_ROOT = "../../"

# 读取update.json配置文件
def readUpdateJson(platform):
	path = "%supdate.%s.json" % (PROJECT_ROOT, platform)
	if os.path.exists(path):
		f = open(path, "r")
		data = f.read()
		f.close()
		return json.loads(data)
	return json.loads('{"jsV":0,"appV":0,"versionList":{}}')

# 创建jsbundle文件
def createBundle(platform):
	# 读取已有的更新文件，拿到目前的版本号
	updateJson = readUpdateJson(platform)
	targetVersion = updateJson["jsV"] + 1

	# 生成路径
	outDir = os.path.join(os.path.dirname(__file__), "%sbundle/%s/%s/" % (PROJECT_ROOT, platform, targetVersion))
	if not os.path.exists(outDir):
		os.makedirs(outDir)

	entryFile = 'index.%s.js' % platform;
	outDir = os.path.join(os.path.dirname(__file__), "bundle/%s/%s/" % (platform, targetVersion))
	bundleFile = '%sindex.%s.bundle' % (outDir, platform)

	if sysPlatform.system() == 'Darwin':
		os.system('cd %s; react-native bundle --entry-file %s --bundle-output %s --platform %s --assets-dest %s --dev false' % (PROJECT_ROOT, entryFile, bundleFile, platform, outDir))
	else:
		# os.system("createPath.bat %s %s %s %s" % (entryFile, bundleFile, platform, outDir))
		print('not support windowns!!!')
		return

	if platform == "android":
		if targetVersion == 1:
			shutil.copyfile(PROJECT_ROOT + "android/app/build/intermediates/assets/release/index.android.bundle", PROJECT_ROOT + bundleFile)
	print('bundle create success!version => %s platform => %s' % (platform, targetVersion))

def createJSPatches(prevJSPath, curJSPath, patchPath):
	os.system('bsdiff %s %s %s' % (prevJSPath, curJSPath, patchPath))

def createPatchesBetween(prevVersion, curVersion, platform, updateJson):
	if "%s-%s" % (prevVersion, curVersion) in updateJson["versionList"].keys():
		print(u"%s-%s的补丁已经生成过了，跳过" % (prevVersion, curVersion))

	patchesDir = os.path.join(os.path.dirname(__file__), "%spatches/%s/" % (PROJECT_ROOT, platform))
	if not os.path.exists(patchesDir):
		os.makedirs(patchesDir)
	# 找出上一个bundle
	prevBundleFiles = BundleFiles(r"%s/bundle/%s/%s" % (PROJECT_ROOT, platform, prevVersion), platform)
	# 找出当前的bundle
	bundleFileDir = "%s/bundle/%s/%s" % (PROJECT_ROOT, platform, curVersion)
	if not os.path.exists(bundleFileDir):
		print(u"[error] => 请先使用bundle命令生成版本为%s的bundle文件" % curVersion)
		return
	curBundleFiles = BundleFiles(bundleFileDir, platform)
	# 两个bundle对比一下获得差异文件数组
	modifyFileList = curBundleFiles.diff(prevBundleFiles)
	# 获取jsBundle的差异文件
	jsPatchesName = "%s-%s.jsPatches" % (prevVersion, curVersion)
	createJSPatches(prevBundleFiles.getJSBundle().path, curBundleFiles.getJSBundle().path, jsPatchesName)
	# 将差异文件复制到补丁目录
	zipFileList = []
	parentDir = []
	# 差异的资源文件
	patchList = []
	jsBundle = None
	for f in modifyFileList:
		if f.isJS:
			# 再复制一份到当前目录，用来打包用的，打完包了就删掉
			shutil.copy(f.path, f.fileName)
			jsBundle = f.fileName
			zipFileList.append(jsPatchesName)
		else:
			# 再复制一份到当前目录，用来打包用的，打完包了就删掉
			if not f.parentDir in parentDir:
				parentDir.append(f.parentDir)
			filePath = "%s/%s" % (f.parentDir, f.fileName)
			if not os.path.exists(f.parentDir):
				os.makedirs(f.parentDir)
			# print('aaaa', f.path, filePath)s
			shutil.copy(f.path, filePath)
			zipFileList.append(filePath)
			if not f.fileName in patchList:
				patchList.append(f.fileName)

	# 复制完成后再打成zip包
	zipFile = '%s-%s-%s.zip' % (platform, prevVersion, curVersion)
	f = zipfile.ZipFile(zipFile, 'w', zipfile.ZIP_DEFLATED)
	for path in zipFileList:
		f.write(path)
	f.close()
	# 将临时文件删掉
	for d in parentDir:
		shutil.rmtree(d)
	if jsBundle != None:
		os.remove(jsBundle)
	os.remove(jsPatchesName)
		
	# 将zip包移动到补丁目录
	shutil.move(zipFile, "%s%s" % (patchesDir, zipFile))
	print(u"%s-%s版本的%s补丁生成完毕" % (prevVersion, curVersion, platform))

	updateJson["versionList"]["%s-%s" % (prevVersion, curVersion)] = {
		"url": "/%s-%s-%s.zip" % (platform, prevVersion, curVersion),
		"patchList": patchList,
		"md5": utils.getMD5("%s%s" % (patchesDir, zipFile))
	}

def createPatch(platform):
	# 先将已有的补丁删除
	patchDir = os.path.join(os.path.dirname(__file__), "%spatches/" % PROJECT_ROOT)
	for parent, dirNames, fileNames in os.walk(patchDir):
		for fileName in fileNames:
			os.remove(os.path.join(parent, fileName))
	# 先读取update.json配置文件，获取到当前的热更新配置
	updateJson = readUpdateJson(platform)
	updateJson["versionList"] = {}

	# 读取bundle目录获取已经创建好的bundle的版本号数组
	versionArr = []
	bundleDir = os.path.join(os.path.dirname(__file__), "%sbundle/%s/" % (PROJECT_ROOT, platform))
	for parent, dirNames, fileNames in os.walk(bundleDir):
		versionArr = [int(v) for v in dirNames]
		break
	versionArr.sort()
	# print(versionArr)

	# versionArr = []
	# bundleDir = os.path.join(os.path.dirname(__file__), "%sbundle/%s/" % (PROJECT_ROOT, platform))
	# for parent, dirNames, fileNames in os.walk(bundleDir):
	# 	for dirName in dirNames:
	# 		if dirName == platform:
	# 			versionArr.append(int(parent.split('/')[-1]))
	# versionArr.sort()

	# 针对每个版本开始生产补丁
	patchDir = os.path.join(os.path.dirname(__file__), "%spatches/" % PROJECT_ROOT)
	if not os.path.exists(patchDir):
		os.makedirs(patchDir)

	curVIndex = len(versionArr) - 1
	for prevVIndex in xrange(0, len(versionArr) - 1):
		createPatchesBetween(versionArr[prevVIndex], versionArr[curVIndex], platform, updateJson)

	updateJson["jsV"] = int(versionArr[-1])
	f = open("%supdate.%s.json" % (PROJECT_ROOT, platform), "wb")
	f.write(json.dumps(updateJson, sort_keys = True, indent = 4))
	f.close()

	return updateJson["jsV"] > 1

def upload(platform):
	#########非本地##############
	# ssh = SSHClient()
	# try:
	# 	ssh.load_system_host_keys()
	# 	ssh.connect('172.20.11.248')

	# 	# SCPCLient takes a paramiko transport as its only argument
	# 	scp = SCPClient(ssh.get_transport())
	# 	scp.put(os.path.join(os.path.dirname(__file__), '%supdate.%s.json' % (PROJECT_ROOT, platform)), '/home/eddie/app')
	# 	patchDir = os.path.join(os.path.dirname(__file__), '%spatches/%s' % (PROJECT_ROOT, platform))
	# 	if os.path.exists(patchDir):
	# 		scp.put(patchDir, '/home/eddie/app/patches', recursive=True)
	# 	print('uploaded')
	# except Exception as e:
	# 	raise e
	# finally:
	# 	scp.close()

	#########本地测试##############
	# 配置文件
	updateConfig = os.path.join(os.path.dirname(__file__), '%supdate.%s.json' % (PROJECT_ROOT, platform))
	shutil.copyfile(updateConfig, '/usr/local/nginx/html/update.%s.json' % platform)
	# Zip包
	patchDir = os.path.join(os.path.dirname(__file__), '%spatches/%s/' % (PROJECT_ROOT, platform))
	for parent, dirNames, fileNames in os.walk(patchDir):
		for fileName in fileNames:
			patchFile = os.path.join(parent, fileName)
			shutil.copyfile(patchFile, '/usr/local/nginx/html/patches/%s/%s' % (platform, fileName))

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument("action", help = "bundle for create jsbundle, patch for create patch, upload for upload config to web server")
	parser.add_argument("platform", help = "iOS or android")
	options = parser.parse_args()

	action = options.action
	if action != 'bundle' and action != 'patch' and action != 'upload':
		print('action error: %s, only can be bundle, patch or upload' % action)
	else:
		platform = options.platform.lower()
		if platform != 'ios' and platform != 'android':
			print('platform error: %s, only can be iOS or android' % platform)
		else:
			if action == 'bundle':
				createBundle(platform)
			elif action == 'patch':
				createPatch(platform)
			elif action == 'upload':
				upload(platform)