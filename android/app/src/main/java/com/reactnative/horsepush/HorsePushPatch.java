package com.reactnative.horsepush;

/**
 * Created by lixiuzhi on 2016/4/12.
 */
public class HorsePushPatch {

    static {
        System.loadLibrary("HorsePushPatch");
    }

    /**
     * native方法 使用路径为oldApkPath的apk与路径为patchPath的补丁包，合成新的apk，并存储于newApkPath
     *
     * 返回：0，说明操作成功
     *
     * @param oldApkPath 示例:/sdcard/old.apk
     * @param newApkPath 示例:/sdcard/new.apk
     * @param patchPath  示例:/sdcard/xx.patch
     * @return
     */
    public static native int patch(String oldApkPath, String newApkPath, String patchPath);
}