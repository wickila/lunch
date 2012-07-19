#-*- encoding=utf-8 -*-
'''
Created on 2012-7-19

@author: wicki
'''
import lunch
import model
import web

class RestApply:
    def GET(self):
        return lunch.render('admin/restapply.html', {})