createSplashScreen = function() {
    var logoWrapper = $('<div />').addClass('logo-wrapper');
    var logoContainer = $('<div />').addClass('logo').css({
        borderRadius: 20,
        boxShadow: "rgba(0, 0, 0, 0.3) 0 0 20px"
    }).append('<p style="margin: 0"><img src="/img/zoomood-logo.png" alt="Logo" /></p><p style="font-size: 2.0em; position: relative; top: -5px"><i class="icon-spinner icon-spin"></i> Loading canvas</p><p>Use <code>Space</code> and <code>Mouse</code> to zoom and pan. Press <code>x</code> to delete.</p></div>');
    logoWrapper.append(logoContainer);
    return $('<div />').attr('id', 'splash-screen').append(logoWrapper);
};