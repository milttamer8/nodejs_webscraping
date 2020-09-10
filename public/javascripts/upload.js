function deleteitem(id) {
    swal({
        title: "Confirm",
        text: "Are you sure to delete this Item?",
        icon: "success",
        button: "OK",
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: 'deletekey',
                    method: 'POST',
                    data: { id }
                })
                    .done(function (res) {
                        swal({
                            title: "Success",
                            text: "Deleted successfully.",
                            icon: "success",
                            button: "OK",
                        })
                            .then((ok) => {
                                if (ok) {
                                    location.reload();
                                }
                            })
                    })
            }
        })
}

function deletepmtkey(id) {
    swal({
        title: "Confirm",
        text: "Are you sure to delete this Item?",
        icon: "success",
        button: "OK",
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: 'deletepmtkey',
                    method: 'POST',
                    data: { id }
                })
                    .done(function (res) {
                        swal({
                            title: "Success",
                            text: "Deleted successfully.",
                            icon: "success",
                            button: "OK",
                        })
                            .then((ok) => {
                                if (ok) {
                                    location.reload();
                                }
                            })
                    })
            }
        })
}

function deletenkey(id) {
    swal({
        title: "Confirm",
        text: "Are you sure to delete this Item?",
        icon: "success",
        button: "OK",
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: 'deletenkey',
                    method: 'POST',
                    data: { id }
                })
                    .done(function (res) {
                        swal({
                            title: "Success",
                            text: "Deleted successfully.",
                            icon: "success",
                            button: "OK",
                        })
                            .then((ok) => {
                                if (ok) {
                                    location.reload();
                                }
                            })
                    })
            }
        })
}
function deletetxtkey(id) {
    swal({
        title: "Confirm",
        text: "Are you sure to delete this Item?",
        icon: "success",
        button: "OK",
    })
        .then((willDelete) => {
            if (willDelete) {
                $.ajax({
                    url: 'deletetxtkey',
                    method: 'POST',
                    data: { id }
                })
                    .done(function (res) {
                        swal({
                            title: "Success",
                            text: "Deleted successfully.",
                            icon: "success",
                            button: "OK",
                        })
                            .then((ok) => {
                                if (ok) {
                                    location.reload();
                                }
                            })
                    })
            }
        })
}

