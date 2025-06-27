$(document).ready(function () {
    $('#user-name').val("neo@gmail.com");
    $('#password').focus();
    $('#user-name').focus();
    
    $('#loginForm').submit(function (e) {
        e.preventDefault(); // Ngăn form submit mặc định

        const email = $('#user-name').val();
        const password = $('#password').val();
        const isRemember = $("#cbRemember").is(':checked');
        if( email.length<=1 ){
            // LOGIN
            $('#message').text('Please input id...');
            return;
        }
        if( password.length<=1 ){
            // LOGIN
            $('#message').text('Please input password...');
            return;
        }
        $('#message').text('Wait for login process...');

        $.ajax({
        url: '/api/login', // Endpoint đăng nhập
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password, isRemember }),
        success: function (response) {
            //console.log( response );
            if( response.code==true ){
                // Lưu token vào localStorage
                localStorage.setItem('token', response.token);
                //console.log( response );
                $('#message').text('Login successful!');
                setTimeout(() => {
                    //console.log( '/home/'+response.groupid );
                    window.location.href = '/home/'+response.groupid+"/"+response.func; 
                }, 1000);
            }
            else{
                $('#message').text(response.message);
            }
            
        },
        error: function (xhr) {
            const error = xhr.responseJSON ? xhr.responseJSON.message : 'Login failed';
            $('#message').text(error);
        },
        });
    });
});