if (!PC_CLIENT){
    var PC_CLIENT = {}
}

PC_CLIENT.form = {};
PC_CLIENT.form.apps = [];
PC_CLIENT.form.report_formats = [];

PC_CLIENT.form.create_container = function(callback){
    function success(response){
        PC_CLIENT.notify({
            text: "Successfully created the phantom container.",
            type: "success"
        });
        callback(response.id);
    }

    function error(xhr, textStatus, error) {
        PC_CLIENT.notify({
            text: "Failed to create the phantom container.",
            type: "error"
        });
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
        PC_CLIENT.notify({
            text: "Successfully created the container artifacts.",
            type: "success"
        });

        PC_CLIENT.form.clear();
    }

    function error(xhr, textStatus, error) {
        PC_CLIENT.notify({
            text: "Failed to create the container artifacts.",
            type: "error"
        });
    }

    var artifacts = Array();
    var searchType = $("#search_type").find(":selected").val();
    var searchVal = $("#search_val").val();
    var cef_val = {}
    cef_val[searchType] = searchVal
    var a = {
        container_id: container_id,
        name: $("#search_val").val(),
        label: 'CHEX',
        source_data_identifier: PC_CLIENT.generateUUID(),
        cef: cef_val,
        run_automation: true
    }

    var actions = $("#analysistools input:checked").not(":disabled").map(function(){ return $(this).data('val');}).get();
    var args = {
        actions: actions,
        report_format: $("#report_format").find(":selected").text(),
        report_template: $("#report_format").find(":selected").val(),
        email_to: $("#email_to").val()
    }

    var a2 = {
        container_id: container_id,
        name: 'Playbook Arguments',
        label: 'args',
        source_data_identifier: PC_CLIENT.generateUUID(),
        cef: {
            cs6Label: 'playbooks-args',
            cs6: JSON.stringify(args)
        },
        run_automation: false
    }

    artifacts.push(a2);
    artifacts.push(a);

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
PC_CLIENT.form.submit = function(){
    if(PC_CLIENT.form.validate_form()) {
        PC_CLIENT.form.create_container(PC_CLIENT.form.create_artifacts);
    }
};
PC_CLIENT.form.clear = function(){
    $("#search_type option:eq(0)").prop('selected', true);
    $("#search_val").val("")
    $("#analysistools input:checkbox").prop('checked', false);
    $("#report_format option:eq(0)").prop('selected', true);
    $("#email_to").val("");
};
PC_CLIENT.form.update_toolset = function(){
    var artifact_type = $("#search_type").find(":selected").val();
    var tools = PC_CLIENT.form.apps;

    if (artifact_type != ""){
        tools = $(PC_CLIENT.form.apps).filter(function(idx){
            var key = Object.keys(this)[0];
            return this[key].indexOf(artifact_type) >= 0;
        });
    }

    $("#analysistools li").addClass('disabled');
    $("#analysistools li input").attr('disabled', 'disabled');
    for(var i=0; i < tools.length; i++){
        var app = Object.keys(tools[i])[0];
        var tool = $("#analysistools").find("input[data-val='" + app.toLowerCase() +"']");
        tool.parent().removeClass('disabled');
        tool.removeAttr('disabled');
    }
    $("#analysistools li input:disabled").prop("checked", false);
};
PC_CLIENT.form.validate_form = function(){
    var search_type = $("#search_type").find(":selected").val();
    var search_val = $("#search_val").val();
    var tools = $("#analysistools input:checked").map(function(){ return $(this).data('val'); }).get();
    var rpt_format = $("#report_format").find(":selected").val();
    var email_to = $("#email_to").val();

    var valid = true;
    if (search_type == ""){ valid = false; PC_CLIENT.notify({text: "Search Type required!", type: "error"})};
    if (search_val == ""){ valid = false; PC_CLIENT.notify({text: "Search Term required!", type: "error"})};
    if (tools == ""){ valid = false; PC_CLIENT.notify({text: "At least 1 analysis tool must be selected!", type: "error"})};
    if (rpt_format == ""){ valid = false; PC_CLIENT.notify({text: "Report Format is required!", type: "error"})};
    if (email_to == ""){ valid = false; PC_CLIENT.notify({text: "Email To is required!", type: "error"})};

    return valid;
};

$(document).ready(function(){
    var settings = PC_CLIENT.getDefaultServer();
    phantom_connector.get_available_toolset({
        host: settings.url,
        username: settings.username,
        password: settings.password,
        success: function(response){
            var tools = $(response.content).map(function(){
                var obj = {};
                obj[this[0]] = this[1].split(',');
                return obj;
            }).get();

            PC_CLIENT.form.apps = tools;
            $("#analysistools").empty();
            for(var i=0; i < tools.length; i++){
                var app = Object.keys(tools[i])[0];
                var markup = '<li><input data-val="' + app.toLowerCase() + '" type="checkbox"/>' + app + '</li>';
                $("#analysistools").append(markup);
            }
        },
        error: function(xhr, textStatus, error) {
            alert(error);
        }
    });

    phantom_connector.get_available_formats({
        host: settings.url,
        username: settings.username,
        password: settings.password,
        success: function(response){
            PC_CLIENT.form.report_formats = response.content;
            $("#report_format").empty();
            $("#report_format").append('<option value="">Select One...</option>');
            for(var i=0; i < PC_CLIENT.form.report_formats.length; i++){
                var format = PC_CLIENT.form.report_formats[i];
                var markup = '<option value="' + format[1] + '">' + format[0] + '</option>';
                $("#report_format").append(markup);
            }
        },
        error: function(xhr, textStatus, error) {
            PC_CLIENT.notify({
                text: "Failed to retrieve the report formats!",
                type: "error"
            });
        }
    });

    $(document).on('change', '#search_type', function(){ PC_CLIENT.form.update_toolset() });
    $(document).on('click', '#submit', PC_CLIENT.form.submit);

    $(document).on('click', '.dropdown-menu a', function(){
       $(this).parents('.dropdown').find('.btn').html($(this).text() + '<span class="caret"></span>');
    });
});
