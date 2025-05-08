package io.ionic.starter;

import android.os.Build;
import android.os.Bundle;

import androidx.annotation.RequiresApi;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    requestAllPermissions();
  }


  private void requestAllPermissions() {
    String[] permissions = {
            android.Manifest.permission.BLUETOOTH,
            android.Manifest.permission.BLUETOOTH_ADMIN,
            android.Manifest.permission.BLUETOOTH_CONNECT,
            android.Manifest.permission.BLUETOOTH_SCAN,
            android.Manifest.permission.ACCESS_FINE_LOCATION,
            android.Manifest.permission.INTERNET,
            android.Manifest.permission.READ_MEDIA_IMAGES,
            android.Manifest.permission.READ_MEDIA_VIDEO,
            android.Manifest.permission.READ_MEDIA_AUDIO,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
            android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.ACCESS_COARSE_LOCATION,
            android.Manifest.permission.ACCESS_FINE_LOCATION,
            android.Manifest.permission.ACCESS_NETWORK_STATE,
            android.Manifest.permission.CAMERA,
            android.Manifest.permission.RECORD_AUDIO,
            android.Manifest.permission.MODIFY_AUDIO_SETTINGS,
            android.Manifest.permission.ACCESS_BACKGROUND_LOCATION
    };

    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
      requestPermissions(permissions, 1);
    }
  }
}
