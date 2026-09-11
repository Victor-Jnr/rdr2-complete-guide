package io.github.victorjnr.rdr2guide;

import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        }
    }
}
