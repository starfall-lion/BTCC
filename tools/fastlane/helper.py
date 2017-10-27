#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import subprocess
import os
import codecs
import re
import datetime
import time
import config

project_dir = None
mailContent = ''

def now():
	return time.strftime('%Y-%m-%d-%H-%M-%S', time.localtime(time.time()))

def appendMail(content):
	global mailContent
	mailContent += '[%s] => %s\n' % (now(), content)

def writeFile(content, path):
	f = open(path, 'wb')
	f.write(content)
	f.close()

def readFile(path):
	f = open(path, 'r')
	txt = f.read()
	f.close()
	return txt

def readJson(path):
	if not os.path.exists(path):
		raise Exception("this file is not exits => " + path)
	with open(path) as f:
		# return f.read()
		return json.load(f)

def modifyFile(filePath, patternArr, replaceStrArr):
	if len(patternArr) != len(replaceStrArr):
		raise Exception("patternArr's length not equal replaceStrArr's length")
	file = codecs.open(filePath, 'r', 'utf-8')
	fileContent = file.read()
	file.close()

	for i in range(0, len(patternArr)):
		fileContent = re.sub(patternArr[i], replaceStrArr[i], fileContent)

	file = codecs.open(filePath, 'wb', 'utf-8');
	file.write(fileContent)
	file.close()

def runCmd(cmd, logfile, timeout = 1200):
	if config.IS_WIN:
		print(u'cmd can not run on window!', cmd)
	else:
		print(u'run cmd => %s' % cmd)
		process = subprocess.Popen('%s >>%s 2>&1' % (cmd, logfile), shell = True)
		# process = subprocess.Popen(cmd, shell = True)
		# process.wait()
		start = datetime.datetime.now()
		while process.poll() is None:
			time.sleep(0.1)
			now = datetime.datetime.now()
			if (now - start).seconds > timeout:
				try:
					process.terminate()
				except Exception as e:
					return None
				return None
		out = process.communicate()[0]
		if process.stdin:
			process.stdin.close()
		if process.stdout:
			process.stdout.close()
		if process.stderr:
			process.stderr.close()
		try:
			process.kill()
		except OSError:
			pass
		return out
