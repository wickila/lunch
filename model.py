# -*- encoding=utf-8 -*-
import web, datetime
import hashlib

db = web.database(dbn='mysql', db='lunch', user='root', pw='wickila')

def valid_user(user,pwd):
	v = {"username":user,"password":hashlib.sha1(pwd).hexdigest()}
	users = db.select('user',v)
	if len(users) > 0:
		return users[0]
	return None

def get_posts():
	return db.select('entries', order='id DESC')

def get_post(id):
	try:
		return db.select('user', where='id=$id', vars=locals())[0]
	except IndexError:
		return None
	
def get_user(username):
	return db.select('user',where='username=$username',vars=locals())[0]
	
def new_post(title, text):
	db.insert('entries',title=title,content=text,posted_on=datetime.datetime.utcnow())

def del_post(id):
	db.delete('entries', where="id=$id", vars=locals())

def update_post(id,title,text):
	db.update('entries',where="id=$id", vars=locals(), title=title, content=text)
	
def update_user(username, mobile, adress1, adress2):
	db.update('user', where='username=$username', vars=locals(), mobile=mobile, adress1=adress1.encode(), adress2=adress2.encode())
	
class user():
	"""用戶信息"""
	def __init__(self,username,email):
		self.username = username
		self.email = email
		self.mobile = ""
		self.adress1 = ""
		self.adress2 = ""
