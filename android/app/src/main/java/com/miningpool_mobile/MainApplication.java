package com.miningpool_mobile;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.imagepicker.ImagePickerPackage;
import cn.jpush.reactnativejpush.JPushPackage;
// import io.realm.react.RealmReactPackage;
import com.remobile.filetransfer.RCTFileTransferPackage;
import com.remobile.toast.RCTToastPackage;
import com.remobile.zip.RCTZipPackage;
import com.rnfs.RNFSPackage;
import com.horcrux.svg.SvgPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.io.File;
import java.util.Arrays;
import java.util.List;

import javax.annotation.Nullable;

public class MainApplication extends Application implements ReactApplication {

  // 设置为 true 将不弹出 toast
  private boolean SHUTDOWN_TOAST = false;
  // 设置为 true 将不打印 log
  private boolean SHUTDOWN_LOG = false;

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new PickerPackage(),
        new ImageResizerPackage(),
        new ImagePickerPackage(),
        new JPushPackage(SHUTDOWN_TOAST, SHUTDOWN_LOG),
        // new RealmReactPackage(),
        new SvgPackage(),
        new VectorIconsPackage(),
        new RNDeviceInfo(),
        new RNFSPackage(),
        new RCTToastPackage(),
        new RCTZipPackage(),
        new RCTFileTransferPackage(),
        new BtccPackage()
      );
    }
    @Nullable
    @Override
    protected String getJSBundleFile() {
      super.getJSBundleFile();
      String jsBundleFile = getFilesDir().getAbsolutePath() + File.separator + UpdateModule.JS_BUNDLE_FILE;
      File file = new File(jsBundleFile);
      return file != null && file.exists() ? jsBundleFile : null;
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
