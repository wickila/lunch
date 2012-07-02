#-*- encoding=utf-8 -*-
'''
Created on 2012-6-30

@author: wicki
'''
import model
import lunch

import web
import os
import json
import hashlib

class Avatar:
    def POST(self):
        user = lunch.get_current_user()
        if user:
            post_data = web.input(img={})
            filedir = '/static/upload/avatar'
            if not os.path.isdir('.'+filedir):
                os.mkdir('.'+filedir)
            if 'img' in post_data: # to check if the file-object is created
                filepath=post_data.img.filename.replace('\\','/') # replaces the windows-style slashes with linux ones.
                filename=str(user.id)+'.'+filepath.split('/')[-1].split('.')[1] # splits the and chooses the last part (the filename with extension)
                fout = open('.'+filedir +'/'+ filename,'wb') # creates the file where the uploaded file should be stored
                fout.write(post_data.img.file.read()) # writes the uploaded file to the newly created file.
                fout.close() # closes the file, upload complete.
                pydic = {'imgurl':filedir +'/'+ filename}
                id = user.id
                model.db.update('user',avatarurl=pydic['imgurl'],where='id=$id',vars=locals())
                user.avatar_url = pydic['imgurl']
                web.header('Content-Type', 'application/json')
                return lunch.write_json(pydic)
        raise web.seeother('/signin')

class Security():
    def POST(self):
        user = lunch.get_current_user()
        if user:
            username = user.username
            user_data = web.input()
            oldPwd = user_data.oldpwd
            newPwd = user_data.newpwd
            p_sha1 = hashlib.sha1(oldPwd).hexdigest()
            p_sha2 = hashlib.sha1(newPwd).hexdigest()
            result = {'result':False,'message':u'密码错误'}
            if user.password == p_sha1:
                model.db.update('user',where='username=$username',vars=locals(),password=p_sha2)
                web.config._session.user.password = p_sha2
                web.header('Content-Type', 'application/json')
                result = {'result':True,'message':u'修改成功'}
            return lunch.write_json(result)
        raise web.seeother("/signin")
    
class Email():
    def POST(self):
        user = lunch.get_current_user()
        if user:
            username = user.username
            user_data = web.input()
            email = user_data.email
            pwd = user_data.email_pwd
            p_sha1 = hashlib.sha1(pwd).hexdigest()
            result = {'result':False,'message':'密码错误'}
            if user.password == p_sha1:
                model.db.update('user',where='username=$username',vars=locals(),email=email)
                web.config._session.user.email = email
                web.header('Content-Type', 'application/json')
                result = {'result':True,'message':'修改成功'}
            return lunch.write_json(result)
        raise web.seeother("/signin")