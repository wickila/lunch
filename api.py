# -*- encoding=utf-8 -*-
'''
Created on 2012-6-14

@author: wicki
'''

import lunch
import model
import web
import os
import config

import json
from geo import geohash
import datetime
import math

class CheckLogin:
    def GET(self):
        user = lunch.get_current_user()
        if user:
            return lunch.write_json({'result':True,'message':'success','user':user})
        return lunch.write_json({'result':True,'message':'you hava not login'})
    
class GetMyConcacts:
    def GET(self):
        user = lunch.get_current_user()
        if user:
            username = user.username
            concacts = model.db.select('concact',where='username=$username',vars=locals())
            ccs = [concact for concact in concacts]
            return lunch.write_json({'result':True,'message':'success','concacts':ccs})
        return lunch.write_json({'result':False,'message':'you hava not login'})
    
class NewConcact():
    def POST(self):
        user = lunch.get_current_user()
        post_data = web.input()
        if user:
            concactname = post_data.concactname
            adress = post_data.adress
            phone = post_data.phone
            id = model.db.insert('concact',username=user.username,concactname=concactname,adress=adress,phone=phone)
            return lunch.write_json({'result':True,'message':'success','concact':{'id':id,'username':user.username,'concactname':concactname,'adress':adress,'phone':phone}})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class EditConcact():
    def POST(self,id):
        user = lunch.get_current_user()
        post_data = web.input()
        if user:
            concactname = post_data.concactname
            adress = post_data.adress
            phone = post_data.phone
            model.db.update('concact',where='id=$id',username=user.username,concactname=concactname,adress=adress,phone=phone)
            return lunch.write_json({'result':True,'message':'success'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class DeleteConcact():
    def POST(self,id):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            model.db.delete('concact',where='id=$id',vars=locals())
            return lunch.write_json({'result':True,'message':'delete success'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class GetMyRest:
    def GET(self):
        user = lunch.get_current_user()
        if user and user.permission>0:
            username=user.username
            rs = model.db.select('restuarant',where='username=$username',vars=locals())
            result = {'result':True,'message':'success'}
            if len(rs)>0:
                r = rs[0]
                rid = r.id
                menutypes = [menutype for menutype in model.db.select('menutype',where='rid=$rid',vars=locals())]
                r['menutypes'] = menutypes
                r.created_time = str(r.created_time)
                result['restuarant'] = r
            return lunch.write_json(result)
        return lunch.write_json({'result':False,'message':'you have not login or permission is not enough'})

class LocalRestaurants:
    def GET(self):
        data = web.input()
        lat = float(data.lat)
        lng = float(data.lng)
        percision = 6
        if 'percision' in data:
            percision = int(data.percision)
        if percision>11:
            percision = 11
        elif percision<3:
            percision = 3
        hash_location = geohash.encode(lat, lng, 12)
        hash_location = hash_location[0:percision]
        neighbors = self.get_neighbors(hash_location,config.LOCATION_PRECISION)
        neighbors.sort()
        rs = model.db.query("SELECT * FROM restuarant WHERE hash_location >= '%s' AND hash_location <= '%s'" % (neighbors[0],neighbors[-1]))
        restuarants = []
        for restuarant in rs:
            restuarant.created_time = str(restuarant.created_time).split('.')[0]
            restuarants.append(restuarant)
        return lunch.write_json({'result':True,'restuarants':restuarants})
        
    def get_neighbors(self,hash_location,percision):
        result = geohash.expand(hash_location)
        i = 6
        while i>percision:
            temp = result[:]
            for area in temp:
                neighbors = geohash.neighbors(area)
                for neighbor in neighbors:
                    if result.count(neighbor) < 1:
                        result.append(neighbor)
            i-=1
        return result  

class ViewRestuarant():
    def GET(self,id):
        q = model.db.select('restuarant',where='id=$id',vars=locals())
        if len(q)>0:
            restuarant = q[0]
            rid = restuarant.id
            menutypes = [menutype for menutype in model.db.select('menutype',where='rid=$rid',vars=locals())]
            restuarant['menutypes'] = menutypes
            restuarant.created_time = str(restuarant.created_time)
        return lunch.write_json({'result':True,'restuarant':restuarant})
    
class ViewMenus():
    def GET(self,rid):
        q = model.db.select('menu',where='rid=$rid',vars=locals())
        menus = [menu for menu in q]
        return lunch.write_json({'result':True,'menus':menus})
    
class ViewMenu():
    def GET(self,mid):  
        q = model.db.select('menu',where='id=$mid',vars=locals())
        if len(q) > 0:
            menu = q[0]
            return lunch.write_json({'result':True,'menus':menu})
        return lunch.write_json({'result':False,'message':'menu not found'})  
    
class MenuThumbail():
    def POST(self,id):
        user = lunch.get_current_user()
        post_data = web.input(imgfile={})
        if user and user.permission>0:
            mns = model.db.select('menu',where='id=$id',vars=locals())
            if len(mns)>0:
                menu = mns[0]
                filedir = '/static/upload/menu-thumbnail'
                if not os.path.isdir('.'+filedir):
                    os.mkdir('.'+filedir)
                if 'imgfile' in post_data: # to check if the file-object is created
                    filepath=post_data.imgfile.filename.replace('\\','/') # replaces the windows-style slashes with linux ones.
                    filename=str(id)+'.'+filepath.split('/')[-1].split('.')[-1] # splits the and chooses the last part (the filename with extension)
                    fout = open('.'+filedir +'/'+ filename,'wb') # creates the file where the uploaded file should be stored
                    fout.write(post_data.imgfile.file.read()) # writes the uploaded file to the newly created file.
                    fout.close() # closes the file, upload complete.
                    pydic = {'imgurl':filedir +'/'+ filename}
                    model.db.update('menu',thumbnail=pydic['imgurl'],where='id=$id',vars=locals())
                    menu.thumbnail = pydic['imgurl']
                    pydic['menu'] = menu
                    pydic['message'] = 'success'
                    web.header('Content-Type', 'application/json')
                    return lunch.write_json(pydic)
            else:
                return lunch.write_json({'result':False,'message':'menu not found'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class NewMenu():
    def POST(self):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            name = post_data.name
            description = post_data.description
            price = post_data.price
            discount = post_data.discount
            mtype = post_data.mtype
            thumbnail = post_data.thumbnail
            taste = int(post_data.taste)
            rid = model.db.query("select id from restuarant where username='%s'" % user.username)[0].id
            mid = model.db.insert('menu',name=name,description=description,price=price,discount=discount,mtype=mtype,uid=user.id,rid=rid,thumbnail=thumbnail,taste=taste)
            mns = model.db.select('menu',where='id=$mid',vars=locals())
            m = mns[0]
            return lunch.write_json({'result':True,'message':'success','menu':m})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class EditMenu():
    def POST(self,mid):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            name = post_data.name
            description = post_data.description
            price = post_data.price
            discount = post_data.discount
            mtype = post_data.mtype
            thumbnail = post_data.thumbnail
            state = int(post_data.state)
            taste = int(post_data.taste)
            model.db.update('menu',where='id=$mid',vars=locals(),name=name,description=description,price=price,discount=discount,mtype=mtype,thumbnail=thumbnail,soldout=state,taste=taste)
            mns = model.db.select('menu',where='id=$mid',vars=locals())
            m = mns[0]
            return lunch.write_json({'result':True,'message':'success','menu':m})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class DeleteMenu():
    def POST(self,mid):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            model.db.delete('menu',where='id=$mid',vars=locals())
            return lunch.write_json({'result':True,'message':'delete success'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class NewMenuType():
    def POST(self):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            username = user.username
            rests = model.db.select('restuarant',where='username=$username',vars=locals())
            if len(rests)>0:
                name = post_data.name
                rest = rests[0]
                mtid = model.db.insert('menutype',name=name,username=username,rid=rest.id)
                menutype = model.db.select('menutype',where='id=$mtid',vars=locals())[0]
                return lunch.write_json({'result':True,'message':'success','menutype':menutype})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class EditMenuType():
    def POST(self,id):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            username = user.username
            rests = model.db.select('restuarant',where='username=$username',vars=locals())
            if len(rests)>0:
                name = post_data.name
                rest = rests[0]
                model.db.update('menutype',where='id=$id',vars=locals(),name=name)
                menutypes = model.db.select('menutype',where='id=$id',vars=locals())
                if len(menutypes)>0:
                    menutype = menutypes[0]
                    return lunch.write_json({'result':True,'message':'success','menutype':menutype})
                return lunch.write_json({'result':False,'message':'menutype is not exist'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class DeleteMenuType():
    def POST(self,id):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            username = user.username
            rests = model.db.select('restuarant',where='username=$username',vars=locals())
            if len(rests)>0:
                rest = rests[0]
                menutypes = model.db.select('menutype',where='id=$id',vars=locals())
                if len(menutypes)>0:
                    menutype = menutypes[0]
                    if menutype.username == user.username:
                        model.db.delete('menutype',where='id=$id',vars=locals())
                        model.db.update('menu',where='mtype=$id',mtype=0)
                        return lunch.write_json({'result':True,'message':'success'})
                    return lunch.write_json({'result':False,'message':'you cant delete other persons menutype!'})
                else:
                    return lunch.write_json({'result':True,'message':'menutype does not exist'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class GetMenuTypes():
    def GET(self,id):
        user = lunch.get_current_user()
        post_data = web.input()
        if user:
            menutypes = [menutype for menutype in model.db.select('menutype',where='rid=$id',vars=locals())]
            return lunch.write_json({'result':True,'message':'success','menutypes':menutypes})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class NewOrder():
    def POST(self):
        user = lunch.get_current_user()
        post_data = web.input()
        if user:
            concact = post_data.concact
            if not concact:
                return lunch.write_json({'result':False,'message':'invlid concact'})
            rid = post_data.rid
            message = post_data.message
            state = 0
            menus = post_data.menus
            menus = json.loads(menus)
            its = {}
            price = float(post_data.price)
            sql = 'select * from menu where'
            for i,menu in enumerate(menus):
                its[menu['id']] = menu
                sql += ' id=%s' % menu['id']
                if i<len(menus)-1:
                    sql+=' or'
            menus = model.db.query(sql)
            if len(menus) == len(menus):
                p = 0
                soldouts = []
                for menu in menus:
                    if menu.soldout == 0:
                        soldouts.append(menu)
                    p+=menu.price*menu.discount*0.1*int(its[menu.id]['num'])
                if len(soldouts)>0:
                    message = ','.join([menu.name for menu in soldouts])+'卖完啦,换换口味看？'
                    return lunch.write_json({'result':False,'message':message})
                if price-p<0.1:
                    rs = model.db.select('restuarant',where='id=$rid',vars=locals())
                    if len(rs)>0:
                        rest = rs[0]
                        oid = model.db.insert('lunchorder',username=user.username,concact=concact,bossusername=rest.username,message=message,menus=post_data.menus,price=price,restname=rest.name)
                        order = model.db.select('lunchorder',where='id=$oid',vars=locals())[0]
                        order.createdtime = str(order.createdtime)
                        return lunch.write_json({'result':True,'message':'order success','order':order,'rid':rest.id})
                    return lunch.write_json({'result':False,'message':'invlid restuarant'})
                return lunch.write_json({'result':False,'message':'invlid price'})
            return lunch.write_json({'result':False,'message':'invlid menus'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
            
        
class EditOrder():
    def POST(self,id):
        user = lunch.get_current_user()
        post_data = web.input()
        state  = int(post_data.state)
        cancelreason = ''
        if 'cancelreason' in post_data:
            cancelreason = post_data.cancelreason
        if user:
            order = model.db.select('lunchorder',where='id=$id',vars=locals())
            if len(order)>0:
                order = order[0]
                if (order.bossusername == user.username and (not state == 3)) or (order.username == user.username and state == 3):
                    if state == 1:
                        sql = 'update restuarant set totalensure = totalensure+1,totalensuretime = totalensuretime+%d where id=%d;'%((datetime.datetime.now()-order.modifiedtime).seconds,order.rid)
                    elif state == 2:
                        sql = 'update restuarant set totalensure = totalensure+1,totalensuretime = totalensuretime+%d where id=%d;'%((datetime.datetime.now()-order.modifiedtime).seconds,order.rid)
                    if sql:
                        model.db.query(sql)
                    model.db.update('lunchorder',where='id=$id',state=state, cancelreason=cancelreason,modifiedtime = datetime.datetime.now(),vars=locals())
                    order.state = state
                    order.createdtime = str(order.createdtime).split('.')[0]
                    order.modifiedtime = str(datetime.datetime.now()).split('.')[0]
                    return lunch.write_json({'result':True,'message':'delete success','order':order})
            else:
                return lunch.write_json({'result':False,'message':'invlid order'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class GetOrder():
    def GET(self,id):
        user = lunch.get_current_user()
        if user:
            order = model.db.select('lunchorder',where='id=$id',vars=locals())
            if len(order)>0:
                order = order[0]
                order.createdtime = str(order.createdtime).split('.')[0]
                return lunch.write_json({'result':True,'message':'delete success','order':order})
            else:
                return lunch.write_json({'result':False,'message':'invlid order'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class ViewUserOrders():
    def GET(self):
        user = lunch.get_current_user()
        post_data = web.input()
        try:
            page = int(post_data.page)
        except:
            page = 1
        page_count = 5
        if user:
            sql = "select * from lunchorder where username='%s' order by id desc LIMIT %d, %d" % (user.username,(page-1)*page_count,page_count)
            orders = model.db.query(sql)
            total = len(model.db.query("select * from lunchorder where username='%s'" % user.username))
            ods = []
            for order in orders:
                order.createdtime = str(order.createdtime)
                ods.append(order)
            return lunch.write_json({'result':True,'message':'seccuss','orders':ods,'total':total})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class ViewBossOrders():
    def GET(self):
        user = lunch.get_current_user()
        post_data = web.input()
        try:
            page = int(post_data.page)
        except:
            page = 1
        page_count = 5
        if user and user.permission>0:
            sql = "select * from lunchorder where bossusername='%s' order by id desc LIMIT %d, %d" % (user.username,(page-1)*page_count,page_count)
            total = len(model.db.query("select id from lunchorder where bossusername='%s'" % user.username))
            orders = model.db.query(sql)
            ods = []
            hasNew = False
            for order in orders:
                order.createdtime = str(order.createdtime)
                if (not hasNew) and (not order.isnew):
                    hasNew = True
                    model.db.update('lunchorder',where='bossusername=$user.username',isnew=1,vars=locals())
                ods.append(order)
            return lunch.write_json({'result':True,'message':'seccuss','orders':ods,'total':total,'hasNew':hasNew})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class OrderComment():
    def POST(self):
        user = lunch.get_current_user()
        post_data = web.input()
        oid = int(post_data.orderid)
        content = post_data.content
        thanks = int(post_data.thanks)
        if user:
            orders = model.db.select('lunchorder',where='id=$oid',vars=locals())
            if len(orders)>0:
                order = orders[0]
                if order.username == user.username:
                    rest = model.db.query("select * from restuarant where name='%s' and username='%s'"%(order.restname,order.bossusername))[0]
                    if order.state == 3 or thanks>math.ceil(order.price/10):
                        model.db.update('lunchorder',where='id=$oid',state=4,vars=locals())
                        model.db.insert('comment',username=user.username,orderid=oid,content=content,thanks=thanks,rid=rest.id)
                        model.db.update('restuarant',where='id=$rest.id',thanks=rest.thanks+thanks,vars=locals())
                        return lunch.write_json({'result':True,'message':'success'})
                    return lunch.write_json({'result':False,'message':'invalid option'})
                return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
            return lunch.write_json({'result':False,'message':'invalid order'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class ThumbnailLib:
    def GET(self):
        user = lunch.get_current_user()
        if user and user.permission>0:
            thumbnails = []
            rootdir = "./static/img/thumbnails"
            for parent, dirnames, filenames in os.walk(rootdir):
                for filename in filenames:
                    thumbnails.append({'src':'/static/img/thumbnails/'+filename,'name':filename})
            return lunch.write_json({'result':True,'thumbnails':thumbnails})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class SearchRestuarant:
    def GET(self):
        data = web.input()
        restname = data.restname
        rests = model.db.select('restuarant',where='name=$restname',vars=locals())
        restuarants = []
        for restuarant in rests:
            restuarant.created_time = str(restuarant.created_time).split('.')[0]
            restuarants.append(restuarant)
        return lunch.write_json({'result':True,'restuarants':restuarants})
    
class ApplyOpenRest:
    def POST(self):
        user = lunch.get_current_user()
        if user:
            data = web.input()
            restname = data.restname
            adress = data.adress
            phone = data.phone
            message = data.message
            model.db.insert('restapply',restname=restname,adress=adress,phone=phone,message=message,username=user.username)
            return lunch.write_json({'result':True,'message':'success'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class Messages:
    def GET(self,page):
        page = int(page)
        user = lunch.get_current_user()
        page_count = 10
        if user:
            sql = "select * from message where receiver='%s' order by id desc LIMIT %d, %d" % (user.username,(page-1)*page_count,page_count)
            total = len(model.db.query("select id from message where receiver='%s'" % user.username))
            messages = model.db.query(sql)
            msgs = []
            for message in messages:
                message.createdtime = str(message.createdtime)
                msgs.append(message)
            return lunch.write_json({'result':True,'message':'success','total':total,'messages':msgs})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class Message:
    def GET(self):
        data = web.input()
        
    def POST(self):
        data = web.input()
        receiver = data.receiver
        content = data.content
        messagetype = int(data.messagetype)
        user = lunch.get_current_user()
        if user:
            model.db.insert('message',receiver=receiver,content=content,sender=user.username,messagetype=messagetype)
            return lunch.write_json({'result':True,'message':'success'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
        