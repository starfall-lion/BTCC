//
//  BSDiff.m
//  Secret
//
//  Created by user on 16/10/17.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "BSDiff.h"
#include "bspatch.h"

@implementation BSDiff

+ (BOOL)bsdiffPatch:(NSString *)patchPath
             origin:(NSString *)origin
      toDestination:(NSString *)destination
{
  if (![[NSFileManager defaultManager] fileExistsAtPath:patchPath]) {
    return NO;
  }
  if (![[NSFileManager defaultManager] fileExistsAtPath:origin]) {
    return NO;
  }
  
  int err = patch([origin UTF8String], [destination UTF8String], [patchPath UTF8String]);
  if (err) {
    return NO;
  }
  return YES;
}

@end
