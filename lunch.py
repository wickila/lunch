#-*- encoding: UTF-8 -*-

from jinja2 import Environment, PackageLoader
import hashlib
import json
import model
import re
import urllib2
import web

import config
#from jinja2 import Environment, PackageLoader

web.config.debug = False

#url mappings
urls = (
	'/','Index',
	'/rest/(.*)','ViewRest',
	'/signin','Signin',
	'/signout','Signout',
	'/signup','Signup',
	'/user/view/(.*)','user.View',
	'/user/edit','user.Edit',
	'/user/security','user.Security',
	'/user/email','user.Email',
	'/user/avatar','user.Avatar',
	'/restuarant/new','restuarant.New',
	'/restuarant/edit','restuarant.Edit',
	'/restuarant/avatar','restuarant.Avatar',
	'/api/restuarant/comments/(.*)','restuarant.Comments',
	'/api/localrestuarants','api.LocalRestaurants',
	'/api/resturant/view/(.*)','api.ViewRestuarant',
	'/api/resturant/menus/(.*)','api.ViewMenus',
	'/api/checklogin','api.CheckLogin',
	'/api/getmyconcacts','api.GetMyConcacts',
	'/api/getmyrest','api.GetMyRest',
	'/api/menu/view/(.*)','api.ViewMenu',
	'/api/menu/thumbnail/(.*)','api.MenuThumbail',
	'/api/menu/new','api.NewMenu',
	'/api/menu/edit/(.*)','api.EditMenu',
	'/api/menu/delete/(.*)','api.DeleteMenu',
	'/api/menutype/new','api.NewMenuType',
	'/api/menutype/edit/(.*)','api.EditMenuType',
	'/api/menutype/delete/(.*)','api.DeleteMenuType',
	'/api/menutypes/get/(.*)','api.GetMenuTypes',
	'/api/concact/new','api.NewConcact',
	'/api/concact/edit/(.*)','api.EditConcact',
	'/api/concact/delete/(.*)','api.DeleteConcact',
	'/api/order/new','api.NewOrder',
	'/api/order/edit/(.*)','api.EditOrder',
	'/api/order/get/(.*)','api.GetOrder',
	'/api/order/view/user','api.ViewUserOrders',
	'/api/order/view/boss','api.ViewBossOrders',
	'/api/order/comment','api.OrderComment',
	'/api/thumbnaillib','api.ThumbnailLib',
	'/api/search/rest','api.SearchRestuarant',
	'/api/restuarant/apply','api.ApplyOpenRest',
	'/api/messages/(.*)','api.Messages',
	'/api/message/new','api.Message',
	'/admin','Admin',
	'/admin/signin','AdminSignIn',
	'/admin/restapply','admin.RestApply',
	'/admin/applyoption','admin.RestApplyOption'
)

app = web.application(urls, globals())
env = Environment(loader=PackageLoader('lunch','templates'))
def getSession():
	web.config.session_parameters['timeout'] = 86400*14, #24 * 60 * 60 *14
	global session
	if '_session' not in web.config:
		session = web.session.Session(app, web.session.DiskStore('sessions'),initializer={'user':None,'location':None})
		web.config._session = session
	else:
		session = web.config._session

def gender_filter(gender):
	if gender == 0:
		return "未知"
	elif gender == 1:
		return "女"
	else:
		return "男"
	
env.filters['genderfiler'] = gender_filter
env.filters['dumps'] = json.dumps

def get_current_user():
	return web.config._session.user

def render(template,data):
	web.header("Content-Type","text/html; charset=utf-8")
	data["user"] = get_current_user()
	data["version"] = config.version
	data["location"] = session.location
	data["rest_types"] = json.dumps(config.REST_TYPES)
	return env.get_template(template).render(data)

def write_json(obj):
	web.header('Content-Type', 'application/json')
	return json.dumps(obj)

class Index:
	def get_location(self,ip):
		try:
			URL='http://ip.json.dotcloud.com/json/'+ip.strip()
			tempFile = urllib2.urlopen(URL).read()
			jsonobj = json.loads(tempFile)
			return (float(jsonobj['latitude']),float(jsonobj['longitude']))
		except:
			return (23,114)
	
	def GET(self):
		"""index page"""
		if (not session.user) or (not session.location):
			session.location = self.get_location(web.ctx.ip)
		return render('index.html',{})
	
class ViewRest:
	def get_location(self,ip):
		try:
			URL='http://ip.json.dotcloud.com/json/' + ip.strip()
			tempFile = urllib2.urlopen(URL).read()
			jsonobj = json.loads(tempFile)
			return (float(jsonobj['latitude']),float(jsonobj['longitude']))
		except:
			return (23,114)
	
	def GET(self,username):
		rests = model.db.select('restuarant',where='username=$username',vars=locals())
		if len(rests)>0:
			rest = rests[0]
			return render({"current_rest_id":rest.id})
		return u'对不起，您访问的餐厅不存在'

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
			user.registertime = str(user.registertime)
			user.modifytime = str(user.modifytime)
			return write_json({'result':True,'message':'login success','user':user})
		return write_json({'result':False,'message':u'用户名或密码不正确'})

class Signout:
	def GET(self):
		session.user = None
#		session.kill()
		raise web.seeother('/')
	
	def POST(self):
		session.user = None
		return write_json({'result':True,'message':'登出成功'})
	
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
			templateData = {'result':False}
			templateData['username'] = username
			templateData['password'] = password
			templateData['email'] = email
			templateData['usernameErrorMessage'] = usernameErrorMessage[usernameError]
			templateData['passwordErrorMessage'] = passwordErrorMessage[passwordError]
			templateData['emailErrorMessage'] = emailErrorMessage[emailError]
			return write_json(templateData)
		else:
			p_sha1 = hashlib.sha1(password).hexdigest()
			uid = model.db.insert('user',username=username,password=p_sha1,email=email)
			session.user = model.db.query("select * from user where id=%d" % uid)[0]
			session.user.registertime = str(session.user.registertime)
			session.user.modifytime = str(session.user.modifytime)
			return write_json({'result':True,'message':'signup success','user':session.user})
		
class Admin:
	def GET(self):
		user = get_current_user()
		if user:
			if user.permission>10:
				return render('admin.html',{})
			else:
				session.user = None
		return web.seeother('/admin/signin')
		
class AdminSignIn:
	def GET(self):
		return render('admin/signin.html',{})
	
	def POST(self):
		user_data = web.input()
		u = user_data.username
		p = user_data.password
		user = model.valid_user(u, p)
		if user and user.permission>10:
			session.user = user
			user.registertime = str(user.registertime)
			user.modifytime = str(user.modifytime)
			return web.seeother('/admin')
		return web.seeother('/admin/signin')
	
class AdminSignOut:
	def GET(self):
		session.user = None
		raise web.seeother('/admin/signin')
	
	def POST(self):
		session.user = None
		raise web.seeother('/admin/signin')

if __name__ == '__main__': #for local
	getSession()
	app.run()

#getSession()  #for remote 
#application = app.wsgifunc() #for remote 
