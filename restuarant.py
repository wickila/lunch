# --*-- encodeing=utf8 --*--

import web
import model
import lunch
import os
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
        adress = user_data.adress;
        user = lunch.get_current_user()
        dic = {'result':False,'type':0}
        if user and user.restnum==0:
            uid = user.id
            rests = model.db.query("select id from restuarant where username='%s'" % user.username)
            if len(rests)>0:
                return lunch.write_json({'result':False,'message':'you already have a shop'})
            rest_id = model.db.insert('restuarant',hash_location=geohash.encode(lat, lng, 12),name=rest_name,username=user.username,lat=lat,lng=lng,adress=adress,maxdistance=500)
            rest = model.db.query('select * from restuarant where id=$rest_id',vars=locals())[0]
            rest.created_time = str(rest.created_time).split('.')[0]
            model.db.update('user',where='id=$uid',restnum=1,vars=locals())
            user.restnum = 1
            dic = {'result':True,'message':'success','type':1,'rest':rest}
            return lunch.write_json(dic)
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class Edit():
    def POST(self):
        user_data = web.input()
        name = user_data.name
        rtype = int(user_data.rtype)
        description = user_data.description
        adress = user_data.adress
        phone = user_data.phone
        minprice = int(user_data.minprice)
        maxdistance = int(user_data.maxdistance)
        starttime = user_data.starttime
        endtime = user_data.endtime
        enabled = user_data.enabled == 'true'
        user = lunch.get_current_user()
        if user and user.permission > 0:
            username = user.username
            rid = model.db.update('restuarant',where='username=$username',name=name,rtype=rtype,description=description,adress=adress,telephone=phone,minprice=minprice,maxdistance=maxdistance,starttime=starttime,endtime=endtime,enabled=enabled,vars=locals())
            r = model.db.select('restuarant',where='username=$username',vars=locals())[0]
            r.created_time = str(r.created_time)
            return lunch.write_json({'result':True,'message':'modified success!','restuarant':r})
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})

class Avatar:
    def POST(self):
        user = lunch.get_current_user()
        if user:
            post_data = web.input(img={})
            filedir = '/static/upload/rest-avatar'
            if not os.path.isdir('.'+filedir):
                os.mkdir('.'+filedir)
            if 'img' in post_data: # to check if the file-object is created
                filepath=post_data.img.filename.replace('\\','/') # replaces the windows-style slashes with linux ones.
                filename=str(user.id)+'.'+filepath.split('/')[-1].split('.')[-1] # splits the and chooses the last part (the filename with extension)
                fout = open('.'+filedir +'/'+ filename,'wb') # creates the file where the uploaded file should be stored
                fout.write(post_data.img.file.read()) # writes the uploaded file to the newly created file.
                fout.close() # closes the file, upload complete.
                pydic = {'imgurl':filedir +'/'+ filename}
                username = user.username
                model.db.update('restuarant',avatarurl=pydic['imgurl'],where='username=$username',vars=locals())
                user.avatar_url = pydic['imgurl']
                web.header('Content-Type', 'application/json')
                return lunch.write_json(pydic)
        return lunch.write_json({'result':False,'message':'you have not login or you permission is not enough'})
    
class Comments:
    def GET(self,id):
        data = web.input()
        page_count=10
        try:
            page = int(data.page)
        except:
            page = 1
        sql = "select * from comment where rid=%d order by id desc LIMIT %d, %d" % (int(id),(page-1)*page_count,page_count)
        comments = model.db.query(sql)
        cmts = []
        for comment in comments:
            u = model.db.query("select avatarurl from user where username='%s'" % comment.username)
            avatarurl = ''
            if len(u) > 0:
                u = u[0]
                avatarurl = u.avatarurl
            comment.createdtime = str(comment.createdtime)
            comment['avatarurl'] = avatarurl
            cmts.append(comment)
        return lunch.write_json({'result':True,'message':'success','comments':cmts})