#-*- encoding=utf-8 -*-
'''
Created on 2012-7-19

@author: wicki
'''
import lunch
import model
import config

import web

class RestApply:
    def GET(self):
        page = 1
        page_count = 10
        try:
            page = web.input().page
        except:
            page = 1
        sql = "select * from restapply limit %d,%d" % ((page-1)*page_count,page_count)
        applys = model.db.query(sql)
        return lunch.render('admin/restapply.html', {'applys':applys})
    
class RestApplyOption:
    def POST(self):
        user = lunch.get_current_user()
        if user and user.permission>10:
            data = web.input()
            opcode = int(data.opcode)
            id = int(data.id)
            try:
                reason = data.reason
            except:
                reason = ''
            applys = model.db.select('restapply',where='id=$id',vars=locals())
            if len(applys)>0:
                apl = applys[0]
                model.db.update('restapply',where='id=$id',state=opcode,reason=reason,vars=locals())
                if opcode == 1:
                    model.db.update('user',where='username=$apl.username',permission=1,vars=locals())
                    content = config.MESSAGE['rest_apply_accept']
                elif opcode == -1:
#                    model.db.update('user',where='username=$apl.username',permission=0,vars=locals())
                    content = config.MESSAGE['rest_apply_reject']+reason
                if opcode == 1 or opcode == -1:
                    model.db.insert('message',receiver=apl.username,messagetype=config.MESSAGE_TYPE['restapply'],content=content)
                apl.state = opcode
                apl.createdtime = str(apl.createdtime)
                return lunch.write_json({'result':True,'message':'success','apply':apl})
            else:
                return lunch.write_json({'result':False,'message':'apply dose not exite'})
            
        