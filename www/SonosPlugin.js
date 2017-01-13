
var exec = require('cordova/exec');
var xmlhttp = new XMLHttpRequest();
var listIp;
var ip = "";

function setReadyState(action){
	xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/AVTransport/Control", true);

	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState != 4) return
			if (xmlhttp.status == 200) {
			} else {
				alert('Error, status' + xmlhttp.status);
			}
		}
		xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:AVTransport:1#'+action);
		xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
		xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
		xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
		xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
			<s:Body>
			<u:StopResponse xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
			<u:`+action+` xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
			<InstanceID>0</InstanceID>
			<Speed>1</Speed>
			</u:`+action+`>
			</u:StopResponse>
			</s:Body>
			</s:Envelope>`]);

	}
	function setMediaRenderer(action,val,success){
		var tag = '';
		switch(action){
			case 'SetVolume': tag = 'DesiredVolume';
			break;
			case 'SetBass': tag = 'DesiredBass';
			break;
			case 'SetTreble': tag = 'DesiredTreble';
			break;
			case 'SetLoudness': tag = 'DesiredLoudness';
			break;
			case 'SetMute': tag = 'DesiredMute';
			break;
			case 'GetVolume': tag = 'CurrentVolume';
			break;
			case 'GetBass': tag = 'CurrentBass';
			break;
			case 'GetTreble': tag = 'CurrentTreble';
			break;
			case 'GetLoudness': tag = 'CurrentLoudness';
			break;
			case 'GetMute': tag = 'CurrentMute';
			break;
		}

		xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/RenderingControl/Control", true);
		xmlhttp.onreadystatechange=function(){
			if (xmlhttp.readyState != 4) return

				if (xmlhttp.status == 200) {
					return success(parserXML(xmlhttp.responseText,tag));
				} else {
					alert('Error, status' + xmlhttp.status);
				}
			}
			var str = val!=null?'<'+tag+'>'+val+'</'+tag+'>' : "";

			xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:RenderingControl:1#'+action);
			xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
			xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
			xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
			xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
				<s:Body>
				<u:`+action+` xmlns:u="urn:schemas-upnp-org:service:RenderingControl:1"><InstanceID>0</InstanceID><Channel>Master</Channel>`+str+`</u:`+action+`>
				</s:Body>
				</s:Envelope>`]);

		}
		function parserXML(val,nodeName){
			parser = new DOMParser();
			xmlDoc = parser.parseFromString(val,"text/xml");
			return xmlDoc.getElementsByTagName(nodeName)[0] ? xmlDoc.getElementsByTagName(nodeName)[0].childNodes[0].nodeValue : undefined;
		}
		var answer;
		module.exports = {
			deviseIos : function(data){
				var listRooms = [];
				var self=this;
				function callback(res){listRooms.push(res);};
				listIp=data;
				for(let i=0;i<listIp.length;i++){
					self.getSpeakerInfoWithIp(listIp[i],callback);
				}
				setTimeout(function(){return answer(listIp,listRooms);},1000);
			},
			findDevise : function(success,error){
				answer = success;
				var listRooms = [];
				var self=this;
				function callback(res){listRooms.push(res);};
				exec(
					function(str) {
						listIp=str;
						for(let i=0;i<listIp.length;i++){
							self.getSpeakerInfoWithIp(listIp[i],callback);
						}
						setTimeout(function(){return success(listIp,listRooms);},1000);
					},
					function() {return error("ERROR!!!")},
					"SonosPlugin",
					"findSonos",
					[]
					);
			},
			selectDevise : function(devIp){
				ip = devIp;
			},
			play : function(){
				setReadyState('Play');
			},
			pause : function(){
				setReadyState('Pause');
			},
			stop : function(){
				setReadyState('Stop');
			},
			next : function(){
				setReadyState('Next');
			},
			prev : function(){
				setReadyState('Previous');
			},
			getVolume : function(success,error){
				setMediaRenderer('GetVolume',null,success,error);
			},
			setVolume : function(val){
				setMediaRenderer('SetVolume',val);
			},
			setBass : function(val){
				setMediaRenderer('SetBass',val);
			},
			getBass : function(success,error){
				setMediaRenderer('GetBass',null,success,error);
			},
			setMute : function(val){
				setMediaRenderer('SetMute',val);
			},
			getMute : function(success,error){
				setMediaRenderer('GetMute',null,success,error);
			},
			setTreble : function(val){
				setMediaRenderer('SetTreble',val);
			},
			getTreble : function(success,error){
				setMediaRenderer('GetTreble',null,success,error);
			},
			setLoudness : function(val){
				setMediaRenderer('SetLoudness',val);
			},
			getLoudness : function(success,error){
				setMediaRenderer('GetLoudness',null,success,error);
			},
			getSpeakerInfo(success,error){
				xmlhttp.open("GET", "http://"+ip+":1400/status/zp", true);

				xmlhttp.onreadystatechange=function(){
					if (xmlhttp.readyState != 4) return
						if (xmlhttp.status == 200) {
							let res = xmlhttp.responseText;
							let item = {
								'zone_name':'',
								'uid':'',
								'ZoneIcon':'',
								'SerialNumber':'',
								'SoftwareVersion':'',
								'HardwareVersion':'',
								'MACAddress':''
							};
							item['zone_name']=parserXML(res,'ZoneName');
							item['uid'] = parserXML(res,'LocalUID');
							item['ZoneIcon'] = parserXML(res,'ZoneIcon');
							item['SerialNumber'] = parserXML(res,'SerialNumber');
							item['SoftwareVersion'] = parserXML(res,'SoftwareVersion');
							item['HardwareVersion'] = parserXML(res,'HardwareVersion');
							item['MACAddress'] = parserXML(res,'MACAddress');
							return success(item);
						} else {
							alert('Error, status' + xmlhttp.status + xmlhttp.responseText);
							return error('ERROR!');
						}
					}
					xmlhttp.send(null);
				},
				getSpeakerInfoWithIp(curIp,success){
					xmlhttp.open("GET", "http://"+curIp+":1400/status/zp", true);

					xmlhttp.onreadystatechange=function(){
						if (xmlhttp.readyState != 4) return
							if (xmlhttp.status == 200) {
								let res = xmlhttp.responseText;
								var cb = parserXML(res,'ZoneName');
								return success(cb);
							} else {
								alert('Error, status' + xmlhttp.status + xmlhttp.responseText);
								return null;
							}
						}
						xmlhttp.send(null);
					},
					getTrackInfo : function(success,error){
						xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/AVTransport/Control", true);

						xmlhttp.onreadystatechange=function(){
							if (xmlhttp.readyState != 4) return
								if (xmlhttp.status == 200) {
									let item = {
										'playlist_position':'',
										'duration':'',
										'uri':'',
										'position':'',
										'TrackMetaData':''
									};

									item['playlist_position'] = +parserXML(xmlhttp.responseText,'Track');
									item['duration'] = parserXML(xmlhttp.responseText,'TrackDuration');
									item['uri'] = parserXML(xmlhttp.responseText,'TrackURI');
									item['position'] = parserXML(xmlhttp.responseText,'RelTime');
									item['TrackMetaData'] = parserXML(xmlhttp.responseText,'TrackMetaData');
									return success(item);
								} else {
									alert('error, status' + xmlhttp.status + xmlhttp.responseText);
									return error('ERROR!');
								}
							}
							xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo');
							xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
							xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
							xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
							xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
								<s:Body>
								<u:GetPositionInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
								<InstanceID>0</InstanceID>
								<Channel>Master</Channel>
								</u:GetPositionInfo>
								</s:Body>
								</s:Envelope>
								`]);
						},
						playTrackURI : function(uri){
							var self = this;
							var curUri = 'x-sonos-http:tr%3a'+uri+'.mp3?sid=2&amp;flags=8224&amp;sn=1';
							self.stop();
							xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/AVTransport/Control", true);

							xmlhttp.onreadystatechange=function(){
								if (xmlhttp.readyState != 4) return
									if (xmlhttp.status == 200) {
										self.play();
									} else {
										alert('Error, status' + xmlhttp.status + xmlhttp.responseText);
									}
								}
								xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI');
								xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
								xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
								xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
								xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
									<s:Body>
									<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
									<InstanceID>0</InstanceID>
									<CurrentURI>`+curUri+`</CurrentURI>
									<CurrentURIMetaData></CurrentURIMetaData>
									</u:SetAVTransportURI>
									</s:Body>
									</s:Envelope>`]);
							},
							playFromQueue(index){
								var self = this;
								xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/AVTransport/Control", true);

								xmlhttp.onreadystatechange=function(){
									if (xmlhttp.readyState != 4) return
										if (xmlhttp.status == 200) {
											xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/AVTransport/Control", true);

											xmlhttp.onreadystatechange=function(){
												if (xmlhttp.readyState != 4) return
													if (xmlhttp.status == 200) {
														self.play();
													} else {
														alert('Error, status' + xmlhttp.status + xmlhttp.responseText);
													}
												}

												xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:AVTransport:1#Seek');
												xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
												xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
												xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
												xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
													<s:Body>
													<u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
													<InstanceID>0</InstanceID>
													<Unit>TRACK_NR</Unit>
													<Target>`+index+`</Target>
													</u:Seek>
													</s:Body>
													</s:Envelope>`]);
											} else {
												alert('Error, status' + xmlhttp.status + xmlhttp.responseText);
											}
										}
										xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI');
										xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
										xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
										xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
										xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
											<s:Body>
											<u:SetAVTransportURI xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
											<InstanceID>0</InstanceID>
											<CurrentURI>x-rincon-queue:RINCON_949F3E1370C401400#0</CurrentURI>
											<CurrentURIMetaData></CurrentURIMetaData>
											</u:SetAVTransportURI>
											</s:Body>
											</s:Envelope>`]);
									},
									seek : function(timestamp){
										xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/AVTransport/Control", true);

										xmlhttp.onreadystatechange=function(){
											if (xmlhttp.readyState != 4) return

												if (xmlhttp.status == 200) {
												} else {
													alert('Error, status' + xmlhttp.status + xmlhttp.responseText);
												}
											}
											xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:AVTransport:1#Seek');
											xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
											xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
											xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
											xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
												<s:Body>
												<u:Seek xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
												<InstanceID>0</InstanceID>
												<Unit>REL_TIME</Unit>
												<Target>`+timestamp+`</Target>
												</u:Seek>
												</s:Body>
												</s:Envelope>`]);
										},
										setPlayMode(playmode){
											var mode = ['NORMAL','SHUFFLE_NOREPEAT','SHUFFLE','REPEAT_ALL'];
											xmlhttp.open("POST", "http://"+ip+":1400/MediaRenderer/AVTransport/Control", true);

											xmlhttp.onreadystatechange=function(){
												if (xmlhttp.readyState != 4) return
													if (xmlhttp.status == 200) {
													} else {
														alert('Error, status' + xmlhttp.status + xmlhttp.responseText);
													}
												}
												xmlhttp.setRequestHeader('SOAPAction', 'urn:schemas-upnp-org:service:AVTransport:1#SetPlayMode');
												xmlhttp.setRequestHeader('Content-type', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
												xmlhttp.setRequestHeader('Access-Control-Allow-Origin','*');
												xmlhttp.setRequestHeader('Content-Encoding', 'gzip, deflate, sdch, br');
												xmlhttp.send([`<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
													<s:Body>
													<u:SetPlayMode xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">
													<InstanceID>0</InstanceID>
													<NewPlayMode>`+mode[playmode]+`</NewPlayMode>
													</u:SetPlayMode>
													</s:Body>
													</s:Envelope>`]);
											}
										}
