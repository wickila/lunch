# --*-- encodeing=utf8 --*--

import web
import model
import lunch

class New():
    def GET(self):
        user_data = web.input()
        lat = user_data.lat
        lon = user_data.lon
        return lunch.render("newrestuarant.html", {"lat":lat,"lon":lon})
    
    def POST(self):
        user_data = web.input()
        lat = float(user_data.lat)
        lon = float(user_data.lon)
        rest_name = user_data.rest_name
        return lunch.render("newrestuarant.html", {"lat":lat,"lon":lon,"rest_name":rest_name})