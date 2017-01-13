/********* SonosPlugin.m Cordova Plugin Implementation *******/

#import <Cordova/CDV.h>

#import "GCDAsyncUdpSocket.h"

typedef void (^findDevicesBlock)(NSArray *ipAddresses);
@interface SonosPlugin : CDVPlugin <GCDAsyncUdpSocketDelegate>{}
- (void)findDevices:(findDevicesBlock)block;
- (void)stopDiscovery;
- (void)findSonos:(CDVInvokedUrlCommand*)command;
@property (nonatomic, strong) GCDAsyncUdpSocket *udpSocket;
@property (nonatomic, strong) findDevicesBlock completionBlock;
@property (nonatomic, strong) NSArray *ipAddressesArray;
@end

@implementation SonosPlugin
static SonosPlugin* _sharedSession = nil;
- (id)init
{
    self = [super init];
    return self;
};
- (void)findSonos:(CDVInvokedUrlCommand*)command
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        SonosPlugin *discover = self;
        [discover findDevices:^(NSArray *ipAdresses) {
        }];
    });
}

- (void)findDevices:(findDevicesBlock)block {
    self.completionBlock = block;
    self.ipAddressesArray = [NSArray array];
    self.udpSocket = [[GCDAsyncUdpSocket alloc] initWithDelegate:self delegateQueue:dispatch_get_main_queue()];
    
    NSError *error = nil;
    if(![self.udpSocket bindToPort:0 error:&error]) {
        NSLog(@"Error binding");
    }
    
    if(![self.udpSocket beginReceiving:&error]) {
        NSLog(@"Error receiving");
    }
    
    [self.udpSocket enableBroadcast:TRUE error:&error];
    if(error) {
        NSLog(@"Error enabling broadcast");
    }
    
    NSString *str = @"M-SEARCH * HTTP/1.1\r\nHOST: 239.255.255.250:1900\r\nMAN: \"ssdp: discover\"\r\nMX: 3\r\nST: urn:schemas-upnp-org:device:ZonePlayer:1\r\n\r\n";
    [self.udpSocket sendData:[str dataUsingEncoding:NSUTF8StringEncoding] toHost:@"239.255.255.250" port:1900 withTimeout:-1 tag:0];
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 2 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [self stopDiscovery];
        
        NSLog(@"ipAddressesArray%@",self.ipAddressesArray);
        NSError *error;
        NSData *jsonData = [NSJSONSerialization dataWithJSONObject:
                            self.ipAddressesArray options:NSJSONWritingPrettyPrinted error:&error];
        
        NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        NSLog(@"jsonString = %@",jsonString);
        NSMutableString *str = [NSMutableString stringWithString:@"window.cordova.plugins.SonosPlugin.deviseIos("];
        [str appendFormat:@"%@)",jsonString] ;
        
        [self.commandDelegate evalJs:str];
    });
}

- (void)stopDiscovery {
    [self.udpSocket close];
    self.udpSocket = nil;
    self.completionBlock(self.ipAddressesArray);
}

#pragma mark - GCDAsyncUdpSocketDelegate

- (void)udpSocket:(GCDAsyncUdpSocket *)sock didReceiveData:(NSData *)data fromAddress:(NSData *)address withFilterContext:(id)filterContext {
    NSString *msg = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    if(msg) {
        NSRegularExpression *reg = [[NSRegularExpression alloc] initWithPattern:@"http:\\/\\/(.*?)\\/" options:0 error:nil];
        NSArray *matches = [reg matchesInString:msg options:0 range:NSMakeRange(0, msg.length)];
        if (matches.count > 0) {
            NSTextCheckingResult *result = matches[0];
            NSString *matched = [msg substringWithRange:[result rangeAtIndex:0]];
            NSString *ip = [[matched substringFromIndex:7] substringToIndex:matched.length-13];
            self.ipAddressesArray = [self.ipAddressesArray arrayByAddingObject:ip];
        }
    }
}

@end