$(() => {
    $.ajax({
        url: 'upstatus',
        method: 'GET'
    })
        .done((res) => {
            if (res.status) {
                $('#uploaddata').prop('disabled', true);
                $('#uploadimg').removeClass('d-none');
                $('#uploadtxt').html('Uploading...');
            }
            else {
                $('#uploaddata').prop('disabled', false);
                $('#uploadimg').addClass('d-none');
                $('#uploadtxt').html('Start to Upload');
            }
        })
    $('#datatable').DataTable();
    $('#pdatatable').DataTable();
    $('#ndatatable').DataTable();
    $('#txtdatatable').DataTable();
    //start upload images
    $('#uploaddata').click(() => {
        let album_name = $('#album_name option:selected').text();
        let token = $('#token').val();
        if (album_name == '' || token == '') {
            swal({
                title: "Error",
                text: "please input all fields exactly.",
                icon: "warning",
                button: "OK",
            });
            return;
        }
        else {
            $('#uploaddata').prop('disabled', true);
            $('#uploadimg').removeClass('d-none');
            $('#uploadtxt').html('Uploading...');
        }
        $.ajax({
            url: 'upload',
            method: 'POST',
            data: {
                album_name: album_name,
                token: token
            }
        })
            .done((res) => {
                $('#uploaddata').prop('disabled', false);
                $('#uploadimg').addClass('d-none');
                $('#uploadtxt').html('Upload finished');
                if (res.status) {
                    let duplicatedimage = 'Duplicated images are: \n' + res.duplicatedimage;
                    swal({
                        title: "Success",
                        text: "Upload finished",
                        icon: "success",
                        button: "OK",
                    })
                        .then(async (ok) => {
                            if (ok) {
                                $('#uploadtxt').html('Start to Upload');
                                alert(duplicatedimage);
                            }
                        })
                } else {
                    swal({
                        title: "Error",
                        text: "There is nothing to upload",
                        icon: "warning",
                        button: "OK",
                    });
                }
            })
            .fail(function () {
                $('#uploadimg').addClass('d-none');
                swal({
                    title: "Error",
                    text: "There is nothing to upload",
                    icon: "warning",
                    button: "OK",
                });
            });
    });

    $('#addkeyword').click(function () {
        let prop = $('#prop').val().trim();
        let value = $('#value').val().trim();

        if (prop == '' || value == '') {
            swal({
                title: "Error",
                text: "please input all fields exactly.",
                icon: "warning",
                button: "OK",
            });
            return;
        }
        else {
            $('#addkeyword').prop('disabled', true);
        }
        $.ajax({
            url: 'addkey',
            method: 'POST',
            data: {
                prop, value
            }
        })
            .done(function (res) {
                $('#addkeyword').prop('disabled', false);
                if (res.status) {
                    swal({
                        title: "Success",
                        text: "The Key is added successfully.",
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
                $('#addkeyword').prop('disabled', false);
                $('#loading').addClass('d-none');
                swal({
                    title: "Error",
                    text: "This URL is existing already.",
                    icon: "warning",
                    button: "OK",
                });
            });//fail
    });//btn-ad
    $('#pformbtn').click(() => {
        $('#keyform').addClass('d-none');
        $('#pform').removeClass('d-none');
    })
    $('#keyformbtn').click(() => {
        $('#pform').addClass('d-none');
        $('#keyform').removeClass('d-none');
    })

    $('#addpmt').click(() => {
        let wxcode = $('#wxcode option:selected').text();
        let pmtkey = $('#pmtkey').val().trim();

        if (wxcode == '' || pmtkey == '') {
            swal({
                title: "Error",
                text: "please input all fields exactly.",
                icon: "warning",
                button: "OK",
            });
            return;
        }
        else {
            $('#addpmt').prop('disabled', true);
        }
        $.ajax({
            url: 'addpmt',
            method: 'POST',
            data: {
                wxcode, pmtkey
            }
        })
            .done(function (res) {
                $('#addpmt').prop('disabled', false);
                if (res.status) {
                    swal({
                        title: "Success",
                        text: "The Permanent Key is added successfully.",
                        icon: "success",
                        button: "OK",
                    })
                        .then(async (ok) => {
                            if (ok) {
                                $('#pmtkey').val('');
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
                $('#addpmt').prop('disabled', false);
                $('#loading').addClass('d-none');
                swal({
                    title: "Error",
                    text: "This URL is existing already.",
                    icon: "warning",
                    button: "OK",
                });
            });//fail
    })

    $('#addnkey').click(() => {
        let wxcode = $('#wx_code option:selected').text();
        let nkey = $('#nkey').val().trim();

        if (wxcode == '' || nkey == '') {
            swal({
                title: "Error",
                text: "please input all fields exactly.",
                icon: "warning",
                button: "OK",
            });
            return;
        }
        else {
            $('#addnkey').prop('disabled', true);
        }
        $.ajax({
            url: 'addnkey',
            method: 'POST',
            data: {
                wxcode, nkey
            }
        })
            .done(function (res) {
                $('#addnkey').prop('disabled', false);
                if (res.status) {
                    swal({
                        title: "Success",
                        text: "The Permanent Key is added successfully.",
                        icon: "success",
                        button: "OK",
                    })
                        .then(async (ok) => {
                            if (ok) {
                                $('#nkey').val('');

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
                $('#addnkey').prop('disabled', false);
                $('#loading').addClass('d-none');
                swal({
                    title: "Error",
                    text: "This URL is existing already.",
                    icon: "warning",
                    button: "OK",
                });
            });//fail
    })

    $('#addtxtkey').click(() => {
        let wxcode = $('#wx_txt option:selected').text().trim();
        if (wxcode == '') {
            swal({
                title: "Error",
                text: "please input all fields exactly.",
                icon: "warning",
                button: "OK",
            });
            return;
        }
        else {
            $('#addtxtkey').prop('disabled', true);
        }
        $.ajax({
            url: 'addtxtkey',
            method: 'POST',
            data: {
                wxcode
            }
        })
            .done(function (res) {
                $('#addtxtkey').prop('disabled', false);
                if (res.status) {
                    swal({
                        title: "Success",
                        text: "The Permanent Key is added successfully.",
                        icon: "success",
                        button: "OK",
                    })
                        .then(async (ok) => {

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
                $('#addtxtkey').prop('disabled', false);
                $('#loading').addClass('d-none');
                swal({
                    title: "Error",
                    text: "This URL is existing already.",
                    icon: "warning",
                    button: "OK",
                });
            });//fail
    })

});
