if (!PC_CLIENT) {
    var PC_CLIENT = {};
}

PC_CLIENT.settings = {}

var options = new Array();
PC_CLIENT.settings.save_options = function(){
    options = [];
    $('.profilerow').each(function() {
        var name=$(".nameinput",$(this)).val().trim();
        var url=$(".urlinput",$(this)).val().trim();
        var token=$(".authinput",$(this)).val().trim();
        var isDefault=$('.defaultradioinput',$(this)).is(':checked');
        var set = {
            'name': name,
            'url': url,
            'auth_token': token,
            'isDefault': isDefault
        };
        if (token!="" && name!="" && url!=""){
            options.push(set);
        }
    });
    PC_CLIENT.storeItem("phantomapiprofiles",JSON.stringify(options));

    var miscOptions = {};
    PC_CLIENT.storeItem('miscOptions',JSON.stringify(miscOptions));

    // Update status to let user know options were saved.
    PC_CLIENT.notify({text: "Settings saved successfully", type: "success"});
};
PC_CLIENT.settings.restore_options=function() {
    try {
        options = JSON.parse(PC_CLIENT.getItem("phantomapiprofiles"));
        for (i in options){
            PC_CLIENT.settings.addProfileRow(options[i]['name'],options[i]['url'],options[i]['auth_token'],options[i]['isDefault']);
        }
    } catch(err) {
        console.log(err);
    }

    try{
        miscOptions=JSON.parse(PC_CLIENT.getItem("miscOptions"));
    } catch(err) {
        console.log(err);
    }
    PC_CLIENT.settings.addProfileRow('','','',false);
};
PC_CLIENT.settings.test_settings = function(clickedbutton) {
    var remote = $(".urlinput",clickedbutton.parent().parent()).val().trim();
    var token = $(".authinput",clickedbutton.parent().parent()).val().trim();

    function success() {
        PC_CLIENT.notify({text: "Test Connection Successful", type: "success"});
    }

    function fail(xhr, textStatus, error) {
        PC_CLIENT.notify({text: "Test Connection failed", type: "error"});
    }

    phantom_connector.test_connection({
        host: remote,
        token: token,
        success: success,
        error: fail
    });
};
PC_CLIENT.settings.addProfileRow=function(name, url, token, isDefault){
    toappend='<tr class="profilerow">';
    toappend+='<td><input type="text" class="nameinput form-control"  placeholder="ex. Dev Phantom"/></td>';
    toappend+='<td><input type="text" class="urlinput form-control" placeholder="ex. https://example.com/rest/"/></td>';
    toappend+='<td><input type="text" class="authinput form-control" placeholder="ex. joaisuf!jafslejf="/></td>';
    toappend+='<td><button class="deletebutton">Delete</button> ';
    toappend+='<button class="testbutton">Test Connection</button></td>';
    toappend+='<td style="text-align: center;"><input type="radio" class="defaultradioinput" name="isdefault" disabled/></td>';
    toappend+='</tr>';

    $("#profilestable tbody").append(toappend);
    $(".nameinput").last().val(name);
    $(".urlinput").last().val(url);
    $(".authinput").last().val(token);

    if (isDefault){
        $('.defaultradioinput').last().prop('checked',true);
    }
    $(".nameinput").last().keyup(function(){
        if ($(this).val().trim()!=""){
            $('.defaultradioinput',$(this).parent().parent()).removeAttr('disabled');
        } else {
            $('.defaultradioinput',$(this).parent().parent()).attr('disabled',true);
        }
    });
    if ($(".nameinput").last().val().trim()!=""){
        $('.defaultradioinput').last().removeAttr('disabled');
    } else {
        $('.defaultradioinput').last().attr('disabled',true);
    }

    if (!$("input[name='isdefault']:checked").val()) {
        $('.defaultradioinput').last().prop('checked',true);
    }
}

$(document).ready(function() {
    PC_CLIENT.settings.restore_options();
    $("#save_settings").click(function(){
        PC_CLIENT.settings.save_options();
    });

    $("#add_profile").click(function(){
        PC_CLIENT.settings.addProfileRow('','','',false);
    });

    $(document).on('click', '.testbutton', function(){
        PC_CLIENT.settings.test_settings($(this));
    });

    $(document).on('click', '.deletebutton', function(){
        if (!confirm('Are you sure you want to delete this profile?')) return false;
        $(this).parent().parent().remove();
        PC_CLIENT.notify({text: "Profile Removed", type: "success"});
    });
});