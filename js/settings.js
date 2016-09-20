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
        var uname=$(".usernameinput",$(this)).val().trim();
        var pwd=$(".passwordinput", $(this)).val().trim();
        var isDefault=$('.defaultradioinput',$(this)).is(':checked');
        var set = {
            'name': name,
            'url': url,
            'username': uname,
            'password': pwd,
            'isDefault': isDefault
        };
        if (uname!="" && pwd!="" && name!="" && url!=""){
            options.push(set);
        }
    });
    PC_CLIENT.storeItem("phantomapiprofiles",JSON.stringify(options));

    var miscOptions = {};
    PC_CLIENT.storeItem('miscOptions',JSON.stringify(miscOptions));

    // Update status to let user know options were saved.
    alert('Options Saved.');
    //$("#status").html("<div class='alert alert-block alert-success'>Options Saved.</div>").show().delay(5000).fadeOut('slow');
};
PC_CLIENT.settings.restore_options=function() {
    try {
        options = JSON.parse(PC_CLIENT.getItem("phantomapiprofiles"));
        for (i in options){
            PC_CLIENT.settings.addProfileRow(options[i]['name'],options[i]['url'],options[i]['username'],options[i]['password'],options[i]['isDefault']);
        }
    } catch(err) {
        console.log(err);
    }

    try{
        miscOptions=JSON.parse(PC_CLIENT.getItem("miscOptions"));
    } catch(err) {
        console.log(err);
    }
    PC_CLIENT.settings.addProfileRow('','','','', false,true);
};
PC_CLIENT.settings.test_settings = function(clickedbutton) {
    var remote = $(".urlinput",clickedbutton.parent().parent()).val().trim();
    var username = $(".usernameinput",clickedbutton.parent().parent()).val().trim();
    var password = $(".passwordinput",clickedbutton.parent().parent()).val().trim();

    function success() {
        alert("Test Connection Successful");
        //$("#status").html("<div class='alert alert-success'>Test Connection Successful.</div>").show().delay(2000).fadeOut('slow');
    }

    function fail(xhr, textStatus, error) {
        delay = 5000;
        html = "<div class='alert alert-danger'>Test Connection Failed: <b>" + error + "</b></div>";
        switch(xhr['status']) {
            case 0:
                html = '<div class="alert alert-danger">Please visit your CIF instance and  <a href="' + remote + '" target="_blank">accept the TLS certificate</a></div>';
                delay = 20000;
                break;

            case 401:
                html = "<div class='alert alert-danger'>Test Connection Failed: <b>" + error + "</b> be sure to check your Token.</div>";
                break;

            case 404:
                html = "<div class='alert alert-danger'>Test Connection Failed: <b>" + error + "</b> be sure to check your API location.</div>";
                break;
        }
        $("#status").html(html).show().delay(delay).fadeOut('slow');
    }

    phantom_connector.test_connection({
        host: remote,
        username: username,
        password: password,
        success: success,
        error: fail
    });
};
PC_CLIENT.settings.addProfileRow=function(name, url, username, password, isDefault){
    toappend='<tr class="profilerow">';
    toappend+='<td><input type="text" class="nameinput form-control"  placeholder="ex. Dev Phantom"/></td>';
    toappend+='<td><input type="text" class="urlinput form-control" placeholder="ex. https://example.com/rest/"/></td>';
    toappend+='<td><input type="text" class="usernameinput form-control" placeholder="ex. User"/></td>';
    toappend += '<td><input type="password" class="passwordinput form-control" placeholder="ex. Pwd!@#$" size="30"/></td>';
    toappend+='<td><button class="deletebutton">Delete</button> ';
    toappend+='<button class="testbutton">Test Connection</button></td>';
    toappend+='<td style="text-align: center;"><input type="radio" class="defaultradioinput" name="isdefault" disabled/></td>';
    toappend+='</tr>';

    $("#profilestable tbody").append(toappend);
    $(".nameinput").last().val(name);
    $(".urlinput").last().val(url);
    $(".usernameinput").last().val(username);
    if (password != '') {
        $(".passwordinput").last().val(password);
    }

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
        PC_CLIENT.settings.addProfileRow('','','',false,false);
    });

    $(document).on('click', '.testbutton', function(){
        PC_CLIENT.settings.test_settings($(this));
    });

    $(document).on('click', '.deletebutton', function(){
        if (!confirm('Are you sure you want to delete this profile?')) return false;
        $(this).parent().parent().remove();
        $("#status").html("<div class='alert alert-block alert-success'>Profile Removed.</div>").show().delay(5000).fadeOut('slow');
    });
});