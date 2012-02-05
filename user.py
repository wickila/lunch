'''
Created on 2012-2-4

@author: wickila
'''
# -*- encoding=utf-8 -*-

import web
import model
import lunch

class View():
    def GET(self,name):
        user = model.get_user(name)
        return lunch.render('viewuser.html', {"user":user})
    
class Edit():
    def GET(self):
        user = lunch.get_current_user()
        if user:
            return lunch.render('edituser.html',{"user":user})
        raise web.seeother('/')
    
    def POST(self):
        user = lunch.get_current_user()
        if user:
            user_data = web.input()
            mobile = user_data.mobile
            adress1 = user_data.adress1
            adress2 = user_data.adress2
            model.update_user(user.username, mobile, adress1, adress2)
            user.mobile = mobile
            user.adress1 = adress1
            user.adress2 = adress2
            raise web.seeother("/user/view/"+user.username)
        raise web.seeother("/")
        
        
