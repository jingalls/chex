function send_request(settings){
    clear_domain_cookies(settings.url, function(){
        $.ajax(settings);
    });
};
function clear_domain_cookies(domain, callback){
    chrome.cookies.getAll({"url": domain}, function(cookies){
        for (var i = 0; i < cookies.length; i++){
            var cookie = cookies[i];
            var prefix = cookie.secure ? "https://" : "http://";
            if (cookie.domain.charAt(0) == ".")
                prefix += "www";

            var url = prefix + cookie.domain + cookie.path;
            chrome.cookies.remove({"url": url, "name": cookies[i].name});
        }

        callback();
    });
};

var phantom_connector = {
    test_connection: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'container';

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "GET",
            "headers": {
                "ph-auth-token": args.token,
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            success: args.success,
            error: args.error
        }

        send_request(settings);
    },
    create_container: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'container';

        var data = {
            description: 'Test Incident from Chrome Extension',
            label: 'CHEX',
            name: 'Test Incident from Chrome Extension'
        };

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "POST",
            "headers": {
                "ph-auth-token": args.token,
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            "processData": false,
            "data": JSON.stringify(data),
            "success": args.success,
            "error": args.error
        }

        send_request(settings);
    },
    create_artifacts: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'artifact';

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "POST",
            "headers": {
                "ph-auth-token": args.token,
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            "processData": false,
            "data": JSON.stringify(args.data),
            success: args.success,
            error: args.error
        }

        send_request(settings);
    },
    get_available_toolset: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'decided_list/chrome_extension_tools';

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "GET",
            "headers": {
                "ph-auth-token": args.token,
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            success: args.success,
            error: args.error
        }

        send_request(settings);
    },
    get_available_formats: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'decided_list/chrome_extension_report_formats';

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "GET",
            "headers": {
                "ph-auth-token": args.token,
                "content-type": "application/json",
                "cache-control": "no-cache"
            },
            success: args.success,
            error: args.error
        }

        send_request(settings);
    }
}
