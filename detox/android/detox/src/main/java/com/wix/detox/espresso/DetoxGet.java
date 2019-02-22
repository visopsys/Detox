package com.wix.detox.espresso;

import static android.support.test.espresso.matcher.ViewMatchers.isAssignableFrom;

import android.support.test.espresso.UiController;
import android.support.test.espresso.ViewAction;
import android.support.test.espresso.ViewInteraction;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import org.hamcrest.Matcher;

public class DetoxGet {
  private static final String TAG = DetoxGet.class.getSimpleName();

  private static abstract class BaseViewAction implements ViewAction {
    @Override
    public Matcher<View> getConstraints() {
      return isAssignableFrom(View.class);
    }

    @Override
    public String getDescription() {
      return "getting text from a TextView";
    }
  }

  public static String getText(ViewInteraction i) {
    final String[] stringHolder = { null };
    i.perform(new BaseViewAction() {
      @Override
      public void perform(UiController uiController, View view) {
        Log.d(TAG, "view = " + view);

        if (view instanceof TextView) {
          TextView tv = (TextView) view; //Save, because of check in getConstraints()
          stringHolder[0] = tv.getText().toString();
          Log.d(TAG, "String = " + stringHolder[0]);
        }
      }
    });

    return stringHolder[0];
  }

  public static int getHeight(ViewInteraction i) {
    final Integer[] data = { -1 };

    i.perform(new BaseViewAction() {
      @Override
      public void perform(UiController uiController, View view) {
        data[0] = view.getHeight();
        Log.d(TAG, "height = " + data[0]);
      }
    });

    return data[0];
  }
}
