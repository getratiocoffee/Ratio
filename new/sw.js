/* Ratio new-shell service worker — push notifications + notification click routing */
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('push',function(e){
  var d={};
  try{d=e.data?e.data.json():{};}catch(err){d={title:'Ratio',body:e.data?e.data.text():''};}
  e.waitUntil(self.registration.showNotification(d.title||'Ratio',{
    body:d.body||'',
    icon:'/new/icon-192.png',
    badge:'/new/icon-192.png',
    data:{url:d.url||'/new/'}
  }));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var url=(e.notification.data&&e.notification.data.url)||'/new/';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){
      if(list[i].url.indexOf('/new')>-1&&'focus' in list[i])return list[i].focus();
    }
    return self.clients.openWindow(url);
  }));
});
