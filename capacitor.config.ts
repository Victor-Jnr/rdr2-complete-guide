import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Android application ID is frozen as io.github.victorjnr.rdr2guide.
 * Changing it later installs as a different app and does not update existing installs.
 */
const config: CapacitorConfig = {
  appId: 'io.github.victorjnr.rdr2guide',
  appName: 'RDR2 Complete Guide',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: 'css',
      style: 'DARK',
      hidden: false,
    },
  },
};

export default config;
