[![N|Solid](http://procoders.tech/art/powered.png)](http://procoders.tech/)

# Cordova Sonos Plugin
This plugin included all main functions for Sonos device :smirk:

## Installation
You may install latest version from master
```sh
cordova plugin add https://github.com/jeweller1980stepanets/cordova-plugin-sonos
```
### Removing the Plugin from project
```sh
cordova plugin rm cordova.plugin.sonos
```
## Supported Platforms
> - Android
> - iOS

:warning:after installation yuo must add meta in the head section in index.html file:
```html
<meta http-equiv="Content-Security-Policy" content="default-src  'self' 'unsafe-inline' data: gap: 'unsafe-eval'; style-src  'self' 'unsafe-inline'; connect-src  ; script-src  'self' 'unsafe-inline'; media-src *">
```

# Using the plugin

After device is ready you must defined the main variable:
```javascript
var sonos = window.cordova.plugins.SonosPlugin;
```
For determine the device
```javascript
function success(listIp,listRoomName){...};
function error(err){...};
sonos.findDevise(success,error);
```
> after you have received the answer you must select current device
```javascript
sonos.selectDevise(ip);
```
> ip - ip adress current devise

:thumbsup: *After this you may use all method in your code.*

## Methods
All methods returning promises, but you can also use standard callback functions.

```javascript
sonos.play(success,error);
sonos.pause(success,error);
sonos.stop(success,error);
sonos.next(success,error);
sonos.prev(success,error);
```
```javascript
sonos.setVolume(val);
sonos.getVolume(success,error);
```
> val - value between 0 - 100;
```javascript
sonos.setBass(val);
sonos.getBass(success,error);
```
> val - value between 0 - 10;
```javascript
sonos.setMute(val);
sonos.getMute(success,error);
```
> val - 0 or 1;
```javascript
sonos.setTrable(val);
sonos.getTrable(success,error);
```
> val - value betwenn 0 - 10;
```javascript
sonos.setLoudness(val);
sonos.getLoudness(success,error);
```
> val -  0 or 1;
```javascript
sonos.playTrackURI(id);
```
> id - track id
```javascript
sonos.playFromQueue(idx);
```
> idx - index track from queue
```javascript
sonos.seek(val);
```
> val - time in format HH:MM:SS
```javascript
sonos.playmode(val);
```
> val - value between 0 - 3;
> 0 - NORMAL;
> 1 - SHUFFLE_NOREPEAT;
> 2 - SHUFFLE;
> 3 - REPEAT_ALL.

```javascript
sonos.getSpeakerInfo(success,error);
```
> return Json object:
```javascript
{
	'zone_name':'',
	'uid':'',
	'ZoneIcon':'',
	'SerialNumber':'',
	'SoftwareVersion':'',
	'HardwareVersion':'',
	'MACAddress':''
}
```
```javascript
sonos.getTrackInfo(success,error);
```
> return Json object:
```javascript
{
	'playlist_position':'',
	'duration':'',
	'uri':'',
	'position':'',
	'TrackMetaData':''
};
```

### Authors
 - Aleksey Stepanets


[![N|Solid](http://procoders.tech/art/powered.png)](http://procoders.tech/)
