package com.wix.detox.utils;

import org.joor.Reflect;

public class ReactContextReflected {
    private Reflect reflected;

    public ReactContextReflected(Object reactContext) {
        this.reflected = Reflect.on(reactContext);
    }

    public Object getCatalystInstance() {
        return this.reflected.field("mCatalystInstance").get();
    }

    public boolean hasNativeModule(Class<?> moduleClass) {
        return this.reflected.call("hasNativeModule", moduleClass).get();
    }

    public Object getNativeModule(Class<?> moduleClass) {
        return this.reflected.call("getNativeModule", moduleClass).get();
    }
}
