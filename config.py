#-*- encoding=utf-8-*-
'''
Created on 2012-6-14

@author: wicki
'''

version = '0.9.1.5'

LOCATION_PRECISION = 5

REST_TYPES = {'0':'快餐',
              '1':'面食',
              '2':'饮料'}

MESSAGE_TYPE = {'restapply':0,
                'indexmessage':1}

MESSAGE = {'rest_apply_accept':u'恭喜您的开店申请已经被管理员通过。您可以在首页地图上右键点击开设店铺。',
           'rest_apply_reject':u'很遗憾，您的开店申请被管理员拒绝了。拒绝原因是:'}