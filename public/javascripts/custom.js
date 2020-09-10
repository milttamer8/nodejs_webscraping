function deleteitem(id) {
    swal({
        title: "Confirm",
        text: "Are you sure to delete this Item?",
        icon: "success",
        button: "OK",
    })
        .then((willDelete) => {
            if (willDelete) {
                $('#loading').removeClass('d-none');
                $.ajax({
                    url: 'deleteitem',
                    method: 'POST',
                    data: { id }
                })
                    .done(function (res) {
                        $('#loading').addClass('d-none');

                        swal({
                            title: "Success",
                            text: "Deleted successfully.",
                            icon: "success",
                            button: "OK",
                        }).then((ok) => {
                            if (ok) {
                                location.reload();
                            }
                        })
                    })
            }
        })


}

function send() {
    // console.log('called');
    $.ajax({
        method: "GET",
        url: "getstatus",
        success: function (res) {
            if (res.message == 'working') {
                if ($('#status_img').hasClass('d-none')) {
                    $('#status_img').removeClass('d-none')
                }
                $('#status_text').html('Scraping is running');
                $('#down-csv').prop('disabled', true);
                $('#csv_txt').html('Zip CSV files');
            }
            if (res.message == 'finished') {
                if (!$('#status_img').hasClass('d-none')) {
                    $('#status_img').addClass('d-none')
                }
                $('#status_text').html('Scraping all done');

            }
            for (let j = 0; j < res.updates.length; j++) {
                $('#update_' + j).html(res.updates[j]);
            }
            if (res.downloaded_img == 'true') {
                $('#down-img').prop('disabled', true);
                $('#img_txt').html('Images zip finished already');
            } else {
                $('#down-img').prop('disabled', false);
                $('#img_txt').html('Zip Images');
            }
            if (res.downloaded_csv == 'true') {
                $('#down-csv').prop('disabled', true);
                $('#csv_txt').html('CSV zip finished already');
            } else {
                $('#down-csv').prop('disabled', false);
                $('#csv_txt').html('Zip CSV files');
            }
            setTimeout(function () {
                send();
            }, 60000);
        }
    });
}

$(() => {
    send();
    $('#datatable').DataTable();
    let i = 0;
    $('#btn-toggle').click(() => {
        i++;
        if (i % 2 == 1) {
            $('#tableview').addClass('d-none');
            $('#btn-toggle').addClass('btn-primary');
            $('#btn-toggle').html('View Table');
        } else {
            $('#tableview').removeClass('d-none');
            $('#btn-toggle').removeClass('btn-primary');
            $('#btn-toggle').html('Hide Table');
        }

    });
    $('#down-img').click(function () {
        $('#downloading_img').removeClass('d-none');
        $('#down-img').prop('disabled', true);
        $.ajax({
            url: 'download',
            method: 'GET'
        })
            .done((res) => {
                $('#downloading_img').addClass('d-none');
                $('#img_txt').html('Images zip finished already');
                if (res.status) {
                    swal({
                        title: "Success",
                        text: "Image zip finished successfully.",
                        icon: "success",
                        button: "OK",
                    })
                    // .then(async (ok) => {
                    //     if (ok) {
                    //         await location.reload();
                    //     }
                    // })
                }
            })
            .fail(function () {
                $('#downloading_csv').addClass('d-none');
                swal({
                    title: "Error",
                    text: "zip Failed",
                    icon: "warning",
                    button: "OK",
                });
            });

    });
    $('#down-csv').click(function () {
        $('#downloading_csv').removeClass('d-none');
        $('#down-csv').prop('disabled', true);
        $.ajax({
            url: 'downloadexecl',
            method: 'GET'
        })
            .done((res) => {
                $('#downloading_csv').addClass('d-none');
                $('#csv_txt').html('CSV zip finished already');
                if (res.status) {
                    swal({
                        title: "Success",
                        text: "CSV zip finished successfully.",
                        icon: "success",
                        button: "OK",
                    })
                    // .then(async (ok) => {
                    //     if (ok) {
                    //         $('#csv_txt').html('')
                    //     }
                    // })
                }
            })
            .fail(function () {
                $('#downloading_csv').addClass('d-none');
                swal({
                    title: "Error",
                    text: "zip Failed",
                    icon: "warning",
                    button: "OK",
                });
            });

    });

    $('#btn-add').click(function () {
        let url = $('#url').val();
        let description = $('#description').val();
        let wxcode = $('#wx-code').val();
        let albumname = $('#albumname').val();
        if (url == '' || description == '' || wxcode == '' || albumname == '') {
            swal({
                title: "Error",
                text: "please input all fields exactly.",
                icon: "warning",
                button: "OK",
            });
            return;
        }
        else {
            console.log(albumname)
            $('#loading').removeClass('d-none');
            $('#btn-add').prop('disabled', true);
        }
        $.ajax({
            url: 'addurl',
            method: 'POST',
            data: {
                url, description, wxcode, albumname
            }
        })
            .done(function (res) {
                $('#loading').addClass('d-none');
                $('#btn-add').prop('disabled', false);
                if (res.status) {

                    swal({
                        title: "Success",
                        text: "The URL is added successfully.",
                        icon: "success",
                        button: "OK",
                    })
                        .then(async (ok) => {
                            if (ok) {
                                await location.reload();
                            }
                        })
                }
                else {
                    swal({
                        title: "Error",
                        text: res.message,
                        icon: "warning",
                        button: "OK",
                    });
                }
            })//done
            .fail(function () {
                $('#btn-add').prop('disabled', false);
                $('#loading').addClass('d-none');
                swal({
                    title: "Error",
                    text: "This URL is existing already.",
                    icon: "warning",
                    button: "OK",
                });
            });//fail
    });//btn-add
});