define(["events"],function(e){function a(e){if(!e.NowPlayingItem)return void o();s=e;var a=e.PlayState||{},t=MediaController.getNowPlayingNameHtml(e.NowPlayingItem)||"",n=t.split("<br/>"),r=1==n.length?"":n[0],i=n[n.length-1],g=e.NowPlayingItem.Album||"",p=e.NowPlayingItem.RunTimeTicks?e.NowPlayingItem.RunTimeTicks/1e7:0,y=a.PositionTicks?a.PositionTicks/1e7:0,m="",u=600,d=e.NowPlayingItem;d.PrimaryImageTag?m=ApiClient.getScaledImageUrl(d.PrimaryImageItemId,{type:"Primary",height:u,tag:d.PrimaryImageTag}):d.BackdropImageTag?m=ApiClient.getScaledImageUrl(d.BackdropItemId,{type:"Backdrop",height:u,tag:d.BackdropImageTag,index:0}):d.ThumbImageTag&&(m=ApiClient.getScaledImageUrl(d.ThumbImageItemId,{type:"Thumb",height:u,tag:d.ThumbImageTag}));var f=[r,i,g,m,p,y];try{window.remoteControls.updateMetas(l,c,f)}catch(h){c(h)}}function t(e,t){if("positionchange"==e.type){var n=(new Date).getTime();if(700>n-y)return;y=n}a(t)}function n(e,a){var n=this;n.beginPlayerUpdates(),t.call(n,e,a)}function r(e){var a=this;a.endPlayerUpdates(),o()}function i(){p&&(e.off(player,"playbackstart",n),e.off(player,"playbackstop",r),e.off(player,"playstatechange",t),e.off(player,"positionchange",t),p.endPlayerUpdates(),p=null,o())}function o(){var e="",a="",t="",n="",r=0,i=0,o=[e,a,t,n,r,i];try{window.remoteControls.updateMetas(l,c,o)}catch(g){c(g)}}function l(){}function c(e){}function g(a){i(),p=a,a.isLocalPlayer&&(a.getPlayerState().then(function(e){e.NowPlayingItem&&a.beginPlayerUpdates(),t.call(a,{type:"init"},e)}),e.on(a,"playbackstart",n),e.on(a,"playbackstop",r),e.on(a,"playstatechange",t),e.on(a,"positionchange",t))}var p,s,y=0;e.on(MediaController,"playerchange",function(){g(MediaController.getCurrentPlayer())}),g(MediaController.getCurrentPlayer()),document.addEventListener("remote-event",function(e){var a=e.remoteEvent;switch(a.subtype){case"playpause":MediaController.pause();break;case"play":MediaController.unpause();break;case"pause":MediaController.pause();break;case"prevTrack":MediaController.previousTrack();break;case"nextTrack":MediaController.nextTrack()}})});