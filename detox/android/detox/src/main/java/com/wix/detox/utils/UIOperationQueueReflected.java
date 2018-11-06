package com.wix.detox.utils;

import org.joor.Reflect;

public class UIOperationQueueReflected {
    private final static String LOCK_RUNNABLES = "mDispatchRunnablesLock";
    private final static String FIELD_DISPATCH_RUNNABLES = "mDispatchUIRunnables";

    private final static String LOCK_OPERATIONS = "mNonBatchedOperationsLock";
    private final static String FIELD_NON_BATCHES_OPERATIONS = "mNonBatchedOperations";

    private final static String METHOD_IS_EMPTY = "isEmpty";

    private final Reflect reflected;

    public UIOperationQueueReflected(Object uiOperationQueue) {
        this(Reflect.on(uiOperationQueue));
    }

    public UIOperationQueueReflected(Reflect reflected) {
        this.reflected = reflected;
    }

    public Object getRunnablesLock() {
        return this.reflected.field(LOCK_RUNNABLES).get();
    }

    public boolean hasRunnables() {
        return !((boolean) this.reflected.field(FIELD_DISPATCH_RUNNABLES).call(METHOD_IS_EMPTY).get());
    }

    public Object getNonBatchedOperationsLock() {
        return this.reflected.field(LOCK_OPERATIONS).get();
    }

    public boolean hasNonBatchedOperations() {
        return !((boolean) this.reflected.field(FIELD_NON_BATCHES_OPERATIONS).call(METHOD_IS_EMPTY).get());
    }

    public boolean isEmpty() {
        return this.reflected.call(METHOD_IS_EMPTY).get();
    }
}
