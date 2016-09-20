var phantom_connector = {
    test_connection: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'container';

        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(args.username + ':' + args.password));
            },
            success: args.success,
            error: args.error,
            cache: args.cache || false
        });
    },
    create_container: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'container';

        var data = {
            description: 'Test Incident from Chrome Extension',
            label: 'Incident',
            name: 'Test Incident from Chrome Extension'
        };

        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(data),
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(args.username + ':' + args.password));
            },
            success: args.success,
            error: args.error,
            cache: args.cache || false
        });
    },
    create_artifacts: function(args) {
        var url = args.host;
        if (!url.endsWith('/')) { url += '/'; }
        url += 'artifact';

        $.ajax({
            url: url,
            type: 'POST',
            data: JSON.stringify(args.data),
            dataType: 'json',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + btoa(args.username + ':' + args.password));
            },
            success: args.success,
            error: args.error,
            cache: args.cache || false
        });
    }
}
