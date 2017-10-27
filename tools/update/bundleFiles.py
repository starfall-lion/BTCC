#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = "eddie.zhou@bttc.com"

import os
import utils
import re

iosFilePattern = re.compile(r'ios/\d+/')

class BundleFiles(object):
	"""docstring for BundleFiles"""
	def __init__(self, dir, platform):
		super(BundleFiles, self).__init__()

		self.__fileList = []
		for parent, dirnames, fileNames in os.walk(dir):
			for fileName in fileNames:
				if 'DS_Store' in fileName:
					continue
				f = File(parent, fileName, platform)
				if not f.isMeta:
					self.__fileList.append(f)

	# 对比两个bundleFiles，self是新版，another是旧版
	def diff(self, another):
		# 修改过的文件
		modifyFileList = []
		newFileList = self.__fileList
		for newFile in newFileList:
			oldFile = another.getFile(newFile.fileName, newFile.parentDir)
			if oldFile == None:
				# 新的文件在旧的里面没有，那就是新增的
				modifyFileList.append(newFile)
			else:
				if oldFile.md5 != newFile.md5:
					# 两个文件md5不一样，说明有改动
					modifyFileList.append(newFile)
		return modifyFileList
	
	def getFile(self, fileName, parentDir):
		for f in self.__fileList:
			if f.fileName == fileName and f.parentDir == parentDir:
				return f

	def getJSBundle(self):
		for f in self.__fileList:
			if f.isJS:
				return f

class File(object):
	"""docstring for File"""
	def __init__(self, parent, fileName, platform):
		super(File, self).__init__()
		# print(parent)
		if platform.lower() == 'ios':
			self.__parentDir = iosFilePattern.split(parent)[-1]
		else:
			self.__parentDir = parent.split(os.sep)[-1]
		# self.__parentDir = parent.split('ios/' if platform.lower() == 'ios' else os.sep)[-1]
		self.__fileName  = fileName
		self.__path      = os.path.join(parent, fileName)
		self.__md5       = utils.getMD5(self.__path)
		self.__isJS      = fileName.split('.')[-1] == 'bundle'
		self.__isMeta    = fileName.split('.')[-1] == 'meta'
	
	@property
	def fileName(self):
		return self.__fileName

	@property
	def path(self):
		return self.__path

	@property
	def md5(self):
		return self.__md5

	@property
	def parentDir(self):
		return self.__parentDir

	@property
	def isJS(self):
		return self.__isJS

	@property
	def isMeta(self):
		return self.__isMeta