//
//  UpdateModule.m
//  Secret
//
//  Created by user on 16/10/14.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "UpdateModule.h"
#import <React/RCTBridge.h>
#import "BSDiff.h"
#import <React/RCTBundleURLProvider.h>

@implementation UpdateModule

@synthesize bridge = _bridge;

+ (NSURL *)bundleURL{
  NSString * jsBunbleFile = [NSString stringWithFormat:@"%@/%@", [UpdateModule documentPath], [UpdateModule jsBundleFile]];
  NSFileManager * fileManager=[NSFileManager defaultManager];
  if ([fileManager fileExistsAtPath:jsBunbleFile]) {
    return [NSURL fileURLWithPath:jsBunbleFile];
  }
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];
}

// 本地存储路径
+(NSString *)documentPath{
  NSString *documentPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory,  NSUserDomainMask, YES) firstObject];
  return documentPath;
}

+(NSString *)jsBundleFile{
  //index.ios.bundle文件
  NSString *jsBundleFile=@"index.ios.bundle";
  return jsBundleFile;
}

- (NSDictionary *)constantsToExport {
  return @{
    @"documentPath": [UpdateModule documentPath],
    @"jsBundleFile": [UpdateModule jsBundleFile]
  };
}

RCT_EXPORT_MODULE();
RCT_EXPORT_METHOD(restartApp:(RCTResponseSenderBlock)successCallback){
  // reload
  dispatch_async(dispatch_get_main_queue(), ^{
    [_bridge setValue:[[self class] bundleURL] forKey:@"bundleURL"];
    [_bridge reload];
  });
}

RCT_EXPORT_METHOD(patchApply:(int) preVersion
                  serverV:(int) newVersion
                  successCallback:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseSenderBlock)errorCallback) {
  NSString * jsBunbleFile = [NSString stringWithFormat:@"%@/%@", [UpdateModule documentPath], [UpdateModule jsBundleFile]];
  NSString * patchPath = [NSString stringWithFormat:@"%@/%d-%d.jsPatches", [UpdateModule documentPath], preVersion, newVersion];
  NSFileManager * fileManager = [NSFileManager defaultManager];
  if (![fileManager fileExistsAtPath:jsBunbleFile]) {
    NSString *mainbundle = [[NSBundle mainBundle] pathForResource:@"main" ofType:@"jsbundle"];
    if ([fileManager fileExistsAtPath:mainbundle]) {
      [fileManager copyItemAtPath:mainbundle toPath:jsBunbleFile error:nil];
    } else {
      errorCallback(@[@"no main.jsbunble"]);
      return;
    }
  }
  BOOL success = [BSDiff bsdiffPatch:patchPath origin:jsBunbleFile toDestination:jsBunbleFile];
  if (success) {
    successCallback(@[@(YES)]);
  } else {
    errorCallback(@[@(NO)]);
  }
}

@end
