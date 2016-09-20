if (!PC_CLIENT){
    var PC_CLIENT = {}
}

PC_CLIENT.form = {}
PC_CLIENT.form.create_container = function(callback){
    function success(response){
        alert(response);
        callback(response.id);
    }

    function error(xhr, textStatus, error) {
        alert(error);
    }

    var settings = PC_CLIENT.getDefaultServer();
    phantom_connector.create_container({
        host: settings.url,
        username: settings.username,
        password: settings.password,
        success: success,
        error: error
    });
};
PC_CLIENT.form.create_artifacts = function(container_id){
    function success(response){
        alert(response);
        callback(response.container_id);
    }

    function error(xhr, textStatus, error) {
        alert(error);
    }

    var artifacts = PC_CLIENT.form.get_ip_artifacts(container_id);
    artifacts = artifacts.concat(PC_CLIENT.form.get_domain_artifacts(container_id));
    artifacts = artifacts.concat(PC_CLIENT.form.get_hash_artifacts(container_id));
    artifacts = artifacts.concat(PC_CLIENT.form.get_url_artifacts(container_id));

    var settings = PC_CLIENT.getDefaultServer();
    phantom_connector.create_artifacts({
        host: settings.url,
        username: settings.username,
        password: settings.password,
        data: artifacts,
        success: success,
        error: error
    });
};
PC_CLIENT.form.get_ip_artifacts = function(container_id){
    var artifacts = Array();

    var ips = $("#ip_addresses").val().split('\n');
    for(var i = 0; i < ips.length; i++){
        if (ips[i] != "") {
            var a = {
                container_id: container_id,
                name: ips[i],
                label: 'Incident',
                source_data_identifier: PC_CLIENT.generateUUID(),
                cef: {
                    sourceAddress: ips[i]
                }
            }
            artifacts.push(a)
        }
    }

    return artifacts;
};
PC_CLIENT.form.get_domain_artifacts = function(container_id){
    var artifacts = Array();

    var domains = $("#domains").val().split('\n');
    for(var i = 0; i < domains.length; i++){
        if (domains[i] != "") {
            var a = {
                container_id: container_id,
                name: domains[i],
                label: 'Incident',
                source_data_identifier: PC_CLIENT.generateUUID(),
                cef: {
                    destinationDnsDomain: domains[i]
                }
            }
            artifacts.push(a)
        }
    }

    return artifacts;
};
PC_CLIENT.form.get_hash_artifacts = function(container_id){
    var artifacts = Array();

    var hashes = $("#hashes").val().split('\n');
    for(var i = 0; i < hashes.length; i++){
        if (hashes[i] != "") {
            var a = {
                container_id: container_id,
                name: hashes[i],
                label: 'Incident',
                source_data_identifier: PC_CLIENT.generateUUID(),
                cef: {
                    fileHash: hashes[i]
                }
            }
            artifacts.push(a)
        }
    }

    return artifacts;
};
PC_CLIENT.form.get_url_artifacts = function(container_id){
    var artifacts = Array();

    var urls = $("#urls").val().split('\n');
    for(var i = 0; i < urls.length; i++){
        if (urls[i] != "") {
            var a = {
                container_id: container_id,
                name: urls[i],
                label: 'Incident',
                source_data_identifier: PC_CLIENT.generateUUID(),
                cef: {
                    requestURL: urls[i]
                }
            }
            artifacts.push(a);
        }
    }

    return artifacts;
};
PC_CLIENT.form.submit = function(){
    PC_CLIENT.form.create_container(PC_CLIENT.form.create_artifacts);
};

$(document).ready(function(){
    $(document).on('click', '#submit', PC_CLIENT.form.submit);
});
