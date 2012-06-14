# -*- encoding=utf-8 -*-
'''
Created on 2012-6-14

@author: wicki
'''

import lunch
import model
import web
import config

from geo import geohash

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

class Restuarant():
    def GET(self,id):
        q = model.db.select('resetuarant',where='id=$id',vars=locals())
        if len(q)>0:
            restuarant = q[0]
        return lunch.write_json({'result':True,'restuarant':restuarant})
    
class Menus():
    def GET(self,rid):
        q = model.db.select('menu',where='rid=$rid',vars=locals())
        menus = [menu for menu in q]
        return lunch.write_json({'result':True,'menus':menus})