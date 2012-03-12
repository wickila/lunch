'''
Created on 2012-2-4

@author: wickila
'''
# -*- encoding=utf-8 -*-

import web
import model
import lunch
import os

class View():
    def GET(self,name):
        user = model.get_user(name)
        if user:
            return lunch.render('viewuser.html', {"user":user})
        return "user not found"
    
class Edit():
    def GET(self):
        user = lunch.get_current_user()
        if user:
            return lunch.render('edituser.html',{"user":user})
        raise web.seeother('/signin')
    
    def POST(self):
        user = lunch.get_current_user()
        if user:
            username = user.username
            user_data = web.input()
            name = user_data.name
            gender = int(user_data.gender)
            mark = user_data.mark
            mobile = user_data.mobile
            telephone = user_data.telephone
            adress1 = user_data.adress1
            adress2 = user_data.adress2
            model.db.update('user', where='username=$username', vars=locals(), name=name, gender=gender, mark=mark, mobile=mobile, telephone=telephone, adress1=adress1.encode(), adress2=adress2.encode())
            user.name = name
            user.gender = gender
            user.mark = mark
            user.mobile = mobile
            user.telephone = telephone
            user.adress1 = adress1
            user.adress2 = adress2
            raise web.seeother("/user/view/"+user.username)
        raise web.seeother("/signin")
        
        
