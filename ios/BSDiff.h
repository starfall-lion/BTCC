//
//  BSDiff.h
//  Secret
//
//  Created by user on 16/10/17.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface BSDiff : NSObject

+ (BOOL)bsdiffPatch:(NSString *)path
             origin:(NSString *)origin
      toDestination:(NSString *)destination;

@end
