package com.wix.detox.espresso;

import android.support.annotation.NonNull;
import android.support.test.espresso.IdlingResource;
import android.util.Log;
import android.view.Choreographer;

import com.wix.detox.utils.ReactContextReflected;
import com.wix.detox.utils.UIModuleReflected;
import com.wix.detox.utils.UIOperationQueueReflected;

import org.joor.ReflectException;

/**
 * Created by simonracz on 26/07/2017.
 */

/**
 * <p>
 * Espresso IdlingResource for React Native's UI Module.
 * </p>
 *
 * <p>
 * Hooks up to React Native internals to grab the pending ui operations from it.
 * </p>
 */
public class ReactNativeUIModuleIdlingResource implements IdlingResource, Choreographer.FrameCallback {
    private static final String LOG_TAG = "Detox";

    private final static String CLASS_UI_MANAGER_MODULE = "com.facebook.react.uimanager.UIManagerModule";

    private ResourceCallback callback = null;
    private Object reactContext = null;

    public ReactNativeUIModuleIdlingResource(@NonNull Object reactContext) {
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return ReactNativeUIModuleIdlingResource.class.getName();
    }

    @Override
    public boolean isIdleNow() {
        Class<?> uiModuleClass = null;
        try {
            uiModuleClass = Class.forName(CLASS_UI_MANAGER_MODULE);
        } catch (ClassNotFoundException e) {
            Log.e(LOG_TAG, "UIManagerModule is not on classpath.");
            if (callback != null) {
                callback.onTransitionToIdle();
            }
            return true;
        }

        try {
            final ReactContextReflected reactContextRefl = new ReactContextReflected(reactContext);

            // reactContext.hasActiveCatalystInstance() should be always true here
            // if called right after onReactContextInitialized(...)
            if (reactContextRefl.getCatalystInstance() == null) {
                Log.e(LOG_TAG, "No active CatalystInstance. Should never see this.");
                return false;
            }

            if (!reactContextRefl.hasNativeModule(uiModuleClass)) {
                Log.e(LOG_TAG, "Can't find UIManagerModule.");
                if (callback != null) {
                    callback.onTransitionToIdle();
                }
                return true;
            }

            UIModuleReflected uiModuleReflected = new UIModuleReflected(reactContextRefl, uiModuleClass);
            UIOperationQueueReflected uiOperationQueueRefl = uiModuleReflected.getUIOperationsQueue();
            Object runnablesLock = uiOperationQueueRefl.getRunnablesLock();
            Object operationsLock = uiOperationQueueRefl.getNonBatchedOperationsLock();

            boolean runnablesAreEmpty;
            boolean nonBatchesOpsEmpty;
            synchronized (runnablesLock) {
                runnablesAreEmpty = !uiOperationQueueRefl.hasRunnables();
            }
            synchronized (operationsLock) {
                nonBatchesOpsEmpty = !uiOperationQueueRefl.hasNonBatchedOperations();
            }

            boolean isOperationQueueEmpty = uiOperationQueueRefl.isEmpty();

            if (runnablesAreEmpty && nonBatchesOpsEmpty && isOperationQueueEmpty) {
                if (callback != null) {
                    callback.onTransitionToIdle();
                }
                // Log.i(LOG_TAG, "UIManagerModule is idle.");
                return true;
            }

            Log.i(LOG_TAG, "UIManagerModule is busy.");
            Choreographer.getInstance().postFrameCallback(this);
            return false;
        } catch (ReflectException e) {
            Log.e(LOG_TAG, "Can't set up RN UIModule listener", e.getCause());
        }

        if (callback != null) {
            callback.onTransitionToIdle();
        }
        return true;
    }

    @Override
    public void registerIdleTransitionCallback(ResourceCallback callback) {
        this.callback = callback;

        Choreographer.getInstance().postFrameCallback(this);
    }

    @Override
    public void doFrame(long frameTimeNanos) {
        isIdleNow();
    }
}
