package com.watchly.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Set the theme to remove white screen flash
        setTheme(R.style.AppTheme_NoActionBar);
    }
}
