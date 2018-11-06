package com.wix.detox.utils;

import org.joor.Reflect;

public class UIModuleReflected {
    private final Reflect reflected;

    public UIModuleReflected(ReactContextReflected reactContextReflected, Class<?> uiModuleClass) {
        this(reactContextReflected.getNativeModule(uiModuleClass));
    }

    public UIModuleReflected(Object uiModule) {
        this(Reflect.on(uiModule));
    }

    public UIModuleReflected(Reflect reflected) {
        this.reflected = reflected;
    }

    public UIOperationQueueReflected getUIOperationsQueue() {
        final Object uiOperationsQueue = this.reflected
                .call("getUIImplementation")
                .call("getUIViewOperationQueue")
                .get();
        return new UIOperationQueueReflected(uiOperationsQueue);
    }
}
