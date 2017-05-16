$( document ).ready(function() {
    $('#generate-versioning').on('click', function(e){
        SPGetCurrentSite().done(function(webAddress) {
            doTheJob(webAddress);
        });
        $('#generate-versioning').hide();
        $('#generating-versioning').show();
    });

    $('#cancel-versioning').on('click', function(e){
        $('#generating-versioning').hide();
        $('#generate-versioning').show();
    })
});
