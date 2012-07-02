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

from geo import geohash

class CheckLogin:
    def GET(self):
        user = lunch.get_current_user()
        if user:
            return lunch.write_json({'result':True,'message':'','user':user})
        return lunch.write_json({'result':False,'message':'you hava not login'})
    
class GetMyRest:
    def GET(self):
        user = lunch.get_current_user()
        if user and user.permission>0:
            uid = user.id
            rs = model.db.select('restuarant',where='uid=$uid',vars=locals())
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
                    filename=str(id)+'.'+filepath.split('/')[-1].split('.')[1] # splits the and chooses the last part (the filename with extension)
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
            rid = model.db.query('select id from restuarant where uid='+str(user.id))[0].id
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
            model.db.update('menu',where='id=$mid',vars=locals(),name=name,description=description,price=price,discount=discount,mtype=mtype,thumbnail=thumbnail)
            mns = model.db.select('menu',where='id=$mid',vars=locals())
            m = mns[0]
            return lunch.write_json({'result':True,'message':'success','menu':m})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
class DeleteMenu():
    def POST(self,mid):
        user = lunch.get_current_user()
        post_data = web.input()
        if user and user.permission>0:
            model.db.delete('menu',where='id=$imd',vars=locals())
            return lunch.write_json({'result':True,'message':'delete success'})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})