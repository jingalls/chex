if (!PC_CLIENT) {
    var PC_CLIENT = {};
}

PC_CLIENT.getStorageContext = function() {
    return localStorage;
};

PC_CLIENT.storeItem = function(key, value) {
    var storage = PC_CLIENT.getStorageContext();
    return storage.setItem(key, value);
};
PC_CLIENT.getItem = function(key) {
    var storage = PC_CLIENT.getStorageContext();
    return storage.getItem(key);
};
PC_CLIENT.getDefaultServer=function(){
    servers = JSON.parse(PC_CLIENT.getItem("phantomapiprofiles"));
    for (i in servers){
        if (servers[i]['isDefault']) return servers[i];
    }
    return 0;
};
PC_CLIENT.getServerUrl=function(server){
    servers = JSON.parse(PC_CLIENT.getItem("phantomapiprofiles"));
    return servers[server]['url'];
};
PC_CLIENT.getServerKey=function(server){
    servers = JSON.parse(PC_CLIENT.getItem("phantomapiprofiles"));
    return servers[server]['key'];
};

PC_CLIENT.uri_escape=function( text, re ) {

    function pad( num ) {
        return num.length < 2 ? "0" + num : num;
    }

    return text.replace( re, function(v){
        return "%"+pad(v.charCodeAt(0).toString(16)).toUpperCase();
    });
}
PC_CLIENT.settingsCheck=function(){
    try{
        options = JSON.parse(PC_CLIENT.getItem("phantomapiprofiles"));
        if (options===null) options=new Array();
    } catch(err) {
        options = new Array();
    }
    if (options.length<1 || options == null){
        PC_CLIENT.switchToPage('content/settings.html');
        window.close();
        return false;
    }
    return true;
}
PC_CLIENT.generateUUID = function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};
PC_CLIENT.notify = function(args) {
    var n = noty({
        text: args.text,
        type: args.type,
        layout: 'topRight',
        theme: 'defaultTheme', // or 'relax'
        animation: {
            open: {height: 'toggle'}, // jQuery animate function property object
            close: {height: 'toggle'}, // jQuery animate function property object
            easing: 'swing', // easing
            speed: 500 // opening & closing animation speed
        },
        timeout: 5000
    });
};