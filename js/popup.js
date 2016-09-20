document.addEventListener('DOMContentLoaded', function() {

    chrome.tabs.create({
        url: "phantomForm.html",
        active: true
    }, function(tab) {
        console.log('new tab callback')
    });

    //var submitFormButton = document.getElementById('submitForm');
    //submitFormButton.addEventListener('click', function() {
    //    //$.ajax({
    //    //    url: "https://dev-forever.virtual.optivmss.com/rest/container/58",
    //    //    username: "joe",
    //    //    password: "s0ftware",
    //    //    type: "GET",
    //    //    success: function(results){alert(results); },
    //    //    error: function(error){alert(error); }
    //    //});
    //    chrome.tabs.create({
    //        url: "phantomForm.html",
    //        active: true
    //    }, function(tab) {
    //        console.log('new tab callback')
    //    });
    //}, false);
}, false);