createSplashScreen = function() {
    var logoWrapper = $('<div />').addClass('logo-wrapper');
    var logoContainer = $('<div />').addClass('logo').css({
        borderRadius: 20,
        boxShadow: "rgba(0, 0, 0, 0.3) 0 0 20px"
    }).append('<p><img src="/img/zoomood-logo.png" alt="Logo" /></p><p style="font-size: 2.0em"><i class="icon-spinner"></i> Loading canvas</p></div>');
    logoWrapper.append(logoContainer);
    return $('<div />').attr('id', 'splash-screen').append(logoWrapper);
};