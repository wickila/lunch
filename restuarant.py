# --*-- encodeing=utf8 --*--

import web
import model
import lunch
from geo import geohash

class New():
    def GET(self):
        user_data = web.input()
        lat = user_data.lat
        lng = user_data.lng
        return lunch.render("newrestuarant.html", {"lat":lat,"lng":lng})
    
    def POST(self):
        user_data = web.input()
        lat = float(user_data.lat)
        lng = float(user_data.lng)
        rest_name = user_data.rest_name
        user = lunch.get_current_user()
        dic = {'result':False,'type':0}
        if user:
            rest_id = model.db.insert('restuarant',hash_location=geohash.encode(lat, lng, 12),name=rest_name,uid=user.id,lat=lat,lng=lng)
            rest = model.db.query('select * from restuarant where id=$rest_id',vars=locals())[0]
            rest.created_time = str(rest.created_time).split('.')[0]
            dic = {'result':True,'type':1,'rest':rest}
        return lunch.write_json(dic)