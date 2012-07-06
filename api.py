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

class CheckLogin:
    def GET(self):
        user = lunch.get_current_user()
        if user:
            return lunch.write_json({'result':True,'message':'','user':user})
        return lunch.write_json({'result':False,'message':'you hava not login'})
    
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
            percision = data.percision
        if percision>11:
            percision = 11
        elif percision<3:
            percision = 3
        hash_location = geohash.encode(lat, lng, 12)
        hash_location = hash_location[0:percision]
        neighbors = self.get_neighbors(hash_location[0:config.LOCATION_PRECISION],percision)
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
        q = model.db.select('resetuarant',where='id=$id',vars=locals())
        if len(q)>0:
            restuarant = q[0]
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
            rid = model.db.query("select id from restuarant where username='%s'" % user.username)[0].id
            mid = model.db.insert('menu',name=name,description=description,price=price,discount=discount,mtype=mtype,uid=user.id,rid=rid,thumbnail=thumbnail)
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
            model.db.update('menu',where='id=$mid',vars=locals(),name=name,description=description,price=price,discount=discount,mtype=mtype,thumbnail=thumbnail,soldout=state)
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
    
class NewOrder():
    def POST(self):
        user = lunch.get_current_user()
        post_data = web.input()
        if user:
            concact = post_data.concact
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
                if p == price:
                    rs = model.db.select('restuarant',where='id=$rid',vars=locals())
                    if len(rs)>0:
                        rest = rs[0]
                        oid = model.db.insert('lunchorder',username=user.username,concact=concact,bossusername=rest.username,message=message,menus=post_data.menus,price=price)
                        order = model.db.select('lunchorder',where='id=$oid',vars=locals())[0]
                        order.createdtime = str(order.createdtime)
                        return lunch.write_json({'result':True,'message':'order success','order':order,'rid':rest.id})
                    return lunch.write_json({'result':False,'message':'invlid restuarant'})
                return lunch.write_json({'result':False,'message':'invlid price'})
            return lunch.write_json({'result':False,'message':'invlid menus'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
            
        
class EidtOrder():
    def POST(self,id):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            state = post_data.state
            model.db.update('lunchorder',where='id=$id',state=state)
            return lunch.write_json({'result':True,'message':'delete success','state':state})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})