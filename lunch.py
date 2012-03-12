#-*- encoding: UTF-8 -*-

import web
import model
from jinja2 import Environment, PackageLoader
import re
import hashlib
import json
import urllib2
from json.json import ReadException
import jinja2
#from jinja2 import Environment, PackageLoader

web.config.debug = False

#url mappings
urls = (
	'/','Index',
	'/signin','Signin',
	'/signout','Signout',
	'/signup','Signup',
	'/user/view/(.*)','user.View',
	'/user/edit','user.Edit',
	'/restuarant/new','restuarant.New',
)

app = web.application(urls, globals())
session = web.session.Session(app, web.session.DiskStore('sessions'),initializer={'user':None,'location':None})
env = Environment(loader=PackageLoader('lunch','templates'))

def gender_filter(gender):
	if gender == 0:
		return "未知"
	elif gender == 1:
		return "女"
	else:
		return "男"
	
env.filters['genderfiler'] = gender_filter

def render(template,data):
	return env.get_template(template).render(data)

def get_current_user():
	return web.config._session.user
	

class Index:
	def get_location(self,ip):
		try:
			URL='http://ip.json.dotcloud.com/json/'+ip.strip()
			tempFile = urllib2.urlopen(URL).read()
			jsonobj = json.json.read(tempFile)
			return (float(jsonobj['latitude']),float(jsonobj['longitude']))
		except ReadException:
			return (23,110)
		except KeyError:
			return (23,114)
	
	def GET(self):
		"""index page"""
		if not session.location:
			session.location = self.get_location(web.ctx.ip)
		return env.get_template('index.html').render({"user":session.user,"location":session.location})

class Signin:
	def GET(self):
		"""user login"""
		return env.get_template('signin.html').render()

	def POST(self):
		user_data = web.input()
		u = user_data.username
		p = user_data.password
		user = model.valid_user(u, p)
		if user:
			session.user = user
			raise web.seeother("/")

class Signout:
	def GET(self):
		session.user = None
#		session.kill()
		raise web.seeother('/')
	
class Signup:
	def GET(self):
		return env.get_template('signup.html').render()
	
	def POST(self):
		user_data = web.input()
		username = user_data.username.strip()
		password = user_data.password
		email = user_data.email
		usernameError = 0
		passwordError = 0
		emailError = 0
		usernameErrorMessage = ['',
                                '您输入的用户名长度小于4个字符',
                                '您输入的用户名长度大于16个字符',
                                '您输入的用户名已存在',
                                '您输入的用户名格式非法，只能使用字母，数字与下划线']
		passwordErrorMessage = ['',
                                '您输入的密码长度小于6位数',
                                '您输入的密码长度大于32位']
		emailErrorMessage = ['',
                             'email不能为空',
                             '您输入的email长度大于32位',
                             '您输入的email已经存在',
                             '您输入的email格式不正确']
		if len(username)<4:
			usernameError = 1#用户名过短
		elif len(username)>16:
			usernameError = 2#用户名过长
		else:
			if(re.search('^[a-zA-Z0-9\_]+$', username)):
				q = model.get_user(username)
				if q:
					usernameError = 3#用户名已存在
			else:
				usernameError = 4#用户名非法
		if len(password)<6:
			passwordError = 1#密码过短
		elif len(password)>32:
			passwordError = 2#密码过长
		if (len(email) == 0):
			emailError = 1#email不能为空
		else:
			if (len(email) > 32):
				emailError = 2#email过长
			else:
				p = re.compile(r"(?:^|\s)[-a-z0-9_.]+@(?:[-a-z0-9]+\.)+[a-z]{2,6}(?:\s|$)", re.IGNORECASE)
				if (p.search(email)):
					v = {"email":email}
					e = model.db.select('user',v, where="email = $email")
					if (len(e) > 0):
						emailError = 3#email已经存在
				else:
					emailError = 4#email格式不正确
		if (usernameError + passwordError + emailError)>0:
			templateData = {}
			templateData['username'] = username
			templateData['password'] = password
			templateData['email'] = email
			templateData['usernameErrorMessage'] = usernameErrorMessage[usernameError]
			templateData['passwordErrorMessage'] = passwordErrorMessage[passwordError]
			templateData['emailErrorMessage'] = emailErrorMessage[emailError]
			return env.get_template('signup.html').render(templateData)
		else:
			p_sha1 = hashlib.sha1(password).hexdigest()
			model.db.insert('user',username=username,password=p_sha1,email=email)
			session.user = model.user(username,email)
			web.seeother('/')

def getSession():
	if '_session' not in web.config:
		web.config._session = session

if __name__ == '__main__':
	getSession()
	app.run()
