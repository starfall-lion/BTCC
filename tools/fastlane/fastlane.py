#!/usr/bin/env python
# -*- coding: utf-8 -*-

'''
fastlane 自动化工具
'''

import argparse
import build

if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('action', help= 'todo')
	parser.add_argument('platform', help= 'iOS or android')
	parser.add_argument('-t', '--test', help= 'is test', default= False, action= 'store_true')
	parser.add_argument('-V', '--version', help= 'version string', default= '2.1')
	parser.add_argument('-v', '--bundleVersion', help= 'bundleVersion', default= '1')
	options = parser.parse_args()

	action = options.action
	if action != 'build':
		print('action error: %s, only can be build' % action)
	else:
		platform = options.platform.lower()
		if platform != 'ios' and platform != 'android':
			print('platform error: %s, only can be iOS or android' % platform)
		else:
			if action == 'build':
				try:
					bundleVersion = int(options.bundleVersion)
				except Exception as e:
					bundleVersion = -1
					print('bundleVersion must be int')
				if bundleVersion >= 0:
					build.doAction(platform, options.version, bundleVersion, True if options.test else False)