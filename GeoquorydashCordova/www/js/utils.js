function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export { delay };

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export { isMobileDevice };