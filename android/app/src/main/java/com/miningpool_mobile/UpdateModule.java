package com.miningpool_mobile;

import android.app.Activity;
import android.app.Application;
import android.os.Environment;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.JSBundleLoader;
import com.reactnative.horsepush.HorsePushPatch;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by eddie on 4/9/2017.
 */
public class UpdateModule extends ReactContextBaseJavaModule {

    public static String  JS_BUNDLE_FILE = "index.android.bundle";

    public UpdateModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("documentPath", getReactApplicationContext().getFilesDir().getAbsolutePath());
        constants.put("jsBundleFile", JS_BUNDLE_FILE);
        return constants;
    }

    @ReactMethod
    public void restartApp(final Callback cb) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Activity activity = getCurrentActivity();
                    Application application = activity.getApplication();
                    ReactInstanceManager instanceManager = ((ReactApplication) application).getReactNativeHost().getReactInstanceManager();

                    JSBundleLoader loader = JSBundleLoader.createFileLoader(getBundleUrl());
                    Field loadField = instanceManager.getClass().getDeclaredField("mBundleLoader");
                    loadField.setAccessible(true);
                    loadField.set(instanceManager, loader);

                    final Method recreateMethod = instanceManager.getClass().getMethod("recreateReactContextInBackground");
                    final ReactInstanceManager finalizedInstanceManager = instanceManager;
                    recreateMethod.invoke(finalizedInstanceManager);

                    activity.recreate();
                } catch (Throwable err) {
                    Log.e("hot update", "Failed to restart application", err);
                    cb.invoke("Failed to restart application" + err.getMessage());
                }
            }
        });
//        Intent intent = activity.getIntent();
//        activity.finish();
//        activity.startActivity(intent);
    }

    @ReactMethod
    public void patchApply(int preVersion, int newVersion, Callback cb, Callback errCB){
        // Toast.makeText(getReactApplicationContext(),"合成",Toast.LENGTH_SHORT).show();
        String dir = getReactApplicationContext().getFilesDir().getAbsolutePath();
        String jsBundleFile = dir + File.separator + UpdateModule.JS_BUNDLE_FILE;
        File file = new File(jsBundleFile);
        // 第一次本地不存在，读安装包
        try {
            if(file == null || !file.exists()) {
                InputStream is = getReactApplicationContext().getAssets().open(JS_BUNDLE_FILE);
                File path = new File(Environment.getExternalStorageDirectory(), "btcc");
                if(!path.exists()){
                    path.mkdir();
                }
                BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(new File(path,UpdateModule.JS_BUNDLE_FILE)));
                byte[] buffer = new byte[1024];
                int len = -1;
                while((len = is.read(buffer)) != -1) {
                    bos.write(buffer,0,len);
                }
                bos.flush();
                bos.close();
                is.close();
//                assetManager.close();
                jsBundleFile = path + File.separator + UpdateModule.JS_BUNDLE_FILE;
            }
            String patchPath = dir + File.separator + preVersion + "-" + newVersion + ".jsPatches";
            if(!new File(patchPath).exists()) {
                errCB.invoke("没有找到补丁文件");
                return;
            }
            int result =  HorsePushPatch.patch(jsBundleFile, dir + File.separator + UpdateModule.JS_BUNDLE_FILE, patchPath);
            if(result == 0) {
                // Toast.makeText(getReactApplicationContext(),"成功",Toast.LENGTH_SHORT).show();
                File f = new File(Environment.getExternalStorageDirectory(), "/btcc/" + JS_BUNDLE_FILE);
                if(f.exists()){
                    f.delete();
                }
            }
            cb.invoke();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private String getBundleUrl() {
        return getReactApplicationContext().getFilesDir().getAbsolutePath() + File.separator + UpdateModule.JS_BUNDLE_FILE;
    }

    @Override
    public String getName() {
        return "UpdateModule";
    }
}
