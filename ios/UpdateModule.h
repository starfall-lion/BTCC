//
//  UpdateModule.h
//  Secret
//
//  Created by user on 16/10/14.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
//#import "RCTBridgeModule.h"
#import <React/RCTBridgeModule.h>

@interface UpdateModule : NSObject<RCTBridgeModule>

+ (NSURL *)bundleURL;

@end
