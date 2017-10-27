#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = "eddie.zhou@bttc.com"

import hashlib, io

def getMD5(filePath):
	m = hashlib.md5()
	file = io.FileIO(filePath, 'r')
	bytes = file.read(1024)
	while(bytes != b''):
		m.update(bytes)
		bytes = file.read(1024)
	file.close()
	return m.hexdigest()