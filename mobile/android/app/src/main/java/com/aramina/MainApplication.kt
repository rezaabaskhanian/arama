package com.aramina

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  companion object {
    // باید با متادیتای default_notification_channel_id در AndroidManifest یکی باشد
    const val DEFAULT_CHANNEL_ID = "aramina_default"
    // کانال پیام‌های اضطراری (باید با type=crisis سمت بک‌اند یکی باشد)
    const val CRISIS_CHANNEL_ID = "aramina_crisis"
  }

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    createDefaultNotificationChannel()
  }

  // کانال‌های نوتیفیکیشن: یک کانال معمولی (heads-up) و یک کانال اضطراری که از
  // حالت «مزاحم نشوید» عبور می‌کند (اگر کاربر دسترسی DND را داده باشد).
  private fun createDefaultNotificationChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = getSystemService(NotificationManager::class.java) ?: return

    val default = NotificationChannel(
      DEFAULT_CHANNEL_ID,
      "اعلان‌های آرامینا",
      NotificationManager.IMPORTANCE_HIGH,
    )
    default.description = "پیام‌های همراهِ متخصص و یادآوری‌ها"
    manager.createNotificationChannel(default)

    val crisis = NotificationChannel(
      CRISIS_CHANNEL_ID,
      "پیام‌های فوری آرامینا",
      NotificationManager.IMPORTANCE_HIGH,
    )
    crisis.description = "پیام‌های اضطراری که حتی در حالت سکوت هم به تو می‌رسند"
    crisis.enableVibration(true)
    crisis.enableLights(true)
    crisis.setBypassDnd(true) // عبور از حالت «مزاحم نشوید» (نیازمند دسترسی DND کاربر)
    manager.createNotificationChannel(crisis)
  }
}
