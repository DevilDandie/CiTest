window.debounce = function (fn, wait, immediate) {
    let timeout;
    return $A.getCallback(function () {
        let context = this;
        let args = arguments;
        const later = $A.getCallback(function () {
            timeout = null;
            if (!immediate) fn.apply(context, args);
        });
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) fn.apply(context, args);
    });
}