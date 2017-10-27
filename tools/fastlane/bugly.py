#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os, json, re
import helper

# Bugly的相关信息
bugly_pid     = "2"
bugly_app_id  = "c22e157ee1"
bugly_app_key = "d86f9e54-e646-46d8-8591-c021f6d93755"
# 如果不是发布新版本该变量设置为空字符串
# bugly_app_title = ""  
# 更新已上传版本的版本id，如果不清楚请在网站后台打开版本详情，然后在URL中versions节点后面找到exp_id
# 例：https://beta.bugly.qq.com/apps/900041236/versions/ce924c28-911f-4b51-a541-3754fbb3b7f8?pid=2
# bugly_app_exp_id = "ce924c28-911f-4b51-a541-3754fbb3b7f8"


# # 查询Bugly版本列表
# def list_exp_bugly():
# 	print('watting...')
	# os.system("curl --insecure 'https://api.bugly.qq.com/beta/apiv1/exp_list?app_id=%s&pid=%s&app_key=%s&start=0&limit=100'" % (bugly_app_id,bugly_pid,bugly_app_key))

def doAction(gameName, bundleID, ipaPath):
	helper.appendMail('start to upload ipa to bugly')
	if os.path.exists(ipaPath):
		# 使用系统自带工具 curl 上传文件
		os.system("curl --insecure -F 'file=@%s' -F 'app_id=%s' -F 'pid=%s' -F 'title=%s' https://api.bugly.qq.com/beta/apiv1/exp?app_key=%s >>./logs/%s-bugly 2>&1" % (ipaPath, bugly_app_id, bugly_pid, gameName, bugly_app_key, bundleID))
		log = helper.readFile('./logs/%s-bugly' % bundleID)
		match = re.compile(r'\{".*').findall(log)
		if match and len(match) > 0:
			ret = json.loads(match[len(match) - 1])
			url = ret.get('data').get('url')
			if url != None:
				helper.appendMail('upload ipa to bugly success! url:%s' % url)
			return url
		return None
	else:
		print(u"没有找到ipa文件！！！")